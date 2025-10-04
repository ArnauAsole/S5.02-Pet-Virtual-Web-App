import { z } from "zod"

export const creatureSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(60, "El nombre no puede exceder 60 caracteres"),
  race: z.string().min(1, "La raza es requerida").max(30, "La raza no puede exceder 30 caracteres"),
  color: z.string().max(20, "El color no puede exceder 20 caracteres").optional().or(z.literal("")),
  maxHealth: z
    .number()
    .min(1, "La salud máxima debe ser al menos 1")
    .max(200, "La salud máxima no puede exceder 200")
    .default(100),
  attackBase: z
    .number()
    .min(0, "El ataque base no puede ser negativo")
    .max(50, "El ataque base no puede exceder 50")
    .default(5),
  defenseBase: z
    .number()
    .min(0, "La defensa base no puede ser negativa")
    .max(50, "La defensa base no puede exceder 50")
    .default(3),
  accessories: z
    .array(z.string().max(20, "Cada accesorio no puede exceder 20 caracteres"))
    .max(10, "Máximo 10 accesorios")
    .default([]),
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
