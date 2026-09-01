"use client";
// components/SignOutButton.tsx — Botón de cerrar sesión fijo, visible en cualquier pantalla.
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="fixed top-4 right-4 z-50 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background/80 backdrop-blur text-muted-foreground hover:text-red-500 hover:border-red-400/50 transition-colors"
      title="Sign out / Cerrar sesión"
    >
      Sign out →
    </button>
  );
}
