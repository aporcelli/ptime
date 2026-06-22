// components/GapiLoader.tsx
// Client component that loads Google API client library
"use client";

import { useEffect } from "react";

export default function GapiLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // Keep script on unmount (used across pages)
    };
  }, []);

  return <>{children}</>;
}
