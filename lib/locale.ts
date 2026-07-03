// lib/locale.ts — Server-Side secure locale resolver
import { cookies, headers } from "next/headers";
import type { Locale } from "./onboarding-i18n";

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
