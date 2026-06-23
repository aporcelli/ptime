// app/setup/SetupForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { validateAndSaveSheetId } from "@/app/actions/setup";
import { createPtimeSpreadsheet } from "@/app/actions/drive";
import GoogleSheetPicker from "@/components/GoogleSheetPicker";

const Loader2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function SetupForm({ sharedSheetId }: { sharedSheetId?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"main" | "paste" | "create">(
    sharedSheetId ? "main" : "main"
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [urlInput, setUrlInput] = useState("");

  async function connectSheet(fileId: string) {
    setStatus("loading");
    setMessage("Connecting sheet…");
    const result = await validateAndSaveSheetId(fileId);
    if (!result.success) {
      setStatus("error");
      setMessage(result.error ?? "Error connecting sheet.");
      return;
    }
    setStatus("success");
    setMessage(`"${result.title}" connected. Redirecting…`);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
  }

  async function handleCreate() {
    setStatus("loading");
    setMessage("Creating new Ptime sheet…");
    const r = await createPtimeSpreadsheet();
    if (r.error) {
      setStatus("error");
      setMessage(r.error);
      return;
    }
    await connectSheet(r.fileId!);
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match = urlInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    const id = match ? match[1] : urlInput.trim();
    if (!id) { setStatus("error"); setMessage("Invalid URL or ID."); return; }
    await connectSheet(id);
  }

  async function handleSharedSubmit() {
    if (!sharedSheetId) return;
    await connectSheet(sharedSheetId);
  }

  if (sharedSheetId) {
    return (
      <div className="flex flex-col gap-4">
        <motion.button onClick={handleSharedSubmit} disabled={status === "loading"} whileTap={{ scale: 0.98 }}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2">
          {status === "loading" && <Loader2 />}
          Join Shared Workspace
        </motion.button>
        <StatusBlock status={status} message={message} />
        <button onClick={() => setMode("main")} className="text-xs text-muted-foreground hover:text-primary text-center">Use a different sheet</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {mode === "main" && (
        <>
          {/* ── Option 1: Google Picker popup ──── */}
          <GoogleSheetPicker
            onSelect={connectSheet}
            disabled={status === "loading"}
            label="Choose a Google Sheet"
            variant="primary"
          />

          {/* ── Option 2: Create new ──────────── */}
          <motion.button onClick={() => setMode("create")} disabled={status === "loading"} whileTap={{ scale: 0.98 }}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create New Ptime Sheet
          </motion.button>

          {/* ── Option 3: Paste URL ───────────── */}
          <button type="button" onClick={() => setMode("paste")}
            className="text-xs text-muted-foreground hover:text-primary text-center">
            Or paste a Google Sheet URL manually
          </button>
        </>
      )}

      {/* ── Paste URL mode ─────────────────────── */}
      {mode === "paste" && (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">Google Sheet URL or ID</label>
          <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            className="bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            required />
          <motion.button type="submit" disabled={status === "loading"} whileTap={{ scale: 0.98 }}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 />}
            Connect Sheet
          </motion.button>
          <button type="button" onClick={() => setMode("main")} className="text-xs text-muted-foreground hover:text-primary">← Back</button>
        </form>
      )}

      {/* ── Create mode ────────────────────────── */}
      {mode === "create" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">A new Google Sheet named <strong>Ptime — Time Tracking</strong> will be created.</p>
          <motion.button onClick={handleCreate} disabled={status === "loading"} whileTap={{ scale: 0.98 }}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 />}
            Create & Connect
          </motion.button>
          <button type="button" onClick={() => setMode("main")} className="text-xs text-muted-foreground hover:text-primary">← Back</button>
        </div>
      )}

      <StatusBlock status={status} message={message} />
    </div>
  );
}

function StatusBlock({ status, message }: { status: string; message: string }) {
  if (status === "loading") return <p className="text-sm text-muted-foreground text-center animate-pulse">{message}</p>;
  if (status === "error") return <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{message}</div>;
  if (status === "success") return <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>;
  return null;
}
