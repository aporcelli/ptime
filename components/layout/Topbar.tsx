// components/layout/Topbar.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut, User, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface Props {
  user: { name?: string | null; email?: string | null; role: string; image?: string | null };
  onMenuClick?: () => void;
}

export default function Topbar({ user, onMenuClick }: Props) {
  return (
    <header
      className="h-14 shrink-0 flex items-center px-4 md:px-6 gap-4 bg-surface-lowest"
      style={{ borderBottom: "1px solid var(--color-outline-variant)" }}
    >
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-surface-high transition-colors text-on-surface-variant"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-none text-on-surface">
            {user.name ?? user.email}
          </p>
          <p className="text-xs mt-0.5 text-on-surface-variant">
            {user.role}
          </p>
        </div>

        {/* Avatar con foto de Google o fallback tonal */}
        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center ring-2 ring-primary-fixed/20 overflow-hidden shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.name ?? "Avatar"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={14} className="text-white" />
          )}
        </div>

        <ThemeToggle />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-high"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
