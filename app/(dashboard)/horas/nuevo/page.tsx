import type { Metadata } from "next";
import { getTareas, getProyectos, getRegistrosHoras, getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx }    from "@/lib/sheets/getPageCtx";
import { auth }          from "@/auth";
import HorasForm         from "@/components/forms/HorasForm";

export const metadata: Metadata = { title: "Cargar Horas" };

export default async function NuevaHoraPage() {
  const ctx     = await getPageCtx();
  const session = await auth();
  const usuarioId = session?.user?.email ?? session?.user?.id ?? "";

  // Mes actual para calcular el acumulado mensual global del usuario
  const mesActual = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const [tareas, proyectos, config, registrosMes] = await Promise.all([
    getTareas(ctx, true),
    getProyectos(ctx, { soloActivos: true }),
    getAppConfig(ctx),
    getRegistrosHoras(ctx, { usuarioId }),
  ]);

  // Acumulado mensual global: todas las horas del usuario en el mes actual
  const horasAcumuladasMes = registrosMes
    .filter((r) => r.fecha.startsWith(mesActual))
    .reduce((sum, r) => sum + r.horas, 0);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Cargar horas</h1>
        <p className="text-slate-500 mt-1">Registrá el tiempo trabajado en un proyecto</p>
      </div>
      <HorasForm
        tareas={tareas}
        proyectos={proyectos}
        defaultConfig={config}
        horasAcumuladasMes={horasAcumuladasMes}
      />
    </div>
  );
}
