import { z } from "zod";
import { HORA_MIN, HORA_MAX, DESCRIPCION_MIN, DESCRIPCION_MAX } from "@/lib/constants";

export const hourFormSchema = z.object({
  cliente_id: z.string().min(1, "El cliente es obligatorio"),
  proyecto_id: z
    .string()
    .min(1, "Selecciona un proyecto")
    .uuid("Selecciona un proyecto válido"),
  tarea_id: z
    .string()
    .min(1, "Selecciona una tarea")
    .uuid("Selecciona una tarea válida"),
  fecha: z
    .string({ required_error: "La fecha es requerida" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato requerido: YYYY-MM-DD"),
  horas: z
    .number({ required_error: "Ingresa las horas", invalid_type_error: "Debe ser un número" })
    .min(HORA_MIN, `Mínimo ${HORA_MIN} horas (15 minutos)`)
    .max(HORA_MAX, `Máximo ${HORA_MAX} horas por registro`),
  descripcion: z
    .string({ required_error: "Describe el trabajo realizado" })
    .min(DESCRIPCION_MIN, `Descripción mínima de ${DESCRIPCION_MIN} caracteres`)
    .max(DESCRIPCION_MAX, `Máximo ${DESCRIPCION_MAX} caracteres`)
    .transform((v) => v.trim()),
  estado: z
    .enum(["borrador", "confirmado", "facturado"])
    .default("confirmado"),
});

export type HourFormData = z.infer<typeof hourFormSchema>;
