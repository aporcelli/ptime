// lib/utils/formatCurrency.ts
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "es-AR"
): string {
  return new Intl.NumberFormat(locale, {
    style:                 "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


export function formatDateShort(value?: string | null): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}-${month}-${year.slice(-2)}`;
}

export function formatMonthShort(value?: string | null): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  const [, year, month] = match;
  return `${month}-${year.slice(-2)}`;
}


const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export function formatMonthYearLabel(value?: string | null, locale = "es"): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})/);
  if (!match) return value;
  const [, year, month] = match;
  const monthIndex = Number(month) - 1;
  const list = locale === "en" ? MONTHS_EN : MONTHS_ES;
  const label = list[monthIndex];
  return label ? `${label[0].toUpperCase()}${label.slice(1)} ${year}` : value;
}

export function formatPeriodLabel(fechaDesde?: string | null, fechaHasta?: string | null, locale = "es"): string {
  if (!fechaDesde && !fechaHasta) return "—";
  const range = `${formatDateShort(fechaDesde)}${fechaHasta ? ` - ${formatDateShort(fechaHasta)}` : ""}`;
  if (fechaDesde && fechaHasta && fechaDesde.slice(0, 7) === fechaHasta.slice(0, 7)) {
    return `${formatMonthYearLabel(fechaDesde, locale)} · ${range}`;
  }
  return range;
}

export function formatDateTimeShort(value?: string | null): string {
  if (!value) return "—";
  const date = formatDateShort(value);
  const time = value.match(/T(\d{2}:\d{2})/);
  return time ? `${date} ${time[1]}` : date;
}

// lib/utils/uuid.ts
export { v4 as generateUUID } from "uuid";

// lib/utils/cn.ts — Tailwind class merger
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
