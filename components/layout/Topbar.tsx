// components/layout/Topbar.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
}

export default function Topbar({ user }: Props) {
  return (
    <header className="h-14 border-b border-border bg-white flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-ink leading-none">
            {user.name ?? user.email}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {user.role}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>

        <ThemeToggle />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            p-1.5 rounded-lg text-muted-foreground hover:text-ink hover:bg-surface
            transition-colors
          "
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
