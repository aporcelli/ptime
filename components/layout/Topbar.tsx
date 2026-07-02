// components/layout/Topbar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Menu, Languages } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/onboarding-i18n";

interface Props {
  user: { name?: string | null; email?: string | null; role: string; image?: string | null };
  onMenuClick?: () => void;
}

export default function Topbar({ user, onMenuClick }: Props) {
  const { data: session } = useSession();
  const [sessionAvatarFromApi, setSessionAvatarFromApi] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("ptime-locale") as Locale | null;
    if (saved === "en" || saved === "es") setLocale(saved);
  }, []);

  const toggleLanguage = () => {
    const next = locale === "en" ? "es" : "en";
    setLocale(next);
    localStorage.setItem("ptime-locale", next);
    localStorage.setItem("landing-locale", next);
    document.cookie = `ptime-locale=${next}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const img = data?.user?.image;
        if (!cancelled && typeof img === "string" && img.trim()) {
          setSessionAvatarFromApi(img);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const rawAvatarSrc = `/api/auth/avatar?v=${encodeURIComponent(sessionAvatarFromApi ?? "session")}`;

  const avatarCandidates = useMemo(() => {
    const fallbackExternal = (sessionAvatarFromApi
      ?? (session?.user as { image?: string | null } | undefined)?.image
      ?? user.image
      ?? null);

    const candidates = [rawAvatarSrc] as string[];
    if (fallbackExternal) candidates.push(fallbackExternal);
    return candidates;
  }, [rawAvatarSrc, sessionAvatarFromApi, session, user.image]);

  const [avatarIndex, setAvatarIndex] = useState(0);
  const avatarSrc = avatarCandidates[avatarIndex] ?? null;

  return (
    <header className="h-14 shrink-0 flex items-center px-4 md:px-6 gap-4 bg-card border-b border-border">
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-none text-foreground">
            {user.name ?? user.email}
          </p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {user.role}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-emerald-500/20 overflow-hidden shrink-0">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt={user.name ?? "Avatar"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => {
                if (avatarIndex < avatarCandidates.length - 1) {
                  setAvatarIndex((i) => i + 1);
                }
              }}
            />
          ) : (
            <User size={14} className="text-white" />
          )}
        </div>

        <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 shrink-0"
              title={locale === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
            >
              <Languages size={13} className="opacity-70" />
              <span>{locale === "en" ? "EN" : "ES"}</span>
            </button>

            <ThemeToggle />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
