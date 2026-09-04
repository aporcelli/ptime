import type { Metadata } from "next";
import { getTareas, getProyectos, getClientes, getRegistrosHoras, getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx }    from "@/lib/sheets/getPageCtx";
import { auth }          from "@/auth";
import HorasForm         from "@/components/forms/HorasForm";
import { getAccumulatedWorkedHoursUpTo } from "@/lib/hours/accounting";
import { getUserTimeZone } from "@/lib/locale";
import { currentMonthLocal, todayLocal } from "@/lib/utils/date";

import { getLocale } from "@/lib/locale";
import { dashboardTranslations } from "@/lib/dashboard-i18n";

export const metadata: Metadata = { title: "Cargar Horas" };

export default async function NuevaHoraPage() {
  const locale = getLocale();
  const t = dashboardTranslations[locale];
  const ctx     = await getPageCtx();
  const session = await auth();
  const usuarioId = session?.user?.email ?? session?.user?.id ?? "";

  // Mes actual para calcular el acumulado mensual global del usuario
  const timeZone = getUserTimeZone();
  const mesActual = currentMonthLocal(timeZone); // "YYYY-MM" (zona del usuario)

  let clientes, tareas, todosProyectos, config, registrosMes;
  try {
    [clientes, tareas, todosProyectos, config, registrosMes] = await Promise.all([
      getClientes(ctx, true),
      getTareas(ctx, true),
      getProyectos(ctx, {}),           // Traer TODOS para que el filtro en el form funcione
      getAppConfig(ctx),
      getRegistrosHoras(ctx, { usuarioId }),
    ]);
  } catch (error) {
    return (
      <div className="p-8 m-8 bg-red-50 text-red-900 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error cargando la vista</h2>
        <p className="mb-4">Ocurrió un error al consultar Google Sheets en producción.</p>
        <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }

  // Solo proyectos activos para cargar horas (pero sin filtrar por cliente aún)
  const proyectos = todosProyectos.filter(p => p.estado === "activo");

  // Acumulado mensual global: todas las horas del usuario en el mes actual (incluyendo registros previos de hoy)
  const horasAcumuladasMes = getAccumulatedWorkedHoursUpTo(registrosMes, mesActual, todayLocal(timeZone), undefined, new Date().toISOString());

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground font-semibold tracking-tight">{t.formTitleNew}</h1>
        <p className="text-muted-foreground mt-1">{t.formSubtitle}</p>
      </div>
      <HorasForm
        clientes={clientes}
        tareas={tareas}
        proyectos={proyectos}
        defaultConfig={config}
        horasAcumuladasMes={horasAcumuladasMes}
        sheetId={ctx.sheetId}
      />
    </div>
  );
}
