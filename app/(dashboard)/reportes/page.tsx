import type { Metadata } from "next";
import { getRegistrosHoras, getProyectos, getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx }   from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, subMonths } from "date-fns";

export const metadata: Metadata = { title: "Reportes" };
export const revalidate = 300;

export default async function ReportesPage() {
  const ctx        = await getPageCtx();
  const hace6Meses = format(subMonths(startOfMonth(new Date()), 5), "yyyy-MM-dd");

  const [registros, proyectos, config] = await Promise.all([
    getRegistrosHoras(ctx, { fechaDesde: hace6Meses }),
    getProyectos(ctx),
    getAppConfig(ctx),
  ]);

  const porMes = registros.reduce<Record<string, { horas: number; ingresos: number }>>((acc, r) => {
    const mes = r.fecha.slice(0, 7);
    if (!acc[mes]) acc[mes] = { horas: 0, ingresos: 0 };
    acc[mes].horas    += r.horas;
    acc[mes].ingresos += r.monto_total;
    return acc;
  }, {});

  const porProyecto = registros.reduce<Record<string, { nombre: string; horas: number; ingresos: number }>>((acc, r) => {
    if (!acc[r.proyecto_id]) {
      const p = proyectos.find((p) => p.id === r.proyecto_id);
      acc[r.proyecto_id] = { nombre: p?.nombre ?? r.proyecto_id.slice(0, 8), horas: 0, ingresos: 0 };
    }
    acc[r.proyecto_id].horas    += r.horas;
    acc[r.proyecto_id].ingresos += r.monto_total;
    return acc;
  }, {});

  const totalHoras    = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const mesesOrdenados     = Object.entries(porMes).sort(([a], [b]) => b.localeCompare(a));
  const proyectosOrdenados = Object.values(porProyecto).sort((a, b) => b.ingresos - a.ingresos);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Reportes</h1>
        <p className="text-slate-500 mt-1">Últimos 6 meses · {registros.length} registros</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card"><span className="stat-label">Total horas</span><span className="stat-value">{formatHours(totalHoras)}</span></div>
        <div className="stat-card"><span className="stat-label">Total ingresos</span><span className="stat-value text-brand-600">{formatCurrency(totalIngresos, config.moneda)}</span></div>
        <div className="stat-card col-span-2 md:col-span-1">
          <span className="stat-label">Precio promedio/h</span>
          <span className="stat-value">{formatCurrency(totalHoras > 0 ? totalIngresos / totalHoras : 0, config.moneda)}</span>
        </div>
      </div>

      <section>
        <h2 className="font-semibold text-ink mb-3">Por mes</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Mes","Horas","Ingresos"].map((h) => <th key={h} className={`p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === "Mes" ? "text-left" : "text-right"}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {mesesOrdenados.map(([mes, data]) => (
                <tr key={mes} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-ink">{mes}</td>
                  <td className="p-3 text-right font-mono text-slate-600">{formatHours(data.horas)}</td>
                  <td className="p-3 text-right font-mono text-brand-600 font-semibold">{formatCurrency(data.ingresos, config.moneda)}</td>
                </tr>
              ))}
              {mesesOrdenados.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-400 text-sm">Sin datos en el período</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-ink mb-3">Por proyecto</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Proyecto","Horas","Ingresos"].map((h) => <th key={h} className={`p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === "Proyecto" ? "text-left" : "text-right"}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {proyectosOrdenados.map((p) => (
                <tr key={p.nombre} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-ink">{p.nombre}</td>
                  <td className="p-3 text-right font-mono text-slate-600">{formatHours(p.horas)}</td>
                  <td className="p-3 text-right font-mono text-brand-600 font-semibold">{formatCurrency(p.ingresos, config.moneda)}</td>
                </tr>
              ))}
              {proyectosOrdenados.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-400 text-sm">Sin datos en el período</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
