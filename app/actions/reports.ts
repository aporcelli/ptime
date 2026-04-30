// app/actions/reports.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server Action: queries agregadas para el módulo BI/Reportes.
// ─────────────────────────────────────────────────────────────────────────────
'use server';
import { auth } from "@/auth";
import { getSheetCtx } from "@/lib/sheets/context";
import { getRegistrosHoras, getProyectos, getClientes, getTareas, getAppConfig } from "@/lib/sheets/queries";
import type { ReportQueryParams, ReportData } from "@/types/api";
import type { ActionResult } from "@/types/entities";
import { repriceMonthlyRecords } from "@/lib/hours/monthly";

export async function getReportData(
    params: ReportQueryParams = {}
): Promise<ActionResult<ReportData>> {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autenticado" };

    const ctx = await getSheetCtx();

    const [registros, proyectos, clientes, tareas, config] = await Promise.all([
        getRegistrosHoras(ctx, {
            fechaDesde: params.fechaDesde,
            fechaHasta: params.fechaHasta,
        }),
        getProyectos(ctx),
        getClientes(ctx),
        getTareas(ctx),
        getAppConfig(ctx),
    ]);

    // ── Filtros opcionales ────────────────────────────────────────────────────
    const registrosFiltrados = registros.filter((r) => {
        if (params.proyectoId && r.proyecto_id !== params.proyectoId) return false;
        if (params.usuarioId && r.usuario_id !== params.usuarioId) return false;
        if (params.tareaId && r.tarea_id !== params.tareaId) return false;
        if (params.estado && r.estado !== params.estado) return false;
        if (params.clienteId) {
            const proyecto = proyectos.find((p) => p.id === r.proyecto_id);
            if (proyecto?.cliente_id !== params.clienteId) return false;
        }
        return true;
    });
    const registrosRepriced = repriceMonthlyRecords(registrosFiltrados, Object.fromEntries(proyectos.map((p) => [p.id, p])), config);

    // ── KPIs ─────────────────────────────────────────────────────────────────
    const totalHoras = registrosRepriced.reduce((s, r) => s + r.horas, 0);
    const totalIngresos = registrosRepriced.reduce((s, r) => s + r.monto_total, 0);
    const fechas = registrosRepriced.map((r) => r.fecha);
    const diasUnicos = new Set(fechas).size;
    const promedioHorasDia = diasUnicos > 0 ? totalHoras / diasUnicos : 0;
    const proyectosActivos = proyectos.filter((p) => p.estado === "activo").length;

    // ── Por mes ───────────────────────────────────────────────────────────────
    const mesBucket: Record<string, { horas: number; ingresos: number }> = {};
    for (const r of registrosRepriced) {
        const mes = r.fecha.slice(0, 7);
        if (!mesBucket[mes]) mesBucket[mes] = { horas: 0, ingresos: 0 };
        mesBucket[mes].horas += r.horas;
        mesBucket[mes].ingresos += r.monto_total;
    }
    const porMes = Object.entries(mesBucket)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, d]) => ({ mes, ...d }));

    // ── Por proyecto ──────────────────────────────────────────────────────────
    const proyBucket: Record<string, { nombre: string; horas: number; ingresos: number; clienteNombre?: string }> = {};
    for (const r of registrosRepriced) {
        if (!proyBucket[r.proyecto_id]) {
            const p = proyectos.find((p) => p.id === r.proyecto_id);
            const cliente = clientes.find((c) => c.id === p?.cliente_id);
            proyBucket[r.proyecto_id] = {
                nombre: p?.nombre ?? r.proyecto_id.slice(0, 8),
                horas: 0, ingresos: 0,
                clienteNombre: cliente?.nombre,
            };
        }
        proyBucket[r.proyecto_id].horas += r.horas;
        proyBucket[r.proyecto_id].ingresos += r.monto_total;
    }
    const porProyecto = Object.values(proyBucket).sort((a, b) => b.ingresos - a.ingresos);

    // ── Por tarea ─────────────────────────────────────────────────────────────
    const tareasBucket: Record<string, { nombre: string; horas: number }> = {};
    for (const r of registrosRepriced) {
        if (!tareasBucket[r.tarea_id]) {
            const t = tareas.find((t) => t.id === r.tarea_id);
            tareasBucket[r.tarea_id] = { nombre: t?.nombre ?? "Desconocida", horas: 0 };
        }
        tareasBucket[r.tarea_id].horas += r.horas;
    }
    const porTarea = Object.values(tareasBucket)
        .sort((a, b) => b.horas - a.horas)
        .map((t) => ({
            ...t,
            porcentaje: totalHoras > 0 ? Math.round((t.horas / totalHoras) * 100) : 0,
        }));

    // ── Top 3 y alertas ───────────────────────────────────────────────────────
    const top3Proyectos = porProyecto.slice(0, 3).map((p) => ({ nombre: p.nombre, ingresos: p.ingresos }));
    const alertasTramo2 = proyectos
        .filter((p) => p.horas_acumuladas > (p.umbral_precio_alto ?? config.umbralHoras))
        .map((p) => ({
            nombre: p.nombre,
            horasAcumuladas: p.horas_acumuladas,
            umbral: p.umbral_precio_alto ?? config.umbralHoras,
        }));

    return {
        success: true,
        data: {
            kpis: {
                totalHoras: Math.round(totalHoras * 100) / 100,
                totalIngresos: Math.round(totalIngresos * 100) / 100,
                promedioHorasDia: Math.round(promedioHorasDia * 100) / 100,
                proyectosActivos,
                registrosTotales: registrosRepriced.length,
            },
            porMes,
            porProyecto,
            porTarea,
            top3Proyectos,
            alertasTramo2,
        },
    };
}
