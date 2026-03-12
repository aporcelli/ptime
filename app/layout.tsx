// app/layout.tsx
import type { Metadata } from "next";
import { Outfit, DM_Serif_Display, DM_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSerif = DM_Serif_Display({
  subsets:  ["latin"],
  weight:   "400",
  style:    ["normal", "italic"],
  variable: "--font-serif",
  display:  "swap",
});

const dmMono = DM_Mono({
  subsets:  ["latin"],
  weight:   ["400", "500"],
  variable: "--font-mono",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       { default: "Ptime", template: "%s | Ptime" },
  description: "Gestión y carga de horas para servicios profesionales",
  robots:      { index: false, follow: false }, // App privada
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(dmSerif.variable, dmMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-surface font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
