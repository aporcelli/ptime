import type { Metadata } from "next";
import { getRegistrosHoras, getProyectos, getTareas, getAppConfig, getClientes } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, subMonths } from "date-fns";
import IngresosLineChart from "@/components/charts/IngresosLineChart";
import HorasPorProyecto from "@/components/charts/HorasPorProyecto";
import TareasPieChart from "@/components/charts/TareasPieChart";
import { BarChart3, TrendingUp, Clock, FileDown } from "lucide-react";
import type { ReportData } from "@/types/api";
import { ReporteExportClientDynamic } from "./ReporteExportClientDynamic";
import { ReportesFiltersClient } from "./ReportesFiltersClient";
import type { HoraEstado } from "@/types/entities";

export const metadata: Metadata = { title: "Reportes" };
export const revalidate = 300;

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const ctx = await getPageCtx();
  const defaultFechaDesde = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const defaultFechaHasta = format(new Date(), "yyyy-MM-dd");

  const fechaDesde = searchParams.fechaDesde ?? defaultFechaDesde;
  const fechaHasta = searchParams.fechaHasta ?? defaultFechaHasta;
  const proyectoId = searchParams.proyectoId;
  const estado     = searchParams.estado as HoraEstado | undefined;

  const [registros, proyectos, tareas, config, clientes] = await Promise.all([
    getRegistrosHoras(ctx, { fechaDesde, fechaHasta, proyectoId, estado }),
    getProyectos(ctx),
    getTareas(ctx),
    getAppConfig(ctx),
    getClientes(ctx),
  ]);

  const proyectosMap = new Map(proyectos.map(p => [p.id, p]));
  const tareasMap    = new Map(tareas.map(t => [t.id, t]));

  // ── Agregados por mes
  const porMesMap = registros.reduce<Record<string, { horas: number; ingresos: number }>>((acc, r) => {
    const mes = r.fecha.slice(0, 7);
    if (!acc[mes]) acc[mes] = { horas: 0, ingresos: 0 };
    acc[mes].horas    += r.horas;
    acc[mes].ingresos += r.monto_total;
    return acc;
  }, {});

  // ── Agregados por proyecto
  const porProyectoMap = registros.reduce<Record<string, { nombre: string; horas: number; ingresos: number }>>((acc, r) => {
    if (!acc[r.proyecto_id]) {
      const p = proyectosMap.get(r.proyecto_id);
      acc[r.proyecto_id] = { nombre: p?.nombre ?? "—", horas: 0, ingresos: 0 };
    }
    acc[r.proyecto_id].horas    += r.horas;
    acc[r.proyecto_id].ingresos += r.monto_total;
    return acc;
  }, {});

  // ── Agregados por tarea
  const porTareaMap = registros.reduce<Record<string, { nombre: string; horas: number }>>((acc, r) => {
    if (!acc[r.tarea_id]) {
      const t = tareasMap.get(r.tarea_id);
      acc[r.tarea_id] = { nombre: t?.nombre ?? "Sin tarea", horas: 0 };
    }
    acc[r.tarea_id].horas += r.horas;
    return acc;
  }, {});

  const totalHoras    = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);

  const mesesData = Object.entries(porMesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, d]) => ({ mes, ...d }));

  const proyectosData = Object.values(porProyectoMap).sort((a, b) => b.ingresos - a.ingresos);
  const tareasDataRaw = Object.values(porTareaMap).sort((a, b) => b.horas - a.horas);
  const tareasData    = tareasDataRaw.map(t => ({
    ...t,
    porcentaje: totalHoras > 0 ? Math.round((t.horas / totalHoras) * 100) : 0,
  }));

  const mesesOrdenados = Object.entries(porMesMap).sort(([a], [b]) => b.localeCompare(a));

  // ── Alertas tramo 2
  const alertasTramo2 = proyectos
    .filter(p => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras))
    .map(p => ({ nombre: p.nombre, horasAcumuladas: p.horas_acumuladas, umbral: p.umbral_precio_alto ?? config.umbralHoras }));

  // ── ReportData para PDF
  const reportData: ReportData = {
    kpis: {
      totalHoras,
      totalIngresos,
      promedioHorasDia: +(totalHoras / 30).toFixed(2),
      proyectosActivos: proyectos.filter(p => p.estado === "activo").length,
      registrosTotales: registros.length,
    },
    porMes:      mesesData,
    porProyecto: proyectosData,
    porTarea:    tareasData,
    top3Proyectos: proyectosData.slice(0, 3).map(p => ({ nombre: p.nombre, ingresos: p.ingresos })),
    alertasTramo2,
  };

  // ── Registros enriquecidos para detalle en PDF
  const registrosParaPdf = registros
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map(r => ({
      fecha:          r.fecha,
      descripcion:    r.descripcion,
      proyectoNombre: proyectosMap.get(r.proyecto_id)?.nombre ?? "—",
      horas:          r.horas,
      precioHora:     r.precio_hora_aplicado,
      total:          r.monto_total,
      estado:         r.estado,
    }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">Reportes</h1>
          <p className="text-on-surface-variant mt-1">
            {fechaDesde} → {fechaHasta} · {registros.length} registros
          </p>
        </div>
      </div>

      <ReportesFiltersClient
        clientes={clientes}
        proyectos={proyectos}
        data={reportData}
        registros={registrosParaPdf}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        moneda={config.moneda}
        nombreEmpresa={config.nombreEmpresa}
      />

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface-lowest rounded-xl p-5 shadow-ambient flex flex-col gap-2 border-l-4 border-primary-fixed">
          <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
            <Clock size={16} className="text-primary-fixed" />
          </div>
          <span className="text-sm text-on-surface-variant">Total horas</span>
          <span className="text-2xl font-semibold font-mono text-on-surface">{formatHours(totalHoras)}</span>
        </div>
        <div className="bg-surface-lowest rounded-xl p-5 shadow-ambient flex flex-col gap-2 border-l-4 border-primary-fixed">
          <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
            <TrendingUp size={16} className="text-primary-fixed" />
          </div>
          <span className="text-sm text-on-surface-variant">Total ingresos</span>
          <span className="text-2xl font-semibold font-mono text-primary-fixed">{formatCurrency(totalIngresos, config.moneda)}</span>
        </div>
        <div className="bg-surface-lowest rounded-xl p-5 shadow-ambient flex flex-col gap-2 col-span-2 md:col-span-1 border-l-4 border-amber-400">
          <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
            <BarChart3 size={16} className="text-amber-500" />
          </div>
          <span className="text-sm text-on-surface-variant">Precio promedio/h</span>
          <span className="text-2xl font-semibold font-mono text-on-surface">
            {formatCurrency(totalHoras > 0 ? totalIngresos / totalHoras : 0, config.moneda)}
          </span>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-surface-lowest rounded-xl p-5 shadow-ambient">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-fixed" /> Tendencia de ingresos
          </h2>
          <IngresosLineChart data={mesesData} moneda={config.moneda} showHoras />
        </section>

        <section className="bg-surface-lowest rounded-xl p-5 shadow-ambient">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-fixed" /> Horas por proyecto
          </h2>
          <HorasPorProyecto data={proyectosData} moneda={config.moneda} />
        </section>
      </div>

      <section className="bg-surface-lowest rounded-xl p-5 shadow-ambient">
        <h2 className="font-semibold text-on-surface mb-4">Distribución por tarea</h2>
        <div className="max-w-md mx-auto">
          <TareasPieChart data={tareasData} />
        </div>
      </section>

      {/* ── Tabla por mes ── */}
      <section>
        <h2 className="font-semibold text-on-surface mb-3">Detalle por mes</h2>
        <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-high">
                {["Mes", "Horas", "Ingresos", "% del total"].map((h, i) => (
                  <th key={h} className={`p-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${i === 0 ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesesOrdenados.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant text-sm">Sin datos en el período</td></tr>
              ) : mesesOrdenados.map(([mes, d], i) => {
                const pct = totalIngresos > 0 ? Math.round((d.ingresos / totalIngresos) * 100) : 0;
                return (
                  <tr key={mes} className={`transition-colors hover:bg-surface-low ${i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"}`}>
                    <td className="p-3 font-mono text-on-surface font-medium">{mes}</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant">{formatHours(d.horas)}</td>
                    <td className="p-3 text-right font-mono text-primary-fixed font-semibold">{formatCurrency(d.ingresos, config.moneda)}</td>
                    <td className="p-3 text-right text-on-surface-variant text-xs">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Tabla por proyecto ── */}
      <section>
        <h2 className="font-semibold text-on-surface mb-3">Detalle por proyecto</h2>
        <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-high">
                {["Proyecto", "Horas", "Ingresos"].map((h, i) => (
                  <th key={h} className={`p-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${i === 0 ? "text-left" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyectosData.length === 0 ? (
                <tr><td colSpan={3} className="p-6 text-center text-on-surface-variant text-sm">Sin datos en el período</td></tr>
              ) : proyectosData.map((p, i) => (
                <tr key={p.nombre} className={`transition-colors hover:bg-surface-low ${i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"}`}>
                  <td className="p-3 font-medium text-on-surface">{p.nombre}</td>
                  <td className="p-3 text-right font-mono text-on-surface-variant">{formatHours(p.horas)}</td>
                  <td className="p-3 text-right font-mono text-primary-fixed font-semibold">{formatCurrency(p.ingresos, config.moneda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
