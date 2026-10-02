// components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerSchema } from "@/app/lib/validation";

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;

export default function RegisterForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    // 1. Client-side validation
    const parsed = registerSchema.safeParse({
      name: values.name.trim() || undefined, // blank name = not provided
      email: values.email,
      password: values.password,
    });

    const fieldErrors: FieldErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
    }
    if (values.password !== values.confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }
    if (!parsed.success || fieldErrors.confirmPassword) {
      setErrors(fieldErrors);
      return;
    }

    // 2. Call the register API
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          const serverErrors: FieldErrors = {};
          for (const i of data.issues) serverErrors[i.field as keyof FieldErrors] ??= i.message;
          setErrors(serverErrors);
        } else {
          setFormError(data.error ?? "Something went wrong");
        }
        return;
      }

      // 3. Log the user in
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        callbackUrl: "/",
      });
      if (result?.error) setFormError("Registered, but automatic sign-in failed. Please log in.");
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
      <h1 className="text-2xl font-semibold">Create an account</h1>

      {formError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</p>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Name (optional)</label>
        <input id="name" name="name" value={values.name} onChange={handleChange} className={inputClass} />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} className={inputClass} />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} className={inputClass} />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} className={inputClass} />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}