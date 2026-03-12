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
  horas:           number;
  horasAcumuladas: number;
  config:          PricingConfig;
}

export function usePricingPreview({ horas, horasAcumuladas, config }: Params) {
  const monto = useMemo(() => {
    if (!horas || horas <= 0 || !config) return 0;
    return previewMonto(horas, horasAcumuladas, config);
  }, [horas, horasAcumuladas, config]);

  const enTramo2 = horasAcumuladas >= config.umbralHoras;
  const cruzaUmbral =
    horasAcumuladas < config.umbralHoras &&
    horasAcumuladas + horas > config.umbralHoras;

  return {
    monto,
    enTramo2,
    cruzaUmbral,
    precioActivo: enTramo2 ? config.precioAlto : config.precioBase,
  };
}
