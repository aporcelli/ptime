// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRegistrosHoras, getProyectos, getAppConfig } from "@/lib/sheets/queries";
import { formatCurrency, formatDateShort, formatHours } from "@/lib/utils/index";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Clock, DollarSign, FolderOpen, TrendingUp, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/charts/Sparkline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { getLocalDevUser, getRequestUrlFromHeaders } from "@/lib/env/dev-access";
import { DataPanel, MetricCard, PageShell, SectionCard, StatusPill } from "@/components/ui/structure";
import { repriceMonthlyRecords, summarizeRecords } from "@/lib/hours/monthly";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 300;

export default async function DashboardPage() {
  const session = await auth();
  const localUser = getLocalDevUser(getRequestUrlFromHeaders(headers()));
  const userName = session?.user?.name ?? localUser?.name ?? "";
  const ctx = await getPageCtx();

  try {
    const hoy = new Date();
    const fechaDesde = format(startOfMonth(hoy), "yyyy-MM-dd");
    const fechaHasta = format(endOfMonth(hoy), "yyyy-MM-dd");

    const [registros, proyectos, config] = await Promise.all([
      getRegistrosHoras(ctx, { fechaDesde, fechaHasta }),
      getProyectos(ctx, { soloActivos: true }),
      getAppConfig(ctx),
    ]);

    const registrosRepriced = repriceMonthlyRecords(registros, Object.fromEntries(proyectos.map((p) => [p.id, p])), config);
    const monthSummary = summarizeRecords(registrosRepriced);
    const totalHoras = registros.reduce((s, r) => s + r.horas, 0);
    const totalIngresos = monthSummary.totalAmount;
    const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const promedioHoras = +(totalHoras / Math.max(diasDelMes, 1)).toFixed(2);

    const proyectosEnTramo2 = proyectos.filter(
      (p) => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras)
    );

    return (
      <PageShell
        title="Dashboard"
        description={`${format(hoy, "MMMM yyyy")} · Bienvenido, ${userName}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/reportes">Ver reportes</Link>
            </Button>
            <Button asChild className="shadow-md">
              <Link href="/horas/nuevo">
                <Plus className="mr-2 h-4 w-4" /> Cargar horas
              </Link>
            </Button>
          </>
        }
      >

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Clock size={20} className="text-blue-500" />}
            label="Horas del mes"
            value={formatHours(totalHoras)}
          >
            {registros.length > 0 && <Sparkline data={registros.slice(-7).map((r) => r.horas)} color="#3b82f6" height={30} />}
          </MetricCard>
          <MetricCard
            icon={<DollarSign size={20} className="text-emerald-500" />}
            label="Ingresos del mes"
            value={formatCurrency(totalIngresos, config.moneda)}
            tone="success"
          >
            {registrosRepriced.length > 0 && <Sparkline data={registrosRepriced.slice(-7).map((r) => r.monto_total)} color="#10b981" height={30} />}
          </MetricCard>
          <MetricCard
            icon={<TrendingUp size={20} className="text-amber-500" />}
            label="Promedio diario"
            value={`${promedioHoras}h`}
            tone="warning"
          />
          <MetricCard
            icon={<FolderOpen size={20} className="text-purple-500" />}
            label="Proyectos activos"
            value={String(proyectos.length)}
          />
        </div>

        {/* Alerta tramo 2 */}
        {proyectosEnTramo2.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {proyectosEnTramo2.length} proyecto(s) en tarifa alta
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400/80 mt-1">
                {proyectosEnTramo2.map((p) => p.nombre).join(", ")} superaron el umbral de {config.umbralHoras}h y están facturando a ${config.precioAlto}/h.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Últimos registros */}
          <SectionCard className="lg:col-span-2" title="Registros recientes" icon={<Clock className="h-4 w-4 text-primary" />}>
            <div className="mb-4 flex justify-end">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/horas" className="text-primary">
                    Ver todos <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

            {registrosRepriced.length > 0 ? (
              <DataPanel>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...registrosRepriced].reverse().slice(0, 5).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateShort(r.fecha)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-foreground">
                          {r.descripcion}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">
                          {r.horas}h
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(r.monto_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataPanel>
            ) : (
              <Card className="bg-muted/30 border-dashed flex flex-col items-center justify-center p-12 text-center">
                <p className="text-muted-foreground text-sm mb-4">No hay registros este mes aún.</p>
                <Button asChild size="sm">
                  <Link href="/horas/nuevo">Cargá tu primer registro</Link>
                </Button>
              </Card>
            )}
          </SectionCard>

          {/* Proyectos activos summary */}
          <SectionCard title="Estado de proyectos" icon={<FolderOpen className="h-4 w-4 text-primary" />}>
            <div className="space-y-3">
              {proyectos.slice(0, 5).map((p) => {
                const isHigh = p.horas_acumuladas > config.umbralHoras;
                return (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.nombre}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                            {p.horas_acumuladas}h acumuladas
                          </p>
                        </div>
                        <StatusPill tone={isHigh ? "warning" : "success"}>
                          {isHigh ? "Tarifa Alta" : "Tarifa Base"}
                        </StatusPill>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isHigh ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min((p.horas_acumuladas / config.umbralHoras) * 100, 100)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {proyectos.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                  <Link href="/admin/proyectos">Ver todos los proyectos</Link>
                </Button>
              )}
            </div>
          </SectionCard>
        </div>
      </PageShell>
    );
  } catch (error: any) {
    console.error("[Dashboard] Error fatal:", error);
    return (
      <div className="p-8 m-8 bg-red-50 text-red-900 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error cargando el Dashboard</h2>
        <p className="mb-4">Ocurrió un error al consultar Google Sheets en producción.</p>
        <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
          {error?.message || String(error)}
        </pre>
      </div>
    );
  }
}
