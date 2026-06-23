// app/setup/SetupForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { validateAndSaveSheetId } from "@/app/actions/setup";
import { listUserSpreadsheets, createPtimeSpreadsheet } from "@/app/actions/drive";

const Loader2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

interface DriveFile { id: string; name: string; modifiedTime: string; }

export default function SetupForm({ sharedSheetId }: { sharedSheetId?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "paste" | "shared">(
    sharedSheetId ? "shared" : "select"
  );
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  // Load user's existing spreadsheets
  useEffect(() => {
    if (mode !== "select") return;
    setFilesLoading(true);
    listUserSpreadsheets().then((r) => {
      if (r.error) setFilesError(r.error);
      else setFiles(r.files ?? []);
      setFilesLoading(false);
    });
  }, [mode]);

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
    if (!id) {
      setStatus("error");
      setMessage("Invalid Sheet URL or ID.");
      return;
    }
    await connectSheet(id);
  }

  async function handleSharedSubmit() {
    if (!sharedSheetId) return;
    await connectSheet(sharedSheetId);
  }

  // ── Shared Workspace View ─────────────────────────
  if (mode === "shared") {
    return (
      <div className="flex flex-col gap-4">
        <motion.button
          onClick={handleSharedSubmit}
          disabled={status === "loading" || status === "success"}
          whileTap={{ scale: 0.98 }}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {status === "loading" && <Loader2 />}
          {status === "loading" ? "Connecting…" : "Join Shared Workspace"}
        </motion.button>
        {status === "error" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{message}</div>
        )}
        {status === "success" && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
        )}
        <button type="button" onClick={() => setMode("select")} className="text-xs text-muted-foreground hover:text-primary">
          Use a different sheet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main actions ──────────────────────────── */}
      <div className="grid gap-3">
        <motion.button
          onClick={() => setMode("create")}
          whileTap={{ scale: 0.98 }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create New Ptime Sheet
        </motion.button>

        <motion.button
          onClick={() => setMode("select")}
          whileTap={{ scale: 0.98 }}
          className="bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Select Existing Google Sheet
        </motion.button>
      </div>

      {/* ── Mode: list sheets ─────────────────────── */}
      {mode === "select" && (
        <div className="mt-2 space-y-2">
          {filesLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 /> Loading your spreadsheets…
            </div>
          )}
          {filesError && (
            <p className="text-xs text-destructive text-center py-3">{filesError}</p>
          )}
          {!filesLoading && !filesError && files.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground space-y-2">
              <p>No spreadsheets found.</p>
              <button onClick={() => setMode("paste")} className="text-primary hover:underline text-xs">
                Paste a URL instead
              </button>
            </div>
          )}
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => connectSheet(f.id)}
              disabled={status === "loading"}
              className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors flex items-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500 shrink-0"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(f.modifiedTime).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Mode: paste URL ──────────────────────── */}
      {(mode === "paste" || mode === "create") && (
        <form onSubmit={mode === "create" ? handleCreate as any : handleUrlSubmit} className="flex flex-col gap-3 mt-2">
          {mode === "paste" && (
            <>
              <label className="text-sm font-medium text-foreground">Google Sheet URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/…"
                className="bg-background border border-input rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                required
              />
            </>
          )}
          {mode === "create" && (
            <p className="text-sm text-muted-foreground">
              This will create a new Google Sheet named <strong>Ptime — Time Tracking</strong> in your Drive.
            </p>
          )}
          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileTap={{ scale: 0.98 }}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2"
          >
            {status === "loading" && <Loader2 />}
            {mode === "create" ? "Create & Connect" : "Connect Sheet"}
          </motion.button>
          {(mode === "create" || mode === "paste") && (
            <button type="button" onClick={() => setMode("select")} className="text-xs text-muted-foreground hover:text-primary">
              ← Back
            </button>
          )}
        </form>
      )}

      {/* ── Status messages ───────────────────────── */}
      {status === "loading" && mode !== "select" && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">{message}</p>
      )}
      {status === "error" && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{message}</div>
      )}
      {status === "success" && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
      )}

      {/* ── Fallback: paste URL ───────────────────── */}
      {mode === "select" && (
        <button type="button" onClick={() => setMode("paste")} className="text-xs text-muted-foreground hover:text-primary text-center mt-1">
          Or paste a Google Sheet URL manually
        </button>
      )}
    </div>
  );
}
