// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;

  // Rutas siempre públicas
  const isPublic = ["/login", "/api/auth", "/setup", "/privacy", "/terms"].some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Sin sesión → login
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes — solo bloquear si el rol es explícitamente USER y la ruta es /admin
  // (en esta versión todos los usuarios pueden acceder al admin de su propio sheet)
  // Mantener para futuras implementaciones multi-tenant.

  // Sin sheet configurado → setup
  // Cada usuario tiene su propio Sheet — busca en cookie o en el token JWT
  const sheetId = req.cookies.get("ptime-sheet-id")?.value
               ?? (session as { user?: { sheetId?: string } })?.user?.sheetId;
  if (!sheetId) {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
