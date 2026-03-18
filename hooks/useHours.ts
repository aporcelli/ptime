// hooks/useHours.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook para obtener y gestionar registros de horas con cache optimista.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState, useCallback } from "react";
import { changeHourStatus } from "@/app/actions/hours";
import type { HoraEstado, RegistroHoras } from "@/types/entities";

/** Estado local optimista para cambios de estado de registros */
export function useHourStatus(initial: RegistroHoras[]) {
    const [registros, setRegistros] = useState(initial);
    const [loading, setLoading] = useState<string | null>(null);

    const changeStatus = useCallback(
        async (id: string, estado: HoraEstado) => {
            // Optimista: actualizar UI inmediatamente
            setRegistros((prev) =>
                prev.map((r) => (r.id === id ? { ...r, estado } : r))
            );
            setLoading(id);

            const result = await changeHourStatus(id, estado);

            if (!result.success) {
                // Revertir en caso de error
                setRegistros(initial);
            }
            setLoading(null);
        },
        [initial]
    );

    return { registros, loading, changeStatus };
}

/** Utilidades de agrupación para el módulo de horas */
export function groupByDate(registros: RegistroHoras[]) {
    return registros.reduce<Record<string, RegistroHoras[]>>((acc, r) => {
        if (!acc[r.fecha]) acc[r.fecha] = [];
        acc[r.fecha].push(r);
        return acc;
    }, {});
}

export function sumHoras(registros: RegistroHoras[]) {
    return registros.reduce((s, r) => s + r.horas, 0);
}

export function sumIngresos(registros: RegistroHoras[]) {
    return registros.reduce((s, r) => s + r.monto_total, 0);
}
