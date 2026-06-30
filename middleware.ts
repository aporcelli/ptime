// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isLocalDevAccessEnabled } from "@/lib/env/dev-access";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;

  if (isLocalDevAccessEnabled(req.url)) return NextResponse.next();

  // Rutas siempre públicas
  const isPublic = ["/", "/login", "/api/auth", "/setup", "/privacy", "/terms"].some((p) => pathname.startsWith(p));
  const bypassForPwaAssets = pathname === "/sw.js" || pathname === "/manifest.webmanifest";
  if (isPublic || bypassForPwaAssets) return NextResponse.next();

  const isApiRoute = pathname.startsWith("/api/");

  // Sin sesión → login (web) / 401 JSON (api)
  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Sesión con token expirado → re-login
  if ((session as any)?.error === "RefreshTokenError") {
    if (isApiRoute) return NextResponse.json({ success: false, error: "TOKEN_EXPIRED" }, { status: 401 });
    return NextResponse.redirect(new URL("/login?error=TokenExpired", req.url));
  }

  // Admin routes — solo bloquear si el rol es explícitamente USER y la ruta es /admin
  // (en esta versión todos los usuarios pueden acceder al admin de su propio sheet)
  // Mantener para futuras implementaciones multi-tenant.

  // Sin sheet configurado → setup
  // Cada usuario tiene su propio Sheet — preferimos el JWT (persistente cross-device),
  // luego cookie. Si el JWT lo tiene pero la cookie no, sincronizamos la cookie.
  const jwtSheetId    = (session as { user?: { sheetId?: string } })?.user?.sheetId;
  const cookieSheetId = req.cookies.get("ptime-sheet-id")?.value;
  const sheetId       = jwtSheetId ?? cookieSheetId;

  if (!sheetId) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, error: "NO_SHEET_CONFIGURED" }, { status: 428 });
    }
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // Si el JWT tiene sheetId pero la cookie no, sincronizar para que las server actions y queries lo usen.
  if (jwtSheetId && !cookieSheetId) {
    const res = NextResponse.next();
    res.cookies.set("ptime-sheet-id", jwtSheetId, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   365 * 24 * 60 * 60,
    });
    return res;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
