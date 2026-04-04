// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRegistrosHoras, getProyectos, getAppConfig } from "@/lib/sheets/queries";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Clock, DollarSign, FolderOpen, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/charts/Sparkline";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 300;

export default async function DashboardPage() {
  const session = await auth();
  const cookieStore = cookies();
  const sheetId = cookieStore.get("ptime-sheet-id")?.value;
  const accessToken = session?.user?.accessToken;

  if (!sheetId || !accessToken) redirect("/setup");

  const ctx = { sheetId, accessToken };

  const hoy = new Date();
  const fechaDesde = format(startOfMonth(hoy), "yyyy-MM-dd");
  const fechaHasta = format(endOfMonth(hoy), "yyyy-MM-dd");

  const [registros, proyectos, config] = await Promise.all([
    getRegistrosHoras(ctx, { fechaDesde, fechaHasta }),
    getProyectos(ctx, { soloActivos: true }),
    getAppConfig(ctx),
  ]);

  const totalHoras = registros.reduce((s, r) => s + r.horas, 0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const promedioHoras = +(totalHoras / Math.max(diasDelMes, 1)).toFixed(2);

  const proyectosEnTramo2 = proyectos.filter(
    (p) => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras)
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">Dashboard</h1>
        <p className="text-on-surface-variant mt-1">
          {format(hoy, "MMMM yyyy")} · {session?.user?.name}
        </p>
      </div>

      {/* KPIs — Meridian cards con shadow-ambient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Clock size={18} className="text-primary-fixed" />}
          label="Horas del mes"
          value={formatHours(totalHoras)}
          sparkData={registros.slice(-7).map(r => r.horas)}
        />
        <KpiCard
          icon={<DollarSign size={18} className="text-primary-fixed" />}
          label="Ingresos del mes"
          value={formatCurrency(totalIngresos, config.moneda)}
          accent
          sparkData={registros.slice(-7).map(r => r.monto_total)}
        />
        <KpiCard
          icon={<TrendingUp size={18} className="text-amber-500" />}
          label="Promedio diario"
          value={`${promedioHoras}h`}
          sparkColor="#F59E0B"
        />
        <KpiCard
          icon={<FolderOpen size={18} className="text-on-surface-variant" />}
          label="Proyectos activos"
          value={String(proyectos.length)}
          sparkColor="#041627"
        />
      </div>

      {/* Alerta tramo 2 */}
      {proyectosEnTramo2.length > 0 && (
        <div className="alert-amber">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-ink)" }}>
              {proyectosEnTramo2.length} proyecto(s) facturando a ${config.precioAlto}/h
            </p>
            <p className="text-xs text-sub mt-0.5">
              {proyectosEnTramo2.map((p) => p.nombre).join(", ")} — superaron las {config.umbralHoras}h
            </p>
          </div>
        </div>
      )}

      {/* Acciones rápidas — Meridian buttons */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/horas/nuevo" className="bg-primary-fixed hover:bg-secondary text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
          + Cargar horas
        </Link>
        <Link href="/reportes" className="font-medium px-5 py-2.5 rounded-lg text-sm transition-colors bg-surface-low hover:bg-surface-high text-on-surface">
          Ver reportes
        </Link>
      </div>

      {/* Últimos registros — Meridian No-Line Rule */}
      {registros.length > 0 && (
        <div>
          <h2 className="font-semibold text-on-surface mb-3">Últimos registros del mes</h2>
          <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-ambient">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-high">
                  {["Fecha", "Descripción", "Horas", "Monto"].map((h) => (
                    <th key={h} className={`p-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant ${h !== "Fecha" && h !== "Descripción" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...registros].reverse().slice(0, 5).map((r, i) => (
                  <tr key={r.id} className={`transition-colors hover:bg-surface-low ${i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"}`}>
                    <td className="p-3 font-mono text-xs text-on-surface-variant">{r.fecha}</td>
                    <td className="p-3 text-on-surface max-w-xs truncate">{r.descripcion}</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant">{r.horas}h</td>
                    <td className="p-3 text-right font-mono text-primary-fixed font-semibold">{formatCurrency(r.monto_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {registros.length === 0 && (
        <div className="bg-surface-lowest rounded-xl p-10 text-center shadow-ambient">
          <p className="text-on-surface-variant text-sm">No hay registros este mes.</p>
          <Link href="/horas/nuevo" className="text-primary-fixed text-sm font-medium mt-2 inline-block hover:underline">
            Cargá tu primer registro →
          </Link>
        </div>
      )}
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  sparkData?: number[];
  sparkColor?: string;
}

function KpiCard({ icon, label, value, accent, sparkData, sparkColor }: KpiCardProps) {
  return (
    <div className="bg-surface-lowest rounded-xl p-5 flex flex-col gap-2 shadow-ambient transition-all hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center">
          {icon}
        </div>
        {sparkData && sparkData.length > 0 && (
          <Sparkline data={sparkData} color={sparkColor ?? "#009944"} height={28} />
        )}
      </div>
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className={`text-2xl font-semibold font-mono ${accent ? "text-primary-fixed" : "text-on-surface"}`}>
        {value}
      </span>
    </div>
  );
}
