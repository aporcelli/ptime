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
        surface: {
          DEFAULT:    "var(--color-surface)",
          low:        "var(--color-surface-container-low)",
          lowest:     "var(--color-surface-container-lowest)",
          high:       "var(--color-surface-container-high)",
          highest:    "var(--color-surface-container-highest)",
        },
        primary: {
          DEFAULT:    "var(--color-primary)",
          container:  "var(--color-primary-container)",
          fixed:      "var(--color-primary-fixed)",
        },
        secondary: {
          DEFAULT:    "var(--color-secondary)",
        },
        "on-surface": {
          DEFAULT:    "var(--color-on-surface)",
          variant:    "var(--color-on-surface-variant)",
        },
        "outline-variant": "var(--color-outline-variant)",
        // Mantener los colores existentes que usan los componentes actuales para no romper nada:
        brand: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
          300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
          600: "#1a56db", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
        },
        ink: {
          DEFAULT: "#0d1117", 2: "#1c2333", 3: "#2d3748",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans:    ["var(--font-sans)",    "system-ui", "sans-serif"],
        mono:    ["ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        sm:    "calc(var(--radius-md) - 2px)",
        md:    "var(--radius-md)",
        lg:    "var(--radius-lg)",
        xl:    "var(--radius-xl)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full:  "9999px",
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        "card-hover": "0 4px 24px -4px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};

export default config;