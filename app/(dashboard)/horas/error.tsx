"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

export default function HorasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HorasErrorBoundary]", error);
  }, [error]);

  const debugMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debug") === "1";
  }, []);

  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 space-y-3">
      <p className="font-semibold">Falló el render de Horas</p>
      <p className="text-sm">Hubo un error al procesar la vista luego de guardar.</p>

      {debugMode && (
        <pre className="text-xs whitespace-pre-wrap break-words rounded border border-red-200 bg-white p-3">
{JSON.stringify(
  {
    name: error?.name ?? null,
    message: error?.message ?? null,
    digest: error?.digest ?? null,
    stack: error?.stack ? String(error.stack).split("\n").slice(0, 8) : null,
  },
  null,
  2,
)}
        </pre>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-800"
        >
          Reintentar
        </button>
        <Link href="/horas" className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm hover:bg-red-100">
          Volver a Horas
        </Link>
      </div>
    </div>
  );
}
