import type { Metadata } from "next";
import Link from "next/link";
import { getAppConfig, getClientes, getRegistrosHoras, getProyectos, getTareas } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { Plus } from "lucide-react";
import { HorasClientList } from "./HorasClientList";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Mis Horas" };
export const revalidate = 60;

export default async function HorasPage() {
  try {
    const ctx = await getPageCtx();

    let registros, proyectos, tareas, clientes, config;
    try {
      [registros, proyectos, tareas, clientes, config] = await Promise.all([
        getRegistrosHoras(ctx),
        getProyectos(ctx),
        getTareas(ctx),
        getClientes(ctx, true),
        getAppConfig(ctx),
      ]);
    } catch (err: any) {
      return (
        <div className="p-8 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold mb-2">Error cargando los datos</h2>
          <p className="mb-4">Ocurrió un error al consultar Google Sheets en producción.</p>
          <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
            {err?.message || String(err)}
          </pre>
        </div>
      );
    }

    const proyectosMap = Object.fromEntries(proyectos.map((p) => [p.id, p]));
    const tareasMap = Object.fromEntries(tareas.map((t) => [t.id, t]));
    const clientesMap = Object.fromEntries(clientes.map((c) => [c.id, c]));
    const ordenados = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));

    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Mis registros de horas
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestioná y visualizá tu tiempo trabajado
            </p>
          </div>
          <Button asChild className="w-full shadow-md transition-all active:scale-95 md:w-auto">
            <Link href="/horas/nuevo">
              <Plus className="mr-2 h-4 w-4" /> Cargar horas
            </Link>
          </Button>
        </div>

        <HorasClientList
          registros={ordenados}
          proyectosMap={proyectosMap}
          tareasMap={tareasMap}
          clientesMap={clientesMap}
          fallbackConfig={config}
        />
      </div>
    );
  } catch (globalError) {
    return (
      <div className="p-8 m-8 bg-red-50 text-red-900 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error Crítico</h2>
        <p className="mb-4">Falló de forma imprevista la página de horas.</p>
        <pre className="bg-red-100 p-4 rounded text-sm mt-4 overflow-auto">
          {globalError instanceof Error ? globalError.message : String(globalError)}
        </pre>
      </div>
    );
  }
}
