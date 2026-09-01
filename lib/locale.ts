// lib/locale.ts — Server-Side secure locale resolver
import { cookies, headers } from "next/headers";
import type { Locale } from "./onboarding-i18n";

// ── Zona horaria del usuario ───────────────────────────────────────────────────
// Cookie "ptime-tz" seteada por el cliente (Intl.DateTimeFormat().resolvedOptions()
// .timeZone). Si no existe, usa la zona del server (UTC en Vercel) — la primera
// visita puede mostrar el período según UTC hasta que el cliente la setee.
// Se usa para calcular "hoy"/"este mes" en reportes y horas.

export function getUserTimeZone(): string {
  try {
    const cookieStore = cookies();
    const saved = cookieStore.get("ptime-tz")?.value;
    if (saved && /^[A-Za-z_]+\/[A-Za-z_]+$/.test(saved)) return saved;
  } catch {}
  return "UTC";
}

export function getLocale(): Locale {
  try {
    const cookieStore = cookies();
    const saved = cookieStore.get("ptime-locale")?.value;
    if (saved === "en" || saved === "es") return saved as Locale;
  } catch {}
  
  try {
    const acceptLanguage = headers().get("accept-language") ?? "";
    return acceptLanguage.toLowerCase().includes("es") ? "es" : "en";
  } catch {}
  
  return "en";
}
