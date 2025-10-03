import { z } from "zod"

export const creatureSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres"),
  race: z.enum(["Elf", "Orc", "Dwarf", "Hobbit", "Man", "Ent", "Maiar", "Other"], {
    required_error: "Debes seleccionar una raza",
  }),
  habitat: z.string().max(60, "El hábitat no puede exceder 60 caracteres").optional().or(z.literal("")),
  abilities: z.array(z.string().min(2).max(30)).max(10, "Máximo 10 habilidades").optional(),
  alignment: z.enum(["GOOD", "EVIL", "NEUTRAL"], {
    required_error: "Debes seleccionar un alineamiento",
  }),
  lore: z.string().max(2000, "La historia no puede exceder 2000 caracteres").optional().or(z.literal("")),
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
