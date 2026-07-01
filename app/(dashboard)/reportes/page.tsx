import type { Metadata } from "next";
import { getRegistrosHoras, getProyectos, getTareas, getAppConfig, getClientes } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatDateShort, formatHours, formatMonthYearLabel, formatPeriodLabel } from "@/lib/utils/index";
import { format, startOfMonth } from "date-fns";
import IngresosLineChart from "@/components/charts/IngresosLineChart";
import HorasPorProyecto from "@/components/charts/HorasPorProyecto";
import TareasPieChart from "@/components/charts/TareasPieChart";
import IngresosPorCliente from "@/components/charts/IngresosPorCliente";
import ActividadHeatmap from "@/components/charts/ActividadHeatmap";
import { BarChart3, TrendingUp, Clock } from "lucide-react";
import type { ReportData } from "@/types/api";
import { ReportesFiltersClient } from "./ReportesFiltersClient";
import type { HoraEstado } from "@/types/entities";
import { DataPanel, MetricCard, PageShell, SectionCard } from "@/components/ui/structure";
import { repriceMonthlyRecords } from "@/lib/hours/monthly";

export const metadata: Metadata = { title: "Reportes" };

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
  const clienteId = searchParams.clienteId;
  const estado     = searchParams.estado as HoraEstado | undefined;

  const [registros, proyectos, tareas, config, clientes] = await Promise.all([
    getRegistrosHoras(ctx, { fechaDesde, fechaHasta, proyectoId, estado }),
    getProyectos(ctx),
    getTareas(ctx),
    getAppConfig(ctx),
    getClientes(ctx),
  ]);

  const proyectosMap = new Map(proyectos.map(p => [p.id, p]));
  const clientesMap   = new Map(clientes.map(c => [c.id, c]));
  const tareasMap    = new Map(tareas.map(t => [t.id, t]));
  const registrosRepricedBase = repriceMonthlyRecords(registros, Object.fromEntries(proyectos.map((p) => [p.id, p])), config);
  const registrosRepriced = clienteId
    ? registrosRepricedBase.filter((r) => {
        const proyecto = proyectosMap.get(r.proyecto_id);
        const clienteRowId = r.cliente_id ?? proyecto?.cliente_id;
        return clienteRowId === clienteId;
      })
    : registrosRepricedBase;

  // ── Agregados por mes
  const porMesMap = registrosRepriced.reduce<Record<string, { horas: number; ingresos: number }>>((acc, r) => {
    const mes = r.fecha.slice(0, 7);
    const horasFact = r.horas_a_cobrar ?? r.horas;
    if (!acc[mes]) acc[mes] = { horas: 0, ingresos: 0 };
    acc[mes].horas    += horasFact;
    acc[mes].ingresos += r.monto_total;
    return acc;
  }, {});

  // ── Agregados por proyecto
  const porProyectoMap = registrosRepriced.reduce<Record<string, { nombre: string; horas: number; ingresos: number }>>((acc, r) => {
    const horasFact = r.horas_a_cobrar ?? r.horas;
    if (!acc[r.proyecto_id]) {
      const p = proyectosMap.get(r.proyecto_id);
      acc[r.proyecto_id] = { nombre: p?.nombre ?? "—", horas: 0, ingresos: 0 };
    }
    acc[r.proyecto_id].horas    += horasFact;
    acc[r.proyecto_id].ingresos += r.monto_total;
    return acc;
  }, {});

  // ── Agregados por tarea
  const porTareaMap = registrosRepriced.reduce<Record<string, { nombre: string; horas: number }>>((acc, r) => {
    const horasFact = r.horas_a_cobrar ?? r.horas;
    if (!acc[r.tarea_id]) {
      const t = tareasMap.get(r.tarea_id);
      acc[r.tarea_id] = { nombre: t?.nombre ?? "Sin tarea", horas: 0 };
    }
    acc[r.tarea_id].horas += horasFact;
    return acc;
  }, {});

  // ── Agregados por cliente
  const porClienteMap = registrosRepriced.reduce<Record<string, { nombre: string; horas: number; ingresos: number }>>((acc, r) => {
    const proyecto = proyectosMap.get(r.proyecto_id);
    const clienteId = r.cliente_id ?? proyecto?.cliente_id ?? "__sin_cliente__";
    const nombre = clientesMap.get(clienteId)?.nombre ?? "Sin cliente";
    const horasFact = r.horas_a_cobrar ?? r.horas;
    if (!acc[clienteId]) acc[clienteId] = { nombre, horas: 0, ingresos: 0 };
    acc[clienteId].horas += horasFact;
    acc[clienteId].ingresos += r.monto_total;
    return acc;
  }, {});

  // ── Actividad diaria para heatmap
  const actividadDiariaMap = registrosRepriced.reduce<Record<string, { horas: number; ingresos: number }>>((acc, r) => {
    const fecha = r.fecha.slice(0, 10);
    const horasFact = r.horas_a_cobrar ?? r.horas;
    if (!acc[fecha]) acc[fecha] = { horas: 0, ingresos: 0 };
    acc[fecha].horas += horasFact;
    acc[fecha].ingresos += r.monto_total;
    return acc;
  }, {});

  const totalHoras    = registrosRepriced.reduce((s, r) => s + (r.horas_a_cobrar ?? r.horas), 0);
  const totalHorasTrabajadas = registrosRepriced.reduce((s, r) => s + (r.horas_trabajadas ?? r.horas), 0);
  const totalIngresos = registrosRepriced.reduce((s, r) => s + r.monto_total, 0);
  const proyectosEnPeriodo = new Set(registrosRepriced.map((r) => r.proyecto_id)).size;

  const mesesData = Object.entries(porMesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, d]) => ({ mes: formatMonthYearLabel(mes), ...d }));

  const proyectosData = Object.values(porProyectoMap).sort((a, b) => b.ingresos - a.ingresos);
  const tareasDataRaw = Object.values(porTareaMap).sort((a, b) => b.horas - a.horas);
  const clientesData = Object.values(porClienteMap).sort((a, b) => b.ingresos - a.ingresos);

  const tareasData    = tareasDataRaw.map(t => ({
    ...t,
    porcentaje: totalHoras > 0 ? Math.round((t.horas / totalHoras) * 100) : 0,
  }));

  const actividadDiariaData = Object.entries(actividadDiariaMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, d]) => ({ fecha, ...d }));

  const mesesOrdenados = Object.entries(porMesMap).sort(([a], [b]) => b.localeCompare(a));

  // ── Alertas tramo 2
  const alertasTramo2 = proyectos
    .filter(p => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras))
    .map(p => ({ nombre: p.nombre, horasAcumuladas: p.horas_acumuladas, umbral: p.umbral_precio_alto ?? config.umbralHoras }));

  // ── ReportData para PDF
  const reportData: ReportData = {
    kpis: {
      totalHoras,
      totalHorasTrabajadas,
      totalIngresos,
      promedioHorasDia: +(totalHoras / 30).toFixed(2),
      proyectosActivos: proyectosEnPeriodo,
      registrosTotales: registrosRepriced.length,
    },
    porMes:      mesesData,
    porProyecto: proyectosData,
    porTarea:    tareasData,
    top3Proyectos: proyectosData.slice(0, 3).map(p => ({ nombre: p.nombre, ingresos: p.ingresos })),
    alertasTramo2,
    porCliente:  clientesData,
  };

  // ── Registros enriquecidos para detalle en PDF
  const registrosParaPdf = registrosRepriced
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map(r => {
      const proyecto = proyectosMap.get(r.proyecto_id);
      return {
        fecha:          formatDateShort(r.fecha),
        descripcion:    r.descripcion,
        clienteNombre:  clientesMap.get(r.cliente_id ?? proyecto?.cliente_id ?? "")?.nombre ?? "—",
        proyectoNombre: proyecto?.nombre ?? "—",
        horas:          r.horas,
        horasFacturadas: r.horas_a_cobrar ?? r.horas,
        precioHora:     r.precio_hora_aplicado,
        total:          r.monto_total,
        estado:         r.estado,
      };
    });

  return (
    <PageShell title="Reportes" description={`${formatPeriodLabel(fechaDesde, fechaHasta)} · ${registrosRepriced.length} registros`}>

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
        <MetricCard label="Total horas" value={formatHours(totalHoras)} icon={<Clock size={16} />} />
        <MetricCard label="Total ingresos" value={formatCurrency(totalIngresos, config.moneda)} icon={<TrendingUp size={16} />} tone="success" />
        <MetricCard label="Precio promedio/h" value={formatCurrency(totalHoras > 0 ? totalIngresos / totalHoras : 0, config.moneda)} icon={<BarChart3 size={16} />} tone="warning" />
      </div>

      {/* ── Charts (ECharts, 4-panel) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Tendencia de ingresos" icon={<TrendingUp size={16} className="text-primary" />}>
          <IngresosLineChart data={mesesData} moneda={config.moneda} showHoras />
        </SectionCard>

        <SectionCard title="Horas e ingresos por proyecto" icon={<BarChart3 size={16} className="text-primary" />}>
          <HorasPorProyecto data={proyectosData} moneda={config.moneda} />
        </SectionCard>

        <SectionCard title="Distribución por tarea">
          <TareasPieChart data={tareasData} />
        </SectionCard>

        <SectionCard title="Actividad diaria · ritmo y tendencia">
          <ActividadHeatmap data={actividadDiariaData} />
        </SectionCard>

        <SectionCard title="Ingresos por cliente" icon={<TrendingUp size={16} className="text-primary" />} className="lg:col-span-2">
          <IngresosPorCliente data={clientesData} moneda={config.moneda} />
        </SectionCard>
      </div>

      {/* ── Tabla por mes ── */}
      <SectionCard title="Detalle por mes">
        <DataPanel>
          <table className="w-full text-sm">
            <caption className="sr-only">Detalle mensual de horas e ingresos para el período seleccionado</caption>
            <thead>
              <tr className="bg-surface-high">
                {["Mes", "Horas", "Ingresos", "% del total"].map((h, i) => (
                  <th scope="col" key={h} className={`p-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${i === 0 ? "text-left" : "text-right"}`}>
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
                    <td className="p-3 font-mono text-on-surface font-medium">{formatMonthYearLabel(mes)}</td>
                    <td className="p-3 text-right font-sans text-on-surface-variant">{formatHours(d.horas)}</td>
                    <td className="p-3 text-right font-sans text-primary-fixed font-semibold">{formatCurrency(d.ingresos, config.moneda)}</td>
                    <td className="p-3 text-right text-on-surface-variant text-xs">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataPanel>
      </SectionCard>

      {/* ── Tabla por proyecto ── */}
      <SectionCard title="Detalle por proyecto">
        <DataPanel>
          <table className="w-full text-sm">
            <caption className="sr-only">Detalle por proyecto de horas e ingresos del período seleccionado</caption>
            <thead>
              <tr className="bg-surface-high">
                {["Proyecto", "Horas", "Ingresos"].map((h, i) => (
                  <th scope="col" key={h} className={`p-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${i === 0 ? "text-left" : "text-right"}`}>
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
                  <td className="p-3 text-right font-sans text-on-surface-variant">{formatHours(p.horas)}</td>
                  <td className="p-3 text-right font-sans text-primary-fixed font-semibold">{formatCurrency(p.ingresos, config.moneda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataPanel>
      </SectionCard>

    </PageShell>
  );
}
