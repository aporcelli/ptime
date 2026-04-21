// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRegistrosHoras, getProyectos, getAppConfig } from "@/lib/sheets/queries";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Clock, DollarSign, FolderOpen, TrendingUp, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/charts/Sparkline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 300;

export default async function DashboardPage() {
  const session = await auth();
  const cookieStore = cookies();
  const sheetId = cookieStore.get("ptime-sheet-id")?.value;
  const accessToken = session?.user?.accessToken;

  if (!session || !sheetId || !accessToken) {
    redirect("/setup");
  }

  const ctx = { sheetId, accessToken };

  try {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              {format(hoy, "MMMM yyyy")} · Bienvenido, {session?.user?.name}
            </p>
          </div>
          <div className="flex gap-3">
             <Button asChild variant="outline">
                <Link href="/reportes">Ver reportes</Link>
             </Button>
             <Button asChild className="shadow-md">
                <Link href="/horas/nuevo">
                    <Plus className="mr-2 h-4 w-4" /> Cargar horas
                </Link>
             </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Clock size={20} className="text-blue-600" />}
            label="Horas del mes"
            value={formatHours(totalHoras)}
            sparkData={registros.slice(-7).map(r => r.horas)}
            bgColor="bg-blue-50"
          />
          <KpiCard
            icon={<DollarSign size={20} className="text-emerald-600" />}
            label="Ingresos del mes"
            value={formatCurrency(totalIngresos, config.moneda)}
            accent
            sparkData={registros.slice(-7).map(r => r.monto_total)}
            sparkColor="#10b981"
            bgColor="bg-emerald-50"
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-amber-600" />}
            label="Promedio diario"
            value={`${promedioHoras}h`}
            sparkColor="#F59E0B"
            bgColor="bg-amber-50"
          />
          <KpiCard
            icon={<FolderOpen size={20} className="text-slate-600" />}
            label="Proyectos activos"
            value={String(proyectos.length)}
            sparkColor="#64748b"
            bgColor="bg-slate-50"
          />
        </div>

        {/* Alerta tramo 2 */}
        {proyectosEnTramo2.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {proyectosEnTramo2.length} proyecto(s) en tarifa alta
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {proyectosEnTramo2.map((p) => p.nombre).join(", ")} superaron el umbral de {config.umbralHoras}h y están facturando a ${config.precioAlto}/h.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Últimos registros */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Registros recientes</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/horas" className="text-brand-600">
                            Ver todos <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {registros.length > 0 ? (
                    <Card className="overflow-hidden border-slate-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[100px]">Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Horas</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...registros].reverse().slice(0, 5).map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">{r.fecha}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-slate-700">{r.descripcion}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{r.horas}h</TableCell>
                                        <TableCell className="text-right font-mono font-semibold text-brand-600">{formatCurrency(r.monto_total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card className="bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                        <p className="text-slate-500 text-sm mb-4">No hay registros este mes aún.</p>
                        <Button asChild size="sm">
                            <Link href="/horas/nuevo">Cargá tu primer registro</Link>
                        </Button>
                    </Card>
                )}
            </div>

            {/* Proyectos activos summary */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Estado de proyectos</h2>
                <div className="space-y-3">
                    {proyectos.slice(0, 5).map(p => (
                        <Card key={p.id} className="border-slate-200">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{p.nombre}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{p.horas_acumuladas}h acumuladas</p>
                                    </div>
                                    <Badge variant={p.horas_acumuladas > config.umbralHoras ? "destructive" : "secondary"} className="text-[10px]">
                                        {p.horas_acumuladas > config.umbralHoras ? "Tarifa Alta" : "Tarifa Base"}
                                    </Badge>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            p.horas_acumuladas > config.umbralHoras ? "bg-amber-500" : "bg-brand-600"
                                        )}
                                        style={{ width: `${Math.min((p.horas_acumuladas / config.umbralHoras) * 100, 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {proyectos.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full text-slate-500" asChild>
                            <Link href="/admin/proyectos">Ver todos los proyectos</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[Dashboard] Error fatal:", error);
    redirect("/setup");
  }
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  sparkData?: number[];
  sparkColor?: string;
  bgColor?: string;
}

function KpiCard({ icon, label, value, accent, sparkData, sparkColor, bgColor }: KpiCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor ?? "bg-slate-50")}>
                    {icon}
                </div>
                {sparkData && sparkData.length > 0 && (
                    <div className="w-20">
                        <Sparkline data={sparkData} color={sparkColor ?? "#2563eb"} height={30} />
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={cn("text-2xl font-serif mt-1", accent ? "text-emerald-700" : "text-slate-900")}>
                    {value}
                </p>
            </div>
        </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
