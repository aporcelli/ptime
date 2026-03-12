// lib/schemas/client.ts
import { z } from "zod";

export const clientFormSchema = z.object({
  nombre:   z.string().min(2, "Mínimo 2 caracteres").max(150),
  email:    z.string().email("Email inválido"),
  telefono: z.string().max(30).optional(),
  activo:   z.boolean().default(true),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// lib/schemas/config.ts (inlined here for brevity)
export const configSchema = z.object({
  precioBase:   z.number().positive(),
  precioAlto:   z.number().positive(),
  umbralHoras:  z.number().positive(),
}).refine(
  (d) => d.precioAlto > d.precioBase,
  { message: "precio_alto debe ser mayor que precio_base", path: ["precioAlto"] }
);
