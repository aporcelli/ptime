// components/landing-page.tsx — Landing page client component
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/landing-i18n";
import { translations as tAll } from "@/lib/landing-i18n";

// ── SVG icons ────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// ── Framer Motion variants ───────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ── Language Toggle Button ──────────────────────────────────────────────────

function LangToggle({ locale, onChange }: { locale: Locale; onChange: (l: Locale) => void }) {
  return (
    <button
      onClick={() => onChange(locale === "en" ? "es" : "en")}
      className="relative flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-brand-500/40 hover:text-foreground"
      aria-label={locale === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
    >
      <span className={locale === "en" ? "text-foreground font-semibold" : ""}>EN</span>
      <span className="text-border">/</span>
      <span className={locale === "es" ? "text-foreground font-semibold" : ""}>ES</span>
    </button>
  );
}

// ── Theme Toggle Button ─────────────────────────────────────────────────────

function ThemeToggle({ theme, onChange }: { theme: "light" | "dark"; onChange: (t: "light" | "dark") => void }) {
  return (
    <button
      onClick={() => onChange(theme === "light" ? "dark" : "light")}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:border-brand-500/40 hover:text-foreground"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

// ── Feature Card ────────────────────────────────────────────────────────────

function FeatureCard({ title, desc, index }: { title: string; desc: string; index: number }) {
  return (
    <motion.div
      variants={cardVariant}
      className="group glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h4 className="font-semibold text-foreground text-base">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

// ── Step Card ───────────────────────────────────────────────────────────────

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <motion.div variants={cardVariant} className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
        {step}
      </div>
      <h4 className="mt-5 font-semibold text-foreground">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">{desc}</p>
    </motion.div>
  );
}

// ── Sign-in button with direct Google OAuth ─────────────────────────────────

function SignInButton({
  isLoggedIn,
  label,
}: {
  isLoggedIn: boolean;
  label: string;
}) {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
      >
        {label} →
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { redirectTo: "/dashboard" })}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-lg shadow-slate-200/50 transition-all hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-300/50 active:scale-95 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:shadow-slate-900/50 dark:hover:bg-slate-700"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────

export default function LandingPage({ serverLoggedIn }: { serverLoggedIn: boolean }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem("landing-locale") as Locale | null;
    if (savedLocale === "en" || savedLocale === "es") setLocale(savedLocale);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const t = tAll[locale];

  const changeLocale = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("landing-locale", l);
  }, []);

  const changeTheme = useCallback((next: "light" | "dark") => {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, []);

  // Use server-side logged-in state until client session hydrates
  const isLoggedIn = mounted ? !!session?.user : serverLoggedIn;

  return (
    <main className={`${theme === "dark" ? "dark" : ""} min-h-screen text-foreground font-sans antialiased relative overflow-hidden`}
      style={{ backgroundColor: theme === "dark" ? "transparent" : "hsl(var(--background))" }}
    >
      {/* Atmospheric background — gradient adapts to theme */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            theme === "dark"
              ? "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.88) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.92) 100%)",
            "url('/bg-landing.jpg') center/cover no-repeat",
          ].join(", "),
        }}
      />

      {/* Blobs decorativos */}
      <div aria-hidden className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[140px] pointer-events-none" />
      <div aria-hidden className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
        {/* ── Header ──────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <Link href="/" className="group">
            <h1 className="font-serif text-3xl font-extrabold tracking-tight transition-colors">
              P<span className="text-emerald-500 italic">time</span>
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={locale}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                <LangToggle locale={locale} onChange={changeLocale} />
              </motion.div>
            </AnimatePresence>
            <ThemeToggle theme={theme} onChange={changeTheme} />
          </div>
        </motion.header>

        {/* ── Hero ────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="mt-20 sm:mt-28 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]"
          >
            {t.heroTitle}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent italic">
              {t.heroTitleAccent}
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={0.25}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed sm:text-xl"
          >
            {t.heroDesc}
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={0.4}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <SignInButton
              isLoggedIn={isLoggedIn}
              label={isLoggedIn ? t.dashboard : t.signIn}
            />
            {!isLoggedIn && (
              <span className="text-xs text-muted-foreground">
                {locale === "en" ? "No credit card · No registration" : "Sin tarjeta · Sin registro"}
              </span>
            )}
          </motion.div>
        </motion.section>

        {/* ── Características ─────────────────────────────── */}
        <section className="mt-24 sm:mt-32">
          <h3 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t.whyTitle}
          </h3>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {t.features.map((feat, i) => (
              <FeatureCard key={i} title={feat.title} desc={feat.desc} index={i} />
            ))}
          </motion.div>
        </section>

        {/* ── How it works ────────────────────────────────── */}
        <section className="mt-24 sm:mt-32">
          <h3 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t.howItWorks}
          </h3>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="mt-8 grid gap-8 sm:grid-cols-3"
          >
            {t.steps.map((s) => (
              <StepCard key={s.step} step={s.step} title={s.title} desc={s.desc} />
            ))}
          </motion.div>
        </section>

        {/* ── CTA final ──────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-24 sm:mt-32 text-center"
        >
          <motion.div variants={fadeUp} className="glass rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            {/* Blob sutil dentro del card */}
            <div aria-hidden className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

            <h3 className="relative font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t.ctaTitle}
            </h3>
            <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
              {t.ctaDesc}
            </p>
            <div className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SignInButton
                isLoggedIn={isLoggedIn}
                label={isLoggedIn ? t.dashboard : t.signIn}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* ── Footer ──────────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 pt-8 border-t border-border text-sm text-muted-foreground flex flex-col items-center gap-2 sm:flex-row sm:justify-between"
        >
          <p>© {new Date().getFullYear()} {t.footer}</p>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground underline underline-offset-2 transition-colors">
              {locale === "en" ? "Privacy Policy" : "Privacy Policy"}
            </Link>
            <Link href="/terms" className="hover:text-foreground underline underline-offset-2 transition-colors">
              {locale === "en" ? "Terms of Service" : "Terms of Service"}
            </Link>
          </span>
        </motion.footer>
      </div>
    </main>
  );
}
