import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

// Register (API)
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: passwordSchema,
});

// Register (form)
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Change password
const changePasswordBase = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// API
export const changePasswordSchema = changePasswordBase.refine(
  (d) => d.currentPassword !== d.newPassword,
  { message: "New password must be different from the current one", path: ["newPassword"] }
);

// Form
export const changePasswordFormSchema = changePasswordBase
  .extend({ confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });