// app/actions/hours.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server Actions para el módulo de Registros de Horas.
// Cada acción verifica autenticación, re-valida con Zod y sanitiza antes de
// persistir en Google Sheets.
// ─────────────────────────────────────────────────────────────────────────────
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { hourFormSchema } from "@/lib/schemas/hour";
import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import { getPricingConfigForProject } from "@/app/actions/config";
import { getProyectoById } from "@/lib/sheets/queries";
import {
  createRegistroHoras,
  updateRegistroEstado,
  updateProyectoHorasAcumuladas,
} from "@/lib/sheets/mutations";
import { sanitize } from "@/lib/utils/sanitize";
import { generateUUID } from "@/lib/utils/index";
import type { ActionResult, HoraEstado, RegistroHoras } from "@/types/entities";
import type { HourFormData } from "@/lib/schemas/hour";

// ── Crear Registro ────────────────────────────────────────────────────────────
export async function createHour(
  rawData: unknown
): Promise<ActionResult<RegistroHoras>> {
  // 1. Verificar autenticación
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "No autenticado" };
  }

  // 2. Validar con Zod (segunda capa — la primera fue en el cliente)
  const parsed = hourFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success:     false,
      error:       "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data: HourFormData = parsed.data;

  // 3. Sanitizar texto libre
  const descripcionLimpia = sanitize(data.descripcion);

  // 4. Obtener proyecto y verificar que existe
  const proyecto = await getProyectoById(data.proyecto_id);
  if (!proyecto) {
    return { success: false, error: "Proyecto no encontrado" };
  }
  if (proyecto.estado !== "activo") {
    return { success: false, error: "No se pueden cargar horas en un proyecto cerrado o pausado" };
  }

  // 5. Calcular precio según lógica escalonada
  const pricingConfig = await getPricingConfigForProject(data.proyecto_id);
  const { montoTotal, precioAplicado } = calculateHoursAmount(
    data.horas,
    proyecto.horas_acumuladas,
    pricingConfig
  );

  // 6. Construir el registro
  const id = generateUUID();
  const registro: Omit<RegistroHoras, "created_at" | "updated_at"> = {
    id,
    proyecto_id:          data.proyecto_id,
    tarea_id:             data.tarea_id,
    usuario_id:           session.user.id,
    fecha:                data.fecha,
    horas:                data.horas,
    descripcion:          descripcionLimpia,
    precio_hora_aplicado: precioAplicado,
    monto_total:          montoTotal,
    estado:               data.estado,
  };

  // 7. Persistir en Sheets (transacción optimista)
  await createRegistroHoras(registro);

  // 8. Actualizar horas acumuladas del proyecto
  const nuevasHorasAcumuladas = +(
    (proyecto.horas_acumuladas + data.horas).toFixed(4)
  );
  await updateProyectoHorasAcumuladas(data.proyecto_id, nuevasHorasAcumuladas);

  // 9. Invalidar cache de Next.js
  revalidatePath("/horas");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");

  return {
    success: true,
    data: {
      ...registro,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

// ── Cambiar Estado ────────────────────────────────────────────────────────────
export async function changeHourStatus(
  id: string,
  estado: HoraEstado
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "No autenticado" };

  const validEstados: HoraEstado[] = ["borrador", "confirmado", "facturado"];
  if (!validEstados.includes(estado)) {
    return { success: false, error: "Estado inválido" };
  }

  await updateRegistroEstado(id, estado);
  revalidatePath("/horas");

  return { success: true, data: undefined };
}
