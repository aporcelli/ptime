import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrosHoras, getProyectos, getTareas } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatHours } from "@/lib/utils/index";
import { Plus, Clock, TrendingUp, Calendar } from "lucide-react";
import { HorasClientList } from "./HorasClientList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const mesActualStr = new Date().toISOString().slice(0, 7);
  const horasMes = registros
    .filter(r => r.fecha.startsWith(mesActualStr))
    .reduce((s, r) => s + r.horas, 0);

  const ordenados = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-slate-900 tracking-tight">
            Mis registros de horas
          </h1>
          <p className="text-slate-500 mt-1">
            Gestioná y visualizá tu tiempo trabajado
          </p>
        </div>
        <Button asChild className="w-full md:w-auto shadow-md transition-all active:scale-95">
          <Link href="/horas/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Cargar horas
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Horas</p>
                <p className="text-2xl font-serif text-slate-900">{formatHours(totalHoras)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ingresos</p>
                <p className="text-2xl font-serif text-emerald-700">{formatCurrency(totalIngresos)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Este Mes</p>
                <p className="text-2xl font-serif text-slate-900">{formatHours(horasMes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Listado detallado</h2>
        </div>
        <HorasClientList
            registros={ordenados}
            proyectosMap={proyectosMap}
            tareasMap={tareasMap}
        />
      </div>
    </div>
  );
}
