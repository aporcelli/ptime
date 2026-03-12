// app/(dashboard)/reportes/page.tsx
import type { Metadata } from "next";
import { getRegistrosHoras, getProyectos, getClientes, getTareas } from "@/lib/sheets/queries";
import { getConfig } from "@/app/actions/config";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, subMonths } from "date-fns";

export const metadata: Metadata = { title: "Reportes" };
export const revalidate = 300;

export default async function ReportesPage() {
  const hace6Meses = format(subMonths(startOfMonth(new Date()), 5), "yyyy-MM-dd");

  const [registros, proyectos, clientes, tareas, config] = await Promise.all([
    getRegistrosHoras({ fechaDesde: hace6Meses }),
    getProyectos(),
    getClientes(),
    getTareas(),
    getConfig(),
  ]);

  // Agrupar por mes
  const porMes = registros.reduce<Record<string, { horas: number; ingresos: number }>>(
    (acc, r) => {
      const mes = r.fecha.slice(0, 7);
      if (!acc[mes]) acc[mes] = { horas: 0, ingresos: 0 };
      acc[mes].horas    += r.horas;
      acc[mes].ingresos += r.monto_total;
      return acc;
    },
    {}
  );

  // Agrupar por proyecto
  const porProyecto = registros.reduce<Record<string, { nombre: string; horas: number; ingresos: number }>>(
    (acc, r) => {
      if (!acc[r.proyecto_id]) {
        const p = proyectos.find((p) => p.id === r.proyecto_id);
        acc[r.proyecto_id] = { nombre: p?.nombre ?? r.proyecto_id.slice(0, 8), horas: 0, ingresos: 0 };
      }
      acc[r.proyecto_id].horas    += r.horas;
      acc[r.proyecto_id].ingresos += r.monto_total;
      return acc;
    },
    {}
  );

  const totalHoras    = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const mesesOrdenados = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b));
  const proyectosOrdenados = Object.values(porProyecto).sort((a, b) => b.ingresos - a.ingresos);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Reportes</h1>
        <p className="text-muted-foreground mt-1">Últimos 6 meses · {registros.length} registros</p>
      </div>

      {/* Resumen total */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="stat-label">Total horas</span>
          <span className="stat-value">{formatHours(totalHoras)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total ingresos</span>
          <span className="stat-value text-brand-600">{formatCurrency(totalIngresos, config.moneda)}</span>
        </div>
        <div className="stat-card col-span-2 md:col-span-1">
          <span className="stat-label">Precio promedio/h</span>
          <span className="stat-value">
            {formatCurrency(totalHoras > 0 ? totalIngresos / totalHoras : 0, config.moneda)}
          </span>
        </div>
      </div>

      {/* Por mes */}
      <section>
        <h2 className="font-semibold text-ink mb-3">Actividad mensual</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mes</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horas</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {mesesOrdenados.reverse().map(([mes, data]) => (
                <tr key={mes} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="p-3 font-mono text-ink">{mes}</td>
                  <td className="p-3 text-right font-mono">{formatHours(data.horas)}</td>
                  <td className="p-3 text-right font-mono text-brand-600 font-semibold">
                    {formatCurrency(data.ingresos, config.moneda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Por proyecto */}
      <section>
        <h2 className="font-semibold text-ink mb-3">Por proyecto</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Proyecto</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horas</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {proyectosOrdenados.map((p) => (
                <tr key={p.nombre} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="p-3 font-medium text-ink">{p.nombre}</td>
                  <td className="p-3 text-right font-mono">{formatHours(p.horas)}</td>
                  <td className="p-3 text-right font-mono text-brand-600 font-semibold">
                    {formatCurrency(p.ingresos, config.moneda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
