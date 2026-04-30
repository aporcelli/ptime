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
  const ctx = await getPageCtx();

  const [registros, proyectos, tareas, clientes, config] = await Promise.all([
    getRegistrosHoras(ctx),
    getProyectos(ctx),
    getTareas(ctx),
    getClientes(ctx, true),
    getAppConfig(ctx),
  ]);

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
}
