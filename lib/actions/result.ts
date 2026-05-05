import type { ActionDebugInfo, ActionResult } from "@/types/entities";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function toPlainJson<T>(value: T): T {
  return sanitizeJson(value) as T;
}

function sanitizeJson(value: unknown): JsonValue | undefined {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") return undefined;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map((item) => sanitizeJson(item) ?? null);
  if (typeof value === "object") {
    const result: Record<string, JsonValue> = {};
    for (const [key, nested] of Object.entries(value)) {
      const safe = sanitizeJson(nested);
      if (safe !== undefined) result[key] = safe;
    }
    return result;
  }
  return null;
}

export function actionOk<T>(data: T): ActionResult<T> {
  return { success: true, data: toPlainJson(data) } as ActionResult<T>;
}

export function actionDone(): ActionResult {
  return { success: true };
}

function extractDebug(error: unknown): ActionDebugInfo | undefined {
  if (!error || typeof error !== "object") return undefined;
  const source = error as Record<string, unknown>;
  const debug: ActionDebugInfo = {};

  if (typeof source.name === "string") debug.name = source.name;
  if (typeof source.message === "string") debug.message = source.message;
  if (typeof source.digest === "string") debug.digest = source.digest;
  if (typeof source.code === "string") debug.code = source.code;

  return Object.keys(debug).length > 0 ? debug : undefined;
}

export function actionError<T = void>(error: unknown, fallback = "Error inesperado"): ActionResult<T> {
  const baseError = error instanceof Error ? error.message : String(error || fallback);
  const debug = extractDebug(error);
  return debug ? { success: false, error: baseError, debug } : { success: false, error: baseError };
}

export function validationError<T = void>(fieldErrors: Record<string, string[]>): ActionResult<T> {
  return { success: false, error: "Datos inválidos", fieldErrors: toPlainJson(fieldErrors) };
}
