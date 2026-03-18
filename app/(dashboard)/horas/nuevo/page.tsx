import type { Metadata } from "next";
import { getTareas, getProyectos } from "@/lib/sheets/queries";
import { getAppConfig }  from "@/lib/sheets/queries";
import { getPageCtx }    from "@/lib/sheets/getPageCtx";
import HorasForm         from "@/components/forms/HorasForm";

export const metadata: Metadata = { title: "Cargar Horas" };

export default async function NuevaHoraPage() {
  const ctx = await getPageCtx();

  const [tareas, proyectos, config] = await Promise.all([
    getTareas(ctx, true),
    getProyectos(ctx, { soloActivos: true }),
    getAppConfig(ctx),
  ]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Cargar horas</h1>
        <p className="text-slate-500 mt-1">Registrá el tiempo trabajado en un proyecto</p>
      </div>
      <HorasForm tareas={tareas} proyectos={proyectos} defaultConfig={config} />
    </div>
  );
}
