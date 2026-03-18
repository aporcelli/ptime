// components/layout/ThemeToggle.tsx
// Botón de toggle Claro/Oscuro con next-themes
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar hydration mismatch: solo renderizar en cliente
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className="
        p-1.5 rounded-lg transition-colors
        text-muted-foreground hover:text-ink dark:text-slate-400 dark:hover:text-white
        hover:bg-slate-100 dark:hover:bg-slate-800
      "
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}
