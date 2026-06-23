// components/GoogleSheetPicker.tsx
// Opens picker.html popup, receives result via postMessage
"use client";

import { useState, useCallback, useEffect } from "react";
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

  // Listen for postMessage from picker.html popup
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.action === "picked" && e.data.fileId) {
        onSelect(e.data.fileId);
        setLoading(false);
      } else if (e.data?.action === "cancelled") {
        setLoading(false);
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelect]);

  const openPicker = useCallback(() => {
    if (!session?.user?.accessToken) {
      setError("Please login first.");
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";
    const params = new URLSearchParams({
      token: session.user.accessToken,
      key,
    });
    const url = `/picker.html?${params.toString()}`;

    const w = 1050;
    const h = 650;
    const left = Math.round((screen.width - w) / 2);
    const top = Math.round((screen.height - h) / 2);

    setLoading(true);
    setError(null);

    const popup = window.open(url, "google-picker", `width=${w},height=${h},top=${top},left=${left}`);

    if (!popup) {
      setError("Popup blocked. Allow popups for this site and try again.");
      setLoading(false);
      return;
    }

    // Watch for popup close
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setLoading(false);
      }
    }, 500);
  }, [session?.user?.accessToken]);

  const baseClasses = "font-semibold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm";
  const primaryClasses = "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20";
  const secondaryClasses = "bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || loading}
        className={`${baseClasses} ${variant === "primary" ? primaryClasses : secondaryClasses}`}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Select your sheet in the popup…
          </>
        ) : (
          label || "Choose from Google Drive"
        )}
      </button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}
