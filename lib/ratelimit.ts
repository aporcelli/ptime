// lib/ratelimit.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter en memoria con Sliding Window.
// Suficiente para despliegues de instancia única (Vercel Serverless).
// Para multi-instancia usar @upstash/ratelimit + Redis.
// ─────────────────────────────────────────────────────────────────────────────

interface Window {
    count: number;
    resetAt: number;
}

const store = new Map<string, Window>();

// Limpiar entradas expiradas cada 5 minutos para evitar memory leaks
if (typeof globalThis !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, win] of Array.from(store.entries())) {
            if (now > win.resetAt) store.delete(key);
        }
    }, 5 * 60 * 1_000);
}

/**
 * Aplica rate limiting con sliding window fija.
 *
 * @param key       - Identificador único (ej. IP, user ID, ruta)
 * @param limit     - Número máximo de requests en la ventana
 * @param windowMs  - Tamaño de la ventana en milisegundos
 * @returns `{ success: true }` si se permite, `{ success: false, retryAfter }` si se supera el límite
 */
export function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): { success: true } | { success: false; retryAfter: number } {
    const now = Date.now();

    let win = store.get(key);
    if (!win || now > win.resetAt) {
        win = { count: 0, resetAt: now + windowMs };
        store.set(key, win);
    }

    win.count++;

    if (win.count > limit) {
        const retryAfter = Math.ceil((win.resetAt - now) / 1_000);
        return { success: false, retryAfter };
    }

    return { success: true };
}

// ── Presets ───────────────────────────────────────────────────────────────────
/** 5 requests / 60 s — Para endpoints de autenticación (login, register) */
export const authLimiter = (key: string) => rateLimit(key, 5, 60_000);

/** 20 requests / 60 s — Para API routes generales */
export const apiLimiter = (key: string) => rateLimit(key, 20, 60_000);

/** 100 requests / 60 s — Para Server Actions (menos restrictivo) */
export const actionLimiter = (key: string) => rateLimit(key, 100, 60_000);
