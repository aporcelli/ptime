const DEFAULT_CALLBACK_URL = "/dashboard";
const BASE_URL = "https://ptime.local";

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function safeCallbackUrl(input?: string | null): string {
  if (!input) return DEFAULT_CALLBACK_URL;
  if (!input.startsWith("/") || input.startsWith("//")) return DEFAULT_CALLBACK_URL;
  if (/[\u0000-\u001F\u007F\\]/.test(input)) return DEFAULT_CALLBACK_URL;

  const decoded = safeDecode(input);
  if (!decoded || decoded.startsWith("//") || decoded.includes("\\")) return DEFAULT_CALLBACK_URL;

  try {
    const url = new URL(input, BASE_URL);
    if (url.origin !== BASE_URL) return DEFAULT_CALLBACK_URL;
    if (url.pathname === "/login" || url.pathname.startsWith("/api/auth")) return DEFAULT_CALLBACK_URL;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
}
