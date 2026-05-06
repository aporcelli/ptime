// lib/utils/sanitize.ts
// Sanitización server-safe sin dependencias de DOM/jsdom (compatible Vercel Node runtime).

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAGS = /<[^>]*>/g;

/**
 * Sanitiza texto libre para persistencia:
 * - elimina tags HTML
 * - elimina chars de control no imprimibles
 * - colapsa whitespace
 */
export function sanitize(dirty: string): string {
  if (typeof dirty !== "string") return "";
  return dirty
    .replace(TAGS, "")
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitiza recursivamente campos string de un objeto plano.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? sanitize(v) : v]),
  ) as T;
}
