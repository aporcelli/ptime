// hooks/usePricingPreview.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook para calcular el monto estimado en tiempo real en el formulario.
// Usa la función pura del algoritmo de precios, sin llamadas al servidor.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useMemo } from "react";
import { previewMonto } from "@/lib/pricing/calculateHoursAmount";
import type { PricingConfig } from "@/types/entities";

interface Params {
  horas:                number;
  /** Total de horas del usuario en el mes actual (todos los proyectos) */
  horasAcumuladasMes:   number;
  config:               PricingConfig;
}

export function usePricingPreview({ horas, horasAcumuladasMes, config }: Params) {
  const monto = useMemo(() => {
    if (!horas || horas <= 0 || !config) return 0;
    return previewMonto(horas, horasAcumuladasMes, config);
  }, [horas, horasAcumuladasMes, config]);

  // Precio activo: si ya superó el umbral mensual, o si esta entrada lo cruza
  const enTramo2 = horasAcumuladasMes >= config.umbralHoras;
  const cruzaUmbral =
    horasAcumuladasMes < config.umbralHoras &&
    horasAcumuladasMes + horas > config.umbralHoras;

  return {
    monto,
    enTramo2,
    cruzaUmbral,
    precioActivo: (enTramo2 || cruzaUmbral) ? config.precioAlto : config.precioBase,
  };
}
