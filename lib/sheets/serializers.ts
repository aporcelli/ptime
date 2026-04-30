import { PRICING_DEFAULTS } from "@/lib/constants";
import type { Cliente, Proyecto, RegistroHoras, Tarea } from "@/types/entities";

export function parseSheetDate(value: unknown): string {
  if (typeof value === "number") {
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  }
  if (typeof value !== "string") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  return value;
}

export function parseNum(value: unknown, fallback = 0): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseBool(value: unknown): boolean {
  return ["true", "1", "si", "sí", "yes"].includes(String(value ?? "").trim().toLowerCase());
}

const optionalString = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
};

export function parseClienteRow(row: unknown[]): Cliente {
  return {
    id: String(row[0] ?? "").trim(),
    nombre: String(row[1] ?? ""),
    email: String(row[2] ?? ""),
    ...(optionalString(row[3]) ? { telefono: optionalString(row[3]) } : {}),
    activo: parseBool(row[4]),
    created_at: String(row[5] ?? ""),
    updated_at: String(row[6] ?? ""),
  };
}

export function parseProyectoRow(row: unknown[]): Proyecto {
  const estado = String(row[8] ?? "").trim().toLowerCase();
  return {
    id: String(row[0] ?? "").trim(),
    nombre: String(row[1] ?? ""),
    cliente_id: String(row[2] ?? "").trim(),
    ...(row[3] === undefined || row[3] === "" ? {} : { presupuesto_horas: parseNum(row[3]) }),
    horas_acumuladas: parseNum(row[4], 0),
    umbral_precio_alto: parseNum(row[5], PRICING_DEFAULTS.umbralHoras),
    precio_base: parseNum(row[6], PRICING_DEFAULTS.precioBase),
    precio_alto: parseNum(row[7], PRICING_DEFAULTS.precioAlto),
    estado: (["activo", "pausado", "cerrado"].includes(estado) ? estado : "activo") as Proyecto["estado"],
    created_at: String(row[9] ?? ""),
    updated_at: String(row[10] ?? ""),
  };
}

export function parseTareaRow(row: unknown[]): Tarea {
  return {
    id: String(row[0] ?? ""),
    nombre: String(row[1] ?? ""),
    ...(optionalString(row[2]) ? { categoria: optionalString(row[2]) } : {}),
    activa: parseBool(row[3]),
    created_at: String(row[4] ?? ""),
  };
}

export function parseRegistroHorasRow(row: unknown[]): RegistroHoras {
  const horas = parseNum(row[5], 0);
  return {
    id: String(row[0] ?? ""),
    proyecto_id: String(row[1] ?? ""),
    tarea_id: String(row[2] ?? ""),
    usuario_id: String(row[3] ?? ""),
    fecha: parseSheetDate(row[4]),
    horas,
    descripcion: String(row[6] ?? ""),
    precio_hora_aplicado: parseNum(row[7], 0),
    monto_total: parseNum(row[8], 0),
    estado: (row[9] ?? "confirmado") as RegistroHoras["estado"],
    created_at: String(row[10] ?? ""),
    updated_at: String(row[11] ?? ""),
    ...(optionalString(row[12]) ? { cliente_id: optionalString(row[12]) } : {}),
    horas_trabajadas: parseNum(row[13], horas),
    horas_a_cobrar: parseNum(row[14], horas),
  };
}

export function serializeRegistroHorasRow(data: Omit<RegistroHoras, "created_at" | "updated_at"> | RegistroHoras, timestamps?: { created_at: string; updated_at: string }) {
  const created = "created_at" in data ? data.created_at : timestamps?.created_at ?? "";
  const updated = "updated_at" in data ? data.updated_at : timestamps?.updated_at ?? "";
  return [
    data.id, data.proyecto_id, data.tarea_id, data.usuario_id, data.fecha, data.horas,
    data.descripcion, data.precio_hora_aplicado, data.monto_total, data.estado, created,
    updated, data.cliente_id ?? "", data.horas_trabajadas ?? data.horas, data.horas_a_cobrar ?? data.horas,
  ];
}
