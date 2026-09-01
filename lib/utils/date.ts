// lib/utils/date.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helpers de fecha en la ZONA HORARIA DEL USUARIO (cookie "ptime-tz").
//
// POR QUÉ: el runtime de Vercel usa UTC. Entre las 21:00 y 24:00 del último día
// del mes, UTC ya está en el mes siguiente, así que `new Date()` en el server
// devuelve el mes equivocado (ej: 31/08 21:00 ART = 01/09 00:00 UTC).
//
// La zona se resuelve en el server desde la cookie `ptime-tz` (seteada por el
// cliente con Intl.DateTimeFormat().resolvedOptions().timeZone) — así cada
// usuario ve su propio "hoy"/"este mes", sin importar el país.
//
// Los timestamps (created_at/updated_at) SÍ deben seguir con toISOString() UTC —
// son instantes. Estos helpers son SOLO para fechas de calendario.
// ─────────────────────────────────────────────────────────────────────────────
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/** "hoy" en la zona del usuario → "2026-08-31" */
export function todayLocal(timeZone: string): string {
  return formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
}

/** "hoy" en la zona del usuario como Date (normalizado a UTC-mediodía para evitar drift) */
export function todayLocalDate(timeZone: string): Date {
  const [y, m, d] = todayLocal(timeZone).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Mes actual en la zona del usuario → "2026-08" */
export function currentMonthLocal(timeZone: string): string {
  return todayLocal(timeZone).slice(0, 7);
}

/** Primer día del mes actual en la zona del usuario → "2026-08-01" */
export function startOfCurrentMonthLocal(timeZone: string): string {
  return format(startOfMonth(todayLocalDate(timeZone)), "yyyy-MM-dd");
}

/** Último día del mes actual en la zona del usuario → "2026-08-31" */
export function endOfCurrentMonthLocal(timeZone: string): string {
  return format(endOfMonth(todayLocalDate(timeZone)), "yyyy-MM-dd");
}
