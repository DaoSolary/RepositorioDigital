import { z } from "zod";
import { msg } from "@/lib/validators/messages";

export const emailSchema = z.string().email(msg.email).max(254);

export const passwordSchema = z.string().min(6, msg.passwordMin);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});
