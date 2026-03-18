// app/setup/page.tsx — FUERA del (dashboard) group, no requiere sheetId
import type { Metadata } from "next";
import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { cookies }  from "next/headers";
import SetupForm    from "./SetupForm";

export const metadata: Metadata = { title: "Configurar Sheet | Ptime" };

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Si ya tiene sheet configurado, ir al dashboard
  const cookieStore = cookies();
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value;
  if (sheetId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-4">
      {/* Blobs */}
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-warm-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl text-white">
            P<span className="text-warm-500 italic">time</span>
          </h1>
        </div>

        <div className="bg-ink-2 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-white font-semibold text-xl mb-1">
              Conectá tu Google Sheet
            </h2>
            <p className="text-slate-400 text-sm">
              Ptime usa un Google Sheet como base de datos.<br />
              Creá uno nuevo o usá uno existente.
            </p>
          </div>

          {/* Instrucciones */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 text-xs uppercase tracking-wide">¿Cómo obtener el Sheet ID?</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Andá a <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">sheets.new</a> y creá una hoja vacía</li>
              <li>Copiá el ID de la URL:<br/>
                <code className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded text-[11px] break-all">
                  sheets.google.com/d/<span className="text-warm-400 font-bold">ID_AQUI</span>/edit
                </code>
              </li>
              <li>Pegalo abajo — Ptime crea las hojas automáticamente</li>
            </ol>
          </div>

          <SetupForm />
        </div>
      </div>
    </main>
  );
}
