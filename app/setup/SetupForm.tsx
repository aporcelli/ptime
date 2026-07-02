// app/setup/SetupForm.tsx
"use client";

import { useState }      from "react";
import { useRouter }     from "next/navigation";
import { motion }     from "framer-motion";
import { validateAndSaveSheetId, createAndConnectNewSheet } from "@/app/actions/setup";
import GoogleSheetPicker from "@/components/GoogleSheetPicker";
import { useEffect, useCallback } from "react";
import { onboardingTranslations, type Locale } from "@/lib/onboarding-i18n";

const Loader2 = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const AlertCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ExternalLink = ({ size = 11, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

function extractSheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed;
}

function isGoogleSheetsUrl(input: string): boolean {
  return input.includes("docs.google.com/spreadsheets") || input.includes("sheets.google.com");
}

export default function SetupForm({ sharedSheetId }: { sharedSheetId?: string }) {
  const router = useRouter();
  const isDriveFile = process.env.NEXT_PUBLIC_OAUTH_SCOPE === "https://www.googleapis.com/auth/drive.file";
  const [showPicker, setShowPicker] = useState(isDriveFile);

  const [rawInput, setRawInput] = useState("");
  const [locale, setLocale] = useState<Locale>("en");
  const ot = onboardingTranslations[locale];

  useEffect(() => {
    const saved = localStorage.getItem("ptime-locale") as Locale | null;
    if (saved === "en" || saved === "es") {
      setLocale(saved);
    } else {
      localStorage.setItem("ptime-locale", "en");
    }
  }, []);

  const changeLanguage = useCallback((lang: Locale) => {
    setLocale(lang);
    localStorage.setItem("ptime-locale", lang);
    localStorage.setItem("landing-locale", lang); // sync with landing
    document.cookie = `ptime-locale=${lang}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.refresh();
  }, [router]);

  function renderLanguageSelector() {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted/30 border border-border rounded-xl text-center gap-2 mb-2">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {locale === "en" ? "Select Language / Seleccionar Idioma" : "Seleccionar Idioma / Select Language"}
        </p>
        <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-xl">
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              locale === "en"
                ? "bg-emerald-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => changeLanguage("es")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              locale === "es"
                ? "bg-emerald-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Español
          </button>
        </div>
      </div>
    );
  }
  const [status, setStatus]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage]   = useState("");
  const [showManual, setShowManual] = useState(!sharedSheetId);

  const extractedId = rawInput.trim() ? extractSheetId(rawInput) : "";
  const isUrl = isGoogleSheetsUrl(rawInput);

  async function connectSheet(sheetId: string) {
    setStatus("loading");
    setMessage("");
    const result = await validateAndSaveSheetId(sheetId);
    if (!result.success) {
      setStatus("error");
      setMessage(result.error ?? "Error desconocido");
      return;
    }
    // Marcar que el usuario acaba de pasar por setup (desbloquea el tour)
    localStorage.setItem("ptime-is-new-user-setup", "true");
    setStatus("success");
    setMessage(locale === "en" ? `Sheet "${result.title}" connected. Entering…` : `Sheet "${result.title}" conectado. Entrando…`);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  async function handleCreateAutoSheet() {
    setStatus("loading");
    setMessage("");
    const result = await createAndConnectNewSheet();
    if (!result.success) {
      setStatus("error");
      setMessage(result.error ?? "Error al crear la planilla");
      return;
    }
    // Marcar que el usuario acaba de pasar por setup (desbloquea el tour)
    localStorage.setItem("ptime-is-new-user-setup", "true");
    setStatus("success");
    setMessage(locale === "en" ? `Sheet "${result.title}" created successfully! Entering…` : `¡Planilla "${result.title}" creada con éxito! Entrando…`);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  async function handleSharedSubmit() {
    if (!sharedSheetId) return;
    await connectSheet(sharedSheetId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sheetId = extractSheetId(rawInput);
    if (!sheetId) {
      setStatus("error");
      setMessage("Pegá la URL completa de tu Google Sheet o el ID directamente.");
      return;
    }
    await connectSheet(sheetId);
  }

  if (!showManual && sharedSheetId) {
    return (
      <div className="flex flex-col gap-4">
        {renderLanguageSelector()}
        <motion.button onClick={handleSharedSubmit} disabled={status === "loading" || status === "success"} whileTap={{ scale: 0.98 }}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 transition-colors">
          {status === "loading" && <Loader2 size={16} className="animate-spin mr-2" />}
          {status === "loading" ? "{ot.setupConnectingWorkspace}" : "{ot.setupJoinWorkspace}"}
        </motion.button>
        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {message}
          </motion.div>
        )}
        {status === "success" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle size={16} /> {message}
          </motion.div>
        )}
        <div className="text-center mt-2">
          <button type="button" onClick={() => setShowManual(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            {locale === "en" ? "Use another Sheet / Create from scratch" : "Usar otro Sheet distinto / Crear de cero"}
          </button>
        </div>
      </div>
    );
  }

  if (showPicker && isDriveFile) {
    return (
      <div className="flex flex-col gap-5 text-center">
        {renderLanguageSelector()}
        <div className="p-4 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wide">{ot.setupTitle}</p>
          <p className="text-xs">{ot.setupDesc}</p>
        </div>

        <div className="flex flex-col gap-3">
          <GoogleSheetPicker
            onSelect={connectSheet}
            disabled={status === "loading" || status === "success"}
            label="{ot.setupBtnSelectExisting}"
            variant="secondary"
          />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            onClick={handleCreateAutoSheet}
            disabled={status === "loading" || status === "success"}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-600/10"
          >
            {status === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>✨ {ot.setupBtnCreateNew}</span>
            )}
          </button>
        </div>

        {status === "error" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{message}</div>
        )}
        {status === "success" && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
        )}

        <div className="text-center mt-2">
          <button type="button" onClick={() => setShowPicker(false)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            {ot.setupBtnManualUrl}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderLanguageSelector()}
      <div className="mb-6 p-4 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground text-xs uppercase tracking-wide">{ot.setupStepTitle}</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>{locale === "en" ? <>Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sheets.new</a> and create a blank spreadsheet</> : <>Andá a <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sheets.new</a> y creá una hoja vacía</>}</li>
          <li>{locale === "en" ? "Copy the ID from the URL" : "Copiá el ID de la URL"}:<br/>
            <code className="bg-background border border-border px-1.5 py-0.5 rounded text-[11px] break-all">
              sheets.google.com/d/<span className="text-emerald-500 font-bold">ID_AQUI</span>/edit
            </code>
          </li>
          <li>{locale === "en" ? "Paste it below — Ptime initializes the tabs automatically" : "Pegalo abajo — Ptime crea las hojas automáticamente"}</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{ot.setupUrlLabel}</label>
          <input type="text" value={rawInput}
            onChange={(e) => { setRawInput(e.target.value); setStatus("idle"); setMessage(""); }}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            className="bg-background border border-input rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
            required
          />
          {isUrl && extractedId && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <span>{ot.setupIdDetected}: <code className="text-foreground bg-muted px-1 py-0.5 rounded text-[11px]">{extractedId}</code></span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{ot.setupIdHelper}</p>
        </div>

        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {message}
          </motion.div>
        )}
        {status === "success" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle size={16} /> {message}
          </motion.div>
        )}

        <motion.button type="submit" disabled={status === "loading" || status === "success" || !rawInput.trim()} whileTap={{ scale: 0.98 }}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 transition-colors">
          {status === "loading" && <Loader2 size={16} className="animate-spin" />}
          {status === "loading" ? status === "loading" ? ot.setupBtnCreating : ot.setupBtnVerify : ot.setupBtnVerify}
        </motion.button>

        {isDriveFile ? (
          <div className="text-center mt-2">
            <button type="button" onClick={() => setShowPicker(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← {ot.setupBtnBackToPicker}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <a href="https://sheets.new" target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
              Crear nuevo Google Sheet <ExternalLink size={11} />
            </a>
          </div>
        )}
      </form>
    </>
  );
}
