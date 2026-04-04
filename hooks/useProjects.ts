// hooks/useProjects.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook para filtrar y ordenar proyectos en el cliente.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState, useMemo } from "react";
import type { Proyecto } from "@/types/entities";

export type ProyectoFiltro = "todos" | "activo" | "pausado" | "cerrado";

export function useProjects(initial: Proyecto[]) {
    const [filtro, setFiltro] = useState<ProyectoFiltro>("todos");
    const [busqueda, setBusqueda] = useState("");

    const proyectosFiltrados = useMemo(() => {
        return initial.filter((p) => {
            const matchEstado = filtro === "todos" || p.estado === filtro;
            const matchBusqueda =
                busqueda === "" ||
                p.nombre.toLowerCase().includes(busqueda.toLowerCase());
            return matchEstado && matchBusqueda;
        });
    }, [initial, filtro, busqueda]);

    /** Proyectos que han superado el umbral de horas (en tramo 2) */
    const enTramo2 = useMemo(
        () =>
            initial.filter(
                (p) => p.horas_acumuladas >= (p.umbral_precio_alto ?? 20)
            ),
        [initial]
    );

    /** % de presupuesto consumido */
    const presupuestoUsado = (p: Proyecto) => {
        if (!p.presupuesto_horas) return null;
        return Math.min(100, Math.round((p.horas_acumuladas / p.presupuesto_horas) * 100));
    };

    return {
        proyectosFiltrados,
        enTramo2,
        filtro,
        setFiltro,
        busqueda,
        setBusqueda,
        presupuestoUsado,
    };
}
