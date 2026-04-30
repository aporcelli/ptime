import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegistroById, getTareas, getProyectos, getClientes, getRegistrosHoras, getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { auth } from "@/auth";
import HorasForm from "@/components/forms/HorasForm";
import { getMonthlyWorkedHoursAccumulated } from "@/lib/hours/accounting";

export const metadata: Metadata = { title: "Editar Horas" };

export default async function EditarHoraPage({ params }: { params: { id: string } }) {
  const ctx     = await getPageCtx();
  const session = await auth();
  const usuarioId = session?.user?.email ?? session?.user?.id ?? "";

  const [registro, clientes, tareas, proyectos, config, registrosMes] = await Promise.all([
    getRegistroById(ctx, params.id),
    getClientes(ctx, true),
    getTareas(ctx, true),
    getProyectos(ctx, { soloActivos: true }),
    getAppConfig(ctx),
    getRegistrosHoras(ctx, { usuarioId }),
  ]);

  if (!registro) notFound();

  // Si el proyecto del registro original está inactivo, igual debemos agregarlo para que no se rompa el dropdown
  const proyOrig = proyectos.find(p => p.id === registro.proyecto_id);
  if (!proyOrig) {
    const pViejos = await getProyectos(ctx);
    const proj = pViejos.find(p => p.id === registro.proyecto_id);
    if (proj) proyectos.push(proj);
  }

  // Mes de la fecha original
  const mes = registro.fecha.slice(0, 7);
  // Restamos el registro actual para no sumarlo 2 veces en el acumulado previo del mes
  const horasAcumuladasMes = getMonthlyWorkedHoursAccumulated(registrosMes, mes, registro.id);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">Editar registro</h1>
        <p className="text-muted-foreground mt-1">Modificá los detalles de este registro.</p>
      </div>
      <HorasForm
        clientes={clientes}
        tareas={tareas}
        proyectos={proyectos}
        defaultConfig={config}
        horasAcumuladasMes={horasAcumuladasMes}
        initialData={{
          id: registro.id,
          cliente_id: registro.cliente_id ?? "",
          proyecto_id: registro.proyecto_id,
          tarea_id: registro.tarea_id,
          fecha: registro.fecha,
          horas: registro.horas,
          descripcion: registro.descripcion,
          estado: registro.estado,
        }}
      />
    </div>
  );
}
