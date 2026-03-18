import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrosHoras, getProyectos, getTareas } from "@/lib/sheets/queries";
import { getPageCtx }   from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Mis Horas" };
export const revalidate = 60;

const ESTADO_COLORS: Record<string, string> = {
  borrador:   "bg-slate-100 text-slate-600",
  confirmado: "bg-green-100 text-green-700",
  facturado:  "bg-blue-100 text-blue-700",
};

export default async function HorasPage() {
  const ctx = await getPageCtx();

  const [registros, proyectos, tareas] = await Promise.all([
    getRegistrosHoras(ctx),
    getProyectos(ctx),
    getTareas(ctx),
  ]);

  const proyectosMap = new Map(proyectos.map((p) => [p.id, p]));
  const tareasMap    = new Map(tareas.map((t) => [t.id, t]));
  const totalHoras    = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const ordenados     = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Registros de horas</h1>
          <p className="text-slate-500 mt-1">
            {registros.length} registros · <span className="font-mono">{formatHours(totalHoras)}</span> · <span className="font-mono text-brand-600">{formatCurrency(totalIngresos)}</span>
          </p>
        </div>
        <Link href="/horas/nuevo" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Cargar horas
        </Link>
      </div>

      {ordenados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay registros aún.</p>
          <Link href="/horas/nuevo" className="text-brand-600 text-sm font-medium mt-2 inline-block hover:underline">Cargá tu primer registro →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha","Proyecto","Tarea","Descripción","Horas","$/h","Total","Estado"].map((h) => (
                    <th key={h} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordenados.map((r) => {
                  const proyecto = proyectosMap.get(r.proyecto_id);
                  const tarea    = tareasMap.get(r.tarea_id);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-xs text-slate-400 whitespace-nowrap">{r.fecha}</td>
                      <td className="p-3 font-medium text-ink whitespace-nowrap">{proyecto?.nombre ?? "—"}</td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{tarea?.nombre ?? "—"}</td>
                      <td className="p-3 text-ink max-w-[200px] truncate">{r.descripcion}</td>
                      <td className="p-3 text-right font-mono text-ink whitespace-nowrap">{r.horas}h</td>
                      <td className="p-3 text-right font-mono text-slate-400 whitespace-nowrap">${r.precio_hora_aplicado}</td>
                      <td className="p-3 text-right font-mono text-brand-600 font-semibold whitespace-nowrap">{formatCurrency(r.monto_total)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[r.estado]}`}>{r.estado}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
