import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Contraseña requerida" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { error: "El nombre debe tener al menos 2 caracteres" }).trim(),
  email: z.email({ error: "Email inválido" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Mínimo 8 caracteres" })
    .regex(/[A-Z]/, { error: "Debe contener al menos una mayúscula" })
    .regex(/[0-9]/, { error: "Debe contener al menos un número" }),
  dni: z
    .string()
    .regex(/^\d{6,12}$/, { error: "El DNI debe tener entre 6 y 12 dígitos" })
    .optional()
    .or(z.literal("")),
  company: z.string().max(100, { error: "Máximo 100 caracteres" }).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Contraseña actual requerida" }),
    newPassword: z
      .string()
      .min(8, { error: "Mínimo 8 caracteres" })
      .regex(/[A-Z]/, { error: "Debe contener al menos una mayúscula" })
      .regex(/[0-9]/, { error: "Debe contener al menos un número" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
