// middleware.ts — Protección de rutas y RBAC
// ─────────────────────────────────────────────────────────────────────────────
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;

  // Rutas públicas — no requieren autenticación
  const publicPaths = ["/login", "/register", "/api/auth"];
  const isPublic    = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Si no hay sesión, redirigir al login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rutas de admin — requieren rol ADMIN
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && session.user.role !== "ADMIN") {
    // Redirigir a dashboard con mensaje de acceso denegado
    return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
