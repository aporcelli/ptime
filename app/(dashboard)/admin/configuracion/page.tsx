import type { Metadata } from "next";
import { auth }         from "@/auth";
import { getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx }   from "@/lib/sheets/getPageCtx";
import { cookies }      from "next/headers";
import ConfigForm       from "./ConfigForm";
import Link             from "next/link";
import { Settings, Database, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const session     = await auth();
  const ctx         = await getPageCtx();
  const config      = await getAppConfig(ctx);
  const cookieStore = cookies();
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value ?? "";

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-ink">Configuración</h1>
        <p className="text-slate-500 mt-1">Ajustes de tu espacio de trabajo en Ptime</p>
      </div>

      {/* Sección: Precios */}
      <section>
        <SectionHeader icon={<Settings size={16} />} title="Precios globales" />
        <ConfigForm defaultValues={config} />
      </section>

      {/* Sección: Sheet conectado */}
      <section>
        <SectionHeader icon={<Database size={16} />} title="Google Sheet conectado" />
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Sheet ID activo</p>
              <p className="font-mono text-xs text-slate-400 mt-1 break-all">{sheetId || "No configurado"}</p>
            </div>
            <form action={async () => {
              "use server";
              const { cookies } = await import("next/headers");
              cookies().delete("ptime-sheet-id");
            }}>
              <button type="submit"
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                Desconectar
              </button>
            </form>
          </div>
          <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noopener noreferrer"
            className="mt-3 text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
            Abrir en Google Sheets →
          </a>
        </div>
      </section>

      {/* Sección: Tu cuenta */}
      <section>
        <SectionHeader icon={<ShieldCheck size={16} />} title="Tu cuenta" />
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="text-sm font-medium text-ink">{session?.user?.name}</p>
              <p className="text-xs text-slate-400">{session?.user?.email}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${session?.user?.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
            {session?.user?.role}
          </span>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <h2 className="font-semibold text-ink text-sm uppercase tracking-wide">{title}</h2>
    </div>
  );
}
