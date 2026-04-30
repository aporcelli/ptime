import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Shadcn / semantic tokens (usados por todos los componentes UI) ───
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          fixed:      "hsl(var(--primary))",
        },
        heading: "hsl(var(--text-heading))",
        sub:     "hsl(var(--text-sub))",
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        // ─── Colores de acento fijos (siempre visibles) ───────────────────────
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },

        // ─── Legacy aliases (para que no rompan componentes viejos) ──────────
        ink: {
          DEFAULT: "#0d1117",
          2:       "#1c2333",
          3:       "#2d3748",
        },
        warm: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          low:     "var(--color-surface-container-low)",
          lowest:  "var(--color-surface-container-lowest)",
          high:    "var(--color-surface-container-high)",
          highest: "var(--color-surface-container-highest)",
        },
        "on-surface": {
          DEFAULT: "var(--color-on-surface)",
          variant: "var(--color-on-surface-variant)",
        },
        "outline-variant": "var(--color-outline-variant)",
      },

      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans:    ["var(--font-sans)",    "system-ui", "sans-serif"],
        mono:    ["ui-monospace", "Menlo", "monospace"],
      },

      borderRadius: {
        sm:    "calc(var(--radius) - 4px)",
        md:    "calc(var(--radius) - 2px)",
        lg:    "var(--radius)",
        xl:    "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
        full:  "9999px",
      },

      boxShadow: {
        ambient:     "var(--shadow-ambient)",
        "card-hover": "0 4px 24px -4px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
