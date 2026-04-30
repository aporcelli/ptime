import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ title, description, actions, children, className }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <main className={cn("relative -m-4 min-h-[calc(100vh-5rem)] overflow-hidden rounded-[2rem] bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:-m-6 sm:p-6 lg:p-8 animate-fade-in", className)}>
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border bg-card/80 p-5 shadow-ambient backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h1>
            {description ? <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
        </header>
        {children}
      </div>
    </main>
  );
}

export function SectionCard({ title, icon, children, className }: { title?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border bg-card/90 p-5 shadow-ambient backdrop-blur transition-colors", className)}>
      {title ? <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">{icon}{title}</h2> : null}
      {children}
    </section>
  );
}

export function MetricCard({ label, value, icon, tone = "primary", children }: { label: string; value: ReactNode; icon?: ReactNode; tone?: "primary" | "success" | "warning"; children?: ReactNode }) {
  const tones = {
    primary: "border-primary/50 text-primary bg-primary/10",
    success: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    warning: "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  };
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-ambient transition-all hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:hover:translate-y-0">
      <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border", tones[tone])}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</div>
      {children}
    </div>
  );
}

export function DataPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-2xl border bg-background/60", className)}>{children}</div>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "bg-red-500/10 text-red-700 dark:text-red-300",
  };
  return <span className={cn("inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold", tones[tone])}>{children}</span>;
}
