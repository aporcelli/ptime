// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { auth }    from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRegistrosHoras, getProyectos, getAppConfig } from "@/lib/sheets/queries";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Clock, DollarSign, FolderOpen, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 300;

export default async function DashboardPage() {
  const session     = await auth();
  const cookieStore = cookies();
  const sheetId     = cookieStore.get("ptime-sheet-id")?.value;
  const accessToken = session?.user?.accessToken;

  if (!sheetId || !accessToken) redirect("/setup");

  const ctx = { sheetId, accessToken };

  const hoy        = new Date();
  const fechaDesde = format(startOfMonth(hoy), "yyyy-MM-dd");
  const fechaHasta = format(endOfMonth(hoy),   "yyyy-MM-dd");

  const [registros, proyectos, config] = await Promise.all([
    getRegistrosHoras(ctx, { fechaDesde, fechaHasta }),
    getProyectos(ctx, { soloActivos: true }),
    getAppConfig(ctx),
  ]);

  const totalHoras    = registros.reduce((s, r) => s + r.horas,       0);
  const totalIngresos = registros.reduce((s, r) => s + r.monto_total, 0);
  const diasDelMes    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const promedioHoras = +(totalHoras / Math.max(diasDelMes, 1)).toFixed(2);

  const proyectosEnTramo2 = proyectos.filter(
    (p) => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras)
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {format(hoy, "MMMM yyyy")} · {session?.user?.name}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Clock size={20} className="text-brand-600" />}      bg="bg-blue-50"   label="Horas del mes"     value={formatHours(totalHoras)} />
        <KpiCard icon={<DollarSign size={20} className="text-green-600" />} bg="bg-green-50"  label="Ingresos del mes"  value={formatCurrency(totalIngresos, config.moneda)} />
        <KpiCard icon={<TrendingUp size={20} className="text-amber-500" />} bg="bg-amber-50"  label="Promedio diario"   value={`${promedioHoras}h`} />
        <KpiCard icon={<FolderOpen size={20} className="text-purple-600" />}bg="bg-purple-50" label="Proyectos activos" value={String(proyectos.length)} />
      </div>

      {/* Alerta tramo 2 */}
      {proyectosEnTramo2.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {proyectosEnTramo2.length} proyecto(s) facturando a ${config.precioAlto}/h
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {proyectosEnTramo2.map((p) => p.nombre).join(", ")} — superaron las {config.umbralHoras}h
            </p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/horas/nuevo" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
          + Cargar horas
        </Link>
        <Link href="/reportes" className="bg-white border border-slate-200 hover:border-brand-600 text-ink font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
          Ver reportes
        </Link>
      </div>

      {/* Últimos registros */}
      {registros.length > 0 && (
        <div>
          <h2 className="font-semibold text-ink mb-3">Últimos registros del mes</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha","Descripción","Horas","Monto"].map((h) => (
                    <th key={h} className={`p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h !== "Fecha" && h !== "Descripción" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...registros].reverse().slice(0, 5).map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-xs text-slate-400">{r.fecha}</td>
                    <td className="p-3 text-ink max-w-xs truncate">{r.descripcion}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{r.horas}h</td>
                    <td className="p-3 text-right font-mono text-brand-600 font-semibold">{formatCurrency(r.monto_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {registros.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">No hay registros este mes.</p>
          <Link href="/horas/nuevo" className="text-brand-600 text-sm font-medium mt-2 inline-block hover:underline">
            Cargá tu primer registro →
          </Link>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
