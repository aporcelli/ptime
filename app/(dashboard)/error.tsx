"use client";

// app/(dashboard)/error.tsx
// Catch-all Error Boundary para la sección del Dashboard.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSheetId } from "@/app/actions/setup";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const errorMsg = error.message || "";
  const isSheetMissing =
    errorMsg.includes("404") ||
    errorMsg.includes("403") ||
    errorMsg.includes("Requested entity was not found") ||
    errorMsg.includes("not found") ||
    errorMsg.includes("Sheet") ||
    errorMsg.includes("permission");

  useEffect(() => {
    console.error("[DashboardErrorBoundary]", error);
  }, [error]);

  async function handleReconnect() {
    setIsResetting(true);
    await clearSheetId().catch(() => {});
    document.cookie = "ptime-sheet-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/setup?error=SheetNotFound");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md w-full glass rounded-2xl p-8 border border-border shadow-xl flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl font-bold">
          {isSheetMissing ? "📊" : "⚠️"}
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          {isSheetMissing
            ? "Planilla No Encontrada en Google Drive"
            : "Ocurrió un error al cargar la información"}
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {isSheetMissing
            ? "No se pudo acceder a tu Google Sheet. Puede haber sido eliminada, movida a la papelera o los permisos de acceso cambiaron."
            : "No se pudieron obtener los datos de Google Sheets. Intentá nuevamente o reconectá tu planilla."}
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
          <button
            type="button"
            onClick={handleReconnect}
            disabled={isResetting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-sm"
          >
            {isResetting ? "Reconectando…" : "✨ Conectar o Crear Planilla"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl text-sm transition-colors border border-border"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
