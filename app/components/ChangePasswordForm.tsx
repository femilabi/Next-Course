"use client";

import { useState } from "react";
import { changePasswordFormSchema } from "@/app/lib/validation";

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePasswordForm() {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setErrors({});

    const parsed = changePasswordFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldName;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          const serverErrors: FieldErrors = {};
          for (const i of data.issues) {
            serverErrors[i.field as FieldName] ??= i.message;
          }
          setErrors(serverErrors);
        } else {
          setFormError(data.error ?? "Something went wrong");
        }
        return;
      }

      setSuccess("Password updated successfully.");
      setValues(emptyValues);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Change password</h1>

      {formError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>
      )}

      <div>
        <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password"
          value={values.currentPassword} onChange={handleChange} className={inputClass} />
        {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">New password</label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password"
          value={values.newPassword} onChange={handleChange} className={inputClass} />
        {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">Confirm new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
          value={values.confirmPassword} onChange={handleChange} className={inputClass} />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}