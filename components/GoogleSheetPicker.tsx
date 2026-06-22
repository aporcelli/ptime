// components/GoogleSheetPicker.tsx
// Google Picker integration for selecting a Google Sheet
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

let gapiLoadPromise: Promise<void> | null = null;

function loadGapi(): Promise<void> {
  if (gapiLoadPromise) return gapiLoadPromise;
  gapiLoadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return gapiLoadPromise;
}

function loadPicker(): Promise<void> {
  return new Promise((resolve) => {
    window.gapi.load("picker", { callback: resolve });
  });
}

// ── Icons ────────────────────────────────────────────────────────────────────

function DriveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l-13.75-23.1a7.4 7.4 0 0 0 6.6 13.15z" fill="#0066DA"/>
      <path d="m43.65 25 13.8-23.1a7.4 7.4 0 0 0-13.15 0z" fill="#00AC47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.9-1.5 1-3.35.15-4.9l-13.75 23.5c.35-.5.65-1.05 1.05-1.3z" fill="#EA4335"/>
      <path d="m43.65 25-13.75-23.1h28.6a7.4 7.4 0 0 1 6.7 3.85l13.75 23.1z" fill="#00832D"/>
      <path d="m29.9 1.9-27.5 47.6a7.35 7.35 0 0 0 .15 4.9l13.8-23.4z" fill="#2684FC"/>
      <path d="m13.85 77.5h59.7l-13.8-23.1h-32.1z" fill="#FFBA00"/>
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onSelect: (fileId: string, fileName: string) => void;
  disabled?: boolean;
}

export default function GoogleSheetPicker({ onSelect, disabled }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerReady, setPickerReady] = useState(false);

  // Load gapi + picker on mount
  useEffect(() => {
    loadGapi().then(() => loadPicker()).then(() => setPickerReady(true));
  }, []);

  const openPicker = useCallback(() => {
    if (!pickerReady || !session?.user?.accessToken) {
      setError("Session not ready. Please wait or re-login.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const g = window.google;
      const view = new g.picker.DocsView(g.picker.ViewId.SPREADSHEETS);
      view.setMode(g.picker.DocsViewMode.LIST);
      view.setIncludeFolders(false);

      const picker = new g.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(session.user.accessToken)
        .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "")
        .setCallback((data: any) => {
          if (data.action === g.picker.Action.PICKED) {
            const doc = data.docs[0];
            onSelect(doc.id, doc.name);
          }
          setLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to open Google Picker");
      setLoading(false);
    }
  }, [pickerReady, session?.user?.accessToken, onSelect]);

  if (!pickerReady) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading Picker…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || loading}
        className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm border border-slate-200 transition-colors disabled:opacity-50"
      >
        <DriveIcon />
        {loading ? "Opening Google Picker…" : "Choose a Google Sheet"}
      </button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
