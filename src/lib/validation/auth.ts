import { z } from "zod";
import { ROLES } from "@/lib/rbac";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255);

/** Enterprise password policy: min 8, upper+lower+digit. */
export const passwordSchema = z
  .string()
  .min(8, { message: "At least 8 characters" })
  .max(128, { message: "Too long" })
  .refine((v) => /[A-Z]/.test(v), { message: "Include an uppercase letter" })
  .refine((v) => /[a-z]/.test(v), { message: "Include a lowercase letter" })
  .refine((v) => /\d/.test(v), { message: "Include a number" });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    displayName: z.string().trim().min(2, { message: "Name is too short" }).max(80),
    password: passwordSchema,
    confirm: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email: emailSchema });
export const magicLinkSchema = z.object({ email: emailSchema });

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  language: z.string().min(2).max(10),
  timezone: z.string().min(1).max(64),
  theme: z.enum(["system", "light", "dark"]),
  avatarUrl: z.string().url().max(512).nullable().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const invitationSchema = z.object({
  email: emailSchema,
  role: z.enum(ROLES),
});
export type InvitationInput = z.infer<typeof invitationSchema>;

export const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, { message: "Lowercase letters, digits and hyphens only" }),
  type: z.enum(["platform", "federation", "association", "academy", "club"]),
});
