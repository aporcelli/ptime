// lib/utils/sanitize.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sanitización centralizada contra XSS.
// Usar en TODOS los inputs de texto libre antes de persistir.
// ─────────────────────────────────────────────────────────────────────────────
import DOMPurify from "isomorphic-dompurify";

/**
 * Elimina todo HTML/JS peligroso de un string.
 * Configurado en modo más restrictivo: sin tags ni atributos.
 */
export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],   // No permitir ningún tag HTML
    ALLOWED_ATTR: [],   // No permitir atributos
  }).trim();
}

/**
 * Sanitiza un objeto completo recursivamente (solo strings).
 * Útil para sanitizar form data completo antes de persistir.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? sanitize(v) : v,
    ])
  ) as T;
}
