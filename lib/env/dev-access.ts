import type { SheetCtx } from "@/lib/sheets/context";

export const LOCAL_DEV_ACCESS_TOKEN = "local-dev-access";
export const LOCAL_DEV_USER_EMAIL = "local.dev@ptime.local";

export type LocalDevUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
};

export type ProtectedSessionUser = {
  id?: string;
  email?: string;
  name?: string | null;
  role: "USER" | "ADMIN";
  sheetId?: string;
};

export type ProtectedSession = {
  user?: ProtectedSessionUser;
  error?: "RefreshTokenError";
} | null;

export type ProtectedAppAccess =
  | { kind: "allow"; user: ProtectedSessionUser | LocalDevUser; sheetId: string }
  | { kind: "redirect"; target: "/login" | "/login?error=TokenExpired" | "/setup" };

function assertNotProduction() {
  if (process.env.NODE_ENV === "production" && process.env.LOCAL_DEV_ACCESS === "true") {
    throw new Error("LOCAL_DEV_ACCESS cannot be enabled in production");
  }
}

function isLocalhost(url?: string): boolean {
  if (!url) return false;
  const host = new URL(url).hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function getRequestUrlFromHeaders(headersList: Pick<Headers, "get">): string | undefined {
  const host = headersList.get("host");
  if (!host) return undefined;
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function isLocalDevAccessEnabled(url?: string): boolean {
  assertNotProduction();
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_DEV_ACCESS === "true" && isLocalhost(url);
}

export function getLocalDevAccessContext(url?: string): SheetCtx | null {
  if (!isLocalDevAccessEnabled(url)) return null;
  return {
    sheetId: process.env.LOCAL_DEV_SHEET_ID || "local-dev-sheet",
    accessToken: LOCAL_DEV_ACCESS_TOKEN,
  };
}

export function getLocalDevUser(url?: string): LocalDevUser | null {
  if (!isLocalDevAccessEnabled(url)) return null;
  return { id: LOCAL_DEV_USER_EMAIL, email: LOCAL_DEV_USER_EMAIL, name: "Local Dev", role: "ADMIN" as const };
}

export function getRootRedirectTarget({
  sessionUser,
  requestUrl,
}: {
  sessionUser?: unknown;
  requestUrl?: string;
}): "/dashboard" | "/login" {
  return sessionUser || getLocalDevUser(requestUrl) ? "/dashboard" : "/login";
}

export function resolveProtectedAppAccess({
  session,
  cookieSheetId,
  requestUrl,
}: {
  session: ProtectedSession;
  cookieSheetId?: string;
  requestUrl?: string;
}): ProtectedAppAccess {
  const localUser = getLocalDevUser(requestUrl);
  const localCtx = getLocalDevAccessContext(requestUrl);
  if (localUser && localCtx) {
    return { kind: "allow", user: localUser, sheetId: localCtx.sheetId };
  }

  if (!session?.user) return { kind: "redirect", target: "/login" };
  if (session.error === "RefreshTokenError") return { kind: "redirect", target: "/login?error=TokenExpired" };

  const sheetId = session.user.sheetId ?? cookieSheetId;
  if (!sheetId) return { kind: "redirect", target: "/setup" };

  return { kind: "allow", user: session.user, sheetId };
}
