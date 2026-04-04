'use server';
import { revalidatePath }    from "next/cache";
import { auth }              from "@/auth";
import { getSheetCtx }       from "@/lib/sheets/context";
import { hourFormSchema }    from "@/lib/schemas/hour";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { getPricingConfigForProject } from "@/app/actions/config";
import { getProyectoById, getRegistrosHoras } from "@/lib/sheets/queries";
import { createRegistroHoras, updateRegistroEstado, updateProyectoHorasAcumuladas } from "@/lib/sheets/mutations";
import { sanitize }          from "@/lib/utils/sanitize";
import { generateUUID }      from "@/lib/utils/index";
import type { ActionResult, HoraEstado, RegistroHoras } from "@/types/entities";

export async function createHour(rawData: unknown): Promise<ActionResult<RegistroHoras>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado" };

  const parsed = hourFormSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors as Record<string,string[]> };

  const ctx      = await getSheetCtx();
  const data     = parsed.data;
  const proyecto = await getProyectoById(ctx, data.proyecto_id);
  if (!proyecto) return { success: false, error: "Proyecto no encontrado" };
  if (proyecto.estado !== "activo") return { success: false, error: "El proyecto no está activo" };

  const usuarioId = session.user.email ?? session.user.id;

  // ── Acumulado mensual global del usuario ────────────────────────────────────
  // El umbral se resetea cada mes y aplica sobre el TOTAL de horas del usuario
  // en ese mes, sin importar el proyecto.
  const mes = data.fecha.slice(0, 7); // "YYYY-MM"
  const registrosMes = await getRegistrosHoras(ctx, { usuarioId });
  const horasAcumuladasMes = registrosMes
    .filter((r) => r.fecha.startsWith(mes))
    .reduce((sum, r) => sum + r.horas, 0);

  const pricingConfig = await getPricingConfigForProject(data.proyecto_id);
  const { montoTotal, precioAplicado } = calculateHoursAmount(
    data.horas,
    horasAcumuladasMes,
    pricingConfig
  );

  const id = generateUUID();
  const registro: Omit<RegistroHoras, "created_at"|"updated_at"> = {
    id, cliente_id: data.cliente_id, proyecto_id: data.proyecto_id, tarea_id: data.tarea_id,
    usuario_id: usuarioId,
    fecha: data.fecha, horas: data.horas,
    descripcion: sanitize(data.descripcion),
    precio_hora_aplicado: precioAplicado,
    monto_total: montoTotal, estado: data.estado,
  };

  await createRegistroHoras(ctx, registro);
  await updateProyectoHorasAcumuladas(ctx, data.proyecto_id,
    Math.round((proyecto.horas_acumuladas + data.horas) * 10000) / 10000);

  revalidatePath("/horas");
  revalidatePath("/dashboard");
  return { success: true, data: { ...registro, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
}

export async function changeHourStatus(id: string, estado: HoraEstado): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado" };
  const ctx = await getSheetCtx();
  await updateRegistroEstado(ctx, id, estado);
  revalidatePath("/horas");
  return { success: true, data: undefined };
}
