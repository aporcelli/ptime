// types/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipos de respuestas de API y Server Actions de Ptime.
// ─────────────────────────────────────────────────────────────────────────────

export type ApiStatus = "idle" | "loading" | "success" | "error";

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

/** Parámetros de filtro para reportes BI */
export interface ReportQueryParams {
    fechaDesde?: string;   // YYYY-MM-DD
    fechaHasta?: string;   // YYYY-MM-DD
    proyectoId?: string;
    clienteId?: string;
    tareaId?: string;
    usuarioId?: string;
    estado?: "borrador" | "confirmado" | "facturado" | "rechazado";
}

/** Datos agregados para el dashboard de BI */
export interface ReportData {
    kpis: {
        totalHoras: number;
        totalIngresos: number;
        promedioHorasDia: number;
        proyectosActivos: number;
        registrosTotales: number;
    };
    porMes: Array<{ mes: string; horas: number; ingresos: number }>;
    porProyecto: Array<{ nombre: string; horas: number; ingresos: number; clienteNombre?: string }>;
    porTarea: Array<{ nombre: string; horas: number; porcentaje: number }>;
    top3Proyectos: Array<{ nombre: string; ingresos: number }>;
    alertasTramo2: Array<{ nombre: string; horasAcumuladas: number; umbral: number }>;
}

/** Error de validación de formulario */
export interface FieldErrors {
    [field: string]: string[];
}
