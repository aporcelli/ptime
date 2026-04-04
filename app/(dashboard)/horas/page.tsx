import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrosHoras, getProyectos, getTareas } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { Plus } from "lucide-react";
import { HorasClientList } from "./HorasClientList";

export const metadata: Metadata = { title: "Mis Horas" };
export const revalidate = 60;

export default async function HorasPage() {
  const ctx = await getPageCtx();

  const [registros, proyectos, tareas] = await Promise.all([
    getRegistrosHoras(ctx),
    getProyectos(ctx),
    getTareas(ctx),
  ]);

  const proyectosMap = Object.fromEntries(proyectos.map((p) => [p.id, p]));
  const tareasMap = Object.fromEntries(tareas.map((t) => [t.id, t]));
  const totalHoras = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const ordenados = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">
            Registros de horas
          </h1>
          <p className="text-on-surface-variant mt-1">
            {registros.length} registros ·{" "}
            <span className="font-mono">{formatHours(totalHoras)}</span> ·{" "}
            <span className="font-mono text-primary-fixed">{formatCurrency(totalIngresos)}</span>
          </p>
        </div>
        <Link
          href="/horas/nuevo"
          className="flex items-center gap-2 bg-primary-fixed hover:bg-secondary text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> Cargar horas
        </Link>
      </div>

      {/* Client component: filter pills + tabla interactiva */}
      <HorasClientList
        registros={ordenados}
        proyectosMap={proyectosMap}
        tareasMap={tareasMap}
      />
    </div>
  );
}
