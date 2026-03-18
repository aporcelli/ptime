// lib/schemas/config.ts
// Schema Zod para la configuración global de precios
import { z } from "zod";

export const configSchema = z.object({
  precioBase:  z.number().positive("Debe ser un número positivo"),
  precioAlto:  z.number().positive("Debe ser un número positivo"),
  umbralHoras: z.number().positive("Debe ser un número positivo"),
}).refine(
  (d) => d.precioAlto > d.precioBase,
  { message: "El precio alto debe ser mayor al precio base", path: ["precioAlto"] }
);

export const appConfigFormSchema = z.object({
  precio_base_global:   z.number().positive("Debe ser un número positivo"),
  precio_alto_global:   z.number().positive("Debe ser un número positivo"),
  umbral_horas_global:  z.number().positive("Debe ser un número positivo"),
  moneda:               z.string().min(1).max(10).default("USD"),
  nombre_empresa:       z.string().min(1).max(100).optional(),
  logo_url:             z.string().url().optional().or(z.literal("")),
}).refine(
  (d) => d.precio_alto_global > d.precio_base_global,
  { message: "El precio alto debe ser mayor al precio base", path: ["precio_alto_global"] }
);

export type ConfigFormData = z.infer<typeof appConfigFormSchema>;
