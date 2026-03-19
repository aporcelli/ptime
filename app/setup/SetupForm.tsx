// app/setup/SetupForm.tsx
"use client";

import { useState }   from "react";
import { useRouter }  from "next/navigation";
import { motion }     from "framer-motion";
import { validateAndSaveSheetId } from "@/app/actions/setup";

// SVG Icons inline para evitar dependencia de lucide-react
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

export default function SetupForm() {
  const router = useRouter();
  const [sheetId, setSheetId] = useState("");
  const [status, setStatus]   = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await validateAndSaveSheetId(sheetId);

    if (!result.success) {
      setStatus("error");
      setMessage(result.error ?? "Error desconocido");
      return;
    }

    setStatus("success");
    setMessage(`Sheet "${result.title}" conectado. Entrando…`);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">
          Google Sheet ID
        </label>
        <input
          type="text"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
          className="
            bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5
            text-white text-sm font-mono placeholder-slate-600
            focus:outline-none focus:ring-2 focus:ring-brand-600/50 focus:border-brand-600
          "
          required
        />
      </div>

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {message}
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
        >
          <CheckCircle size={16} /> {message}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={status === "loading" || status === "success" || !sheetId.trim()}
        whileTap={{ scale: 0.98 }}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {status === "loading" && <Loader2 size={16} className="animate-spin" />}
        {status === "loading" ? "Verificando y configurando…" : "Conectar Sheet"}
      </motion.button>

      <div className="text-center">
        <a href="https://sheets.new" target="_blank" rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-brand-500 inline-flex items-center gap-1 transition-colors">
          Crear nuevo Google Sheet <ExternalLink size={11} />
        </a>
      </div>
    </form>
  );
}
