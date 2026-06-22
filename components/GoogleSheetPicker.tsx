// components/GoogleSheetPicker.tsx
// Google Picker — single-responsibility, robust loading
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

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

// ── Ensure gapi is loaded (retry up to 20 seconds) ───────────────────────────

function waitForGapi(timeoutMs = 20000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      if (typeof window !== "undefined" && window.gapi && typeof window.gapi.load === "function") {
        return resolve();
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error("gapi did not load within timeout"));
      }
      setTimeout(check, 200);
    }
    check();
  });
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
  const [ready, setReady] = useState(false);

  // Load picker module when gapi becomes available
  useEffect(() => {
    let cancelled = false;

    waitForGapi(15000)
      .then(() => {
        if (cancelled) return;
        return new Promise<void>((res) => window.gapi.load("picker", { callback: res }));
      })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled)
          setError("Google Picker failed to load. Use the URL paste option below.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openPicker = useCallback(() => {
    if (!ready || !session?.user?.accessToken) {
      setError("Please wait for Picker to load or re-login.");
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
        .setOrigin(window.location.origin)
        .setCallback((data: any) => {
          if (data.action === g.picker.Action.PICKED && data.docs?.[0]) {
            const doc = data.docs[0];
            onSelect(doc.id, doc.name || "Untitled");
          }
          // Ensure loading state resets even if action is CANCEL or error
          setLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to open Google Picker");
      setLoading(false);
    }
  }, [ready, session?.user?.accessToken, onSelect]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <p className="text-xs text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground">
          Paste your Google Sheet URL below instead.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        Loading Google Picker…
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      disabled={disabled || loading}
      className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm border border-slate-200 transition-colors disabled:opacity-50"
    >
      <DriveIcon />
      {loading ? "Choose a Google Sheet" : "Choose a Google Sheet"}
    </button>
  );
}
