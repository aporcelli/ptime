import { z } from "zod";

export const projectFormSchema = z.object({
  nombre:             z.string().min(2, "Mínimo 2 caracteres").max(100),
  cliente_id:         z.string().optional().default(""),  // puede estar vacío
  presupuesto_horas:  z.number().positive().optional(),
  umbral_precio_alto: z.number().positive().default(20),
  precio_base:        z.number().positive().default(35),
  precio_alto:        z.number().positive().default(45),
  estado:             z.enum(["activo", "pausado", "cerrado"]).default("activo"),
}).refine(
  (d) => d.precio_alto > d.precio_base,
  { message: "El precio alto debe ser mayor al precio base", path: ["precio_alto"] }
);

export type ProjectFormData = z.infer<typeof projectFormSchema>;
