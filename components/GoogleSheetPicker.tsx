// components/GoogleSheetPicker.tsx
// Google Picker with global postMessage listener as fallback
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

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

interface Props {
  onSelect: (fileId: string, fileName: string) => void;
  disabled?: boolean;
}

export default function GoogleSheetPicker({ onSelect, disabled }: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect; // always fresh

  // Load gapi script
  useEffect(() => {
    if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
      waitForGapiAndPicker();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://apis.google.com/js/api.js";
    s.onload = () => waitForGapiAndPicker();
    s.onerror = () => setError("Failed to load Google API.");
    document.head.appendChild(s);
  }, []);

  function waitForGapiAndPicker() {
    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (window.gapi?.load) {
        clearInterval(check);
        window.gapi.load("picker", () => {
          if (window.google?.picker) setReady(true);
          else setError("Picker module failed to load.");
        });
      } else if (attempts > 100) { // 20s
        clearInterval(check);
        setError("Google API failed to load. Use URL paste below.");
      }
    }, 200);
  }

  // Global postMessage listener — captures Picker result
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== "https://docs.google.com") return;
      if (!e.data || typeof e.data !== "object") return;

      // Try to extract selected file from RPC response
      const data = e.data;
      if (data.params?.docs?.[0]) {
        const doc = data.params.docs[0];
        onSelectRef.current(doc.id, doc.name || "Untitled");
        setLoading(false);
      } else if (data.params?.action === "picked" || data.action === "picked") {
        const doc = data.params?.docs?.[0] || data.docs?.[0];
        if (doc) {
          onSelectRef.current(doc.id, doc.name || "Untitled");
          setLoading(false);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const openPicker = useCallback(() => {
    if (!ready || !session?.user?.accessToken) {
      setError("Picker not ready. Please wait or re-login.");
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
          console.log("[Picker callback]", data);
          if (data.action === g.picker.Action.PICKED && data.docs?.[0]) {
            onSelectRef.current(data.docs[0].id, data.docs[0].name || "Untitled");
          }
          setLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to open Picker");
      setLoading(false);
    }
  }, [ready, session?.user?.accessToken]);

  return (
    <div className="flex flex-col items-center gap-3">
      {!ready && !error && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          Loading Google Picker…
        </div>
      )}
      {error && (
        <p className="text-xs text-destructive py-2">{error}</p>
      )}
      {ready && (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || loading}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm border border-slate-200 transition-colors disabled:opacity-50"
        >
          <DriveIcon />
          Choose a Google Sheet
        </button>
      )}
    </div>
  );
}
