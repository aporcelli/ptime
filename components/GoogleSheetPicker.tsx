// components/GoogleSheetPicker.tsx
// Opens picker.html popup, reads result from localStorage
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Props {
  onSelect: (fileId: string) => void;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
}

export default function GoogleSheetPicker({ onSelect, disabled, label, variant = "primary" }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const openPicker = useCallback(() => {
    if (!session?.user?.accessToken) {
      setError("Please login first.");
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";
    const params = new URLSearchParams({ token: session.user.accessToken, key });
    const url = `/picker.html?${params.toString()}`;
    const w = 1050, h = 650;

    setLoading(true);
    setError(null);

    // Clear any previous result
    localStorage.removeItem("ptime-picker-result");

    const popup = window.open(url, "google-picker", `width=${w},height=${h},top=${Math.round((screen.height-h)/2)},left=${Math.round((screen.width-w)/2)}`);
    if (!popup) {
      setError("Popup blocked. Allow popups for this site.");
      setLoading(false);
      return;
    }

    // Poll localStorage for result
    const timer = setInterval(() => {
      const raw = localStorage.getItem("ptime-picker-result");
      if (!raw) {
        if (popup.closed) { clearInterval(timer); setLoading(false); }
        return;
      }
      clearInterval(timer);
      localStorage.removeItem("ptime-picker-result");
      try {
        const result = JSON.parse(raw);
        if (result.fileId) {
          onSelectRef.current(result.fileId);
        }
      } catch {}
      setLoading(false);
    }, 300);
  }, [session?.user?.accessToken]);

  const base = "font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm";
  const primary = "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20";
  const secondary = "bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700";

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={openPicker} disabled={disabled || loading}
        className={`${base} ${variant === "primary" ? primary : secondary}`}>
        {loading ? (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Select your sheet in the popup…</>
        ) : (label || "Choose from Google Drive")}
      </button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
