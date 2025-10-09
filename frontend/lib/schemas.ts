import { z } from "zod"

export const creatureSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(60, "El nombre no puede exceder 60 caracteres"),
  race: z.string().min(1, "La raza es requerida").max(30, "La raza no puede exceder 30 caracteres"),
  class: z.enum(
    [
      "mago",
      "caballero",
      "ladron",
      "explorador",
      "clerigo",
      "bardo",
      "druida",
      "paladin",
      "asesino",
      "brujo",
      "monje",
      "barbaro",
    ],
    {
      errorMap: () => ({ message: "La clase es requerida" }),
    },
  ),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
})

export type CreatureFormData = z.infer<typeof creatureSchema>

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
