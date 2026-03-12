// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getRegistrosHoras, getProyectos, getClientes } from "@/lib/sheets/queries";
import { getConfig } from "@/app/actions/config";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, DollarSign, FolderOpen, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

// Revalidar cada 5 minutos
export const revalidate = 300;

export default async function DashboardPage() {
  const session = await auth();
  const userId  = session?.user?.id;

  const hoy         = new Date();
  const fechaDesde  = format(startOfMonth(hoy), "yyyy-MM-dd");
  const fechaHasta  = format(endOfMonth(hoy),   "yyyy-MM-dd");

  const [registros, proyectos, config] = await Promise.all([
    getRegistrosHoras({ fechaDesde, fechaHasta }),
    getProyectos({ soloActivos: true }),
    getConfig(),
  ]);

  // KPIs del mes actual
  const totalHoras     = registros.reduce((s, r) => s + r.horas,       0);
  const totalIngresos  = registros.reduce((s, r) => s + r.monto_total, 0);
  const diasDelMes     = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const promedioHoras  = +(totalHoras / Math.max(diasDelMes, 1)).toFixed(2);

  // Proyectos que superaron el umbral
  const proyectosEnTramo2 = proyectos.filter(
    (p) => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras)
  );

  const mesActual = format(hoy, "MMMM yyyy", { locale: es });

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-ink capitalize">{mesActual}</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de actividad · {session?.user?.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Clock size={20} className="text-brand-600" />}
          label="Horas del mes"
          value={formatHours(totalHoras)}
          bg="bg-brand-50"
        />
        <KpiCard
          icon={<DollarSign size={20} className="text-green-600" />}
          label="Ingresos del mes"
          value={formatCurrency(totalIngresos, config.moneda)}
          bg="bg-green-50"
        />
        <KpiCard
          icon={<TrendingUp size={20} className="text-warm-500" />}
          label="Promedio diario"
          value={`${promedioHoras}h`}
          bg="bg-amber-50"
        />
        <KpiCard
          icon={<FolderOpen size={20} className="text-purple-600" />}
          label="Proyectos activos"
          value={String(proyectos.length)}
          bg="bg-purple-50"
        />
      </div>

      {/* Alerta proyectos en tramo 2 */}
      {proyectosEnTramo2.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-warm-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {proyectosEnTramo2.length} proyecto(s) facturando a ${config.precioAlto}/h
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {proyectosEnTramo2.map((p) => p.nombre).join(", ")} —
              superaron las {config.umbralHoras}h acumuladas.
            </p>
          </div>
        </div>
      )}

      {/* Quick action */}
      <div className="flex gap-3">
        <Link
          href="/horas/nuevo"
          className="
            bg-brand-600 hover:bg-brand-700 text-white font-semibold
            px-5 py-2.5 rounded-lg text-sm transition-colors
          "
        >
          + Cargar horas
        </Link>
        <Link
          href="/reportes"
          className="
            bg-white border border-border hover:border-brand-600 text-ink
            font-medium px-5 py-2.5 rounded-lg text-sm transition-colors
          "
        >
          Ver reportes
        </Link>
      </div>

      {/* Últimos registros */}
      {registros.length > 0 && (
        <div>
          <h2 className="font-semibold text-ink mb-3">Últimos registros del mes</h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horas</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                </tr>
              </thead>
              <tbody>
                {registros.slice(-5).reverse().map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="p-3 text-muted-foreground font-mono text-xs">{r.fecha}</td>
                    <td className="p-3 text-ink max-w-xs truncate">{r.descripcion}</td>
                    <td className="p-3 text-right font-mono text-ink">{r.horas}</td>
                    <td className="p-3 text-right font-mono text-brand-600 font-medium">
                      {formatCurrency(r.monto_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon, label, value, bg,
}: {
  icon:  React.ReactNode;
  label: string;
  value: string;
  bg:    string;
}) {
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
