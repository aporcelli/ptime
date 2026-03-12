// lib/pricing/calculateHoursAmount.ts
// ─────────────────────────────────────────────────────────────────────────────
// Algoritmo de cálculo de precios escalonado.
// Función pura — sin efectos secundarios, 100% testeable.
// ─────────────────────────────────────────────────────────────────────────────

import type { PricingConfig } from "@/types/entities";

export interface CalculationResult {
  montoTotal:      number;
  precioAplicado:  number; // precio predominante del tramo
  desglose: {
    horasEnTramo1: number;
    horasEnTramo2: number;
    montoTramo1:   number;
    montoTramo2:   number;
  };
}

/**
 * Calcula el monto total de un nuevo registro de horas considerando
 * las horas ya acumuladas en el proyecto y la configuración de precios.
 *
 * @param horasNuevas           - Horas del nuevo registro (ej. 1.5)
 * @param horasAcumuladasAntes  - Horas del proyecto ANTES de este registro
 * @param config                - Configuración de precios (base, alto, umbral)
 */
export function calculateHoursAmount(
  horasNuevas: number,
  horasAcumuladasAntes: number,
  config: PricingConfig
): CalculationResult {
  const { precioBase, precioAlto, umbralHoras } = config;

  // Redondear a 4 decimales para eliminar errores de punto flotante IEEE 754
  const horas = round4(horasNuevas);
  const acum  = round4(horasAcumuladasAntes);

  // Horas ya consumidas en cada tramo antes del nuevo registro
  const horasEnTramo2Antes   = Math.max(0, acum - umbralHoras);
  const horasEnTramo1Antes   = acum - horasEnTramo2Antes;

  // Capacidad restante en el tramo 1 (precio base)
  const capacidadRestanteT1  = Math.max(0, umbralHoras - horasEnTramo1Antes);

  // Distribución de las horas nuevas entre tramos
  const horasEnTramo1 = round4(Math.min(horas, capacidadRestanteT1));
  const horasEnTramo2 = round4(Math.max(0, horas - horasEnTramo1));

  // Montos por tramo (redondeados a 2 decimales = centavos)
  const montoTramo1 = round2(horasEnTramo1 * precioBase);
  const montoTramo2 = round2(horasEnTramo2 * precioAlto);
  const montoTotal  = round2(montoTramo1 + montoTramo2);

  // El precio "aplicado" refleja el tramo donde cayó la mayoría de horas
  const precioAplicado =
    horasEnTramo2 > horasEnTramo1 ? precioAlto : precioBase;

  return {
    montoTotal,
    precioAplicado,
    desglose: { horasEnTramo1, horasEnTramo2, montoTramo1, montoTramo2 },
  };
}

// ── Preview instantáneo para el formulario ────────────────────────────────────
/**
 * Retorna solo el monto total estimado. Usado en el hook usePricingPreview
 * para actualizar el preview del formulario sin latencia de red.
 */
export function previewMonto(
  horasNuevas: number,
  horasAcumuladas: number,
  config: PricingConfig
): number {
  if (!horasNuevas || horasNuevas <= 0) return 0;
  return calculateHoursAmount(horasNuevas, horasAcumuladas, config).montoTotal;
}

// ── Helpers privados ──────────────────────────────────────────────────────────
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Tests en el mismo archivo (ejecutar con: vitest) ─────────────────────────
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const cfg: PricingConfig = { precioBase: 35, precioAlto: 45, umbralHoras: 20 };

  describe("calculateHoursAmount", () => {
    it("todo en tramo 1 (acum=0, horas=5)", () => {
      const r = calculateHoursAmount(5, 0, cfg);
      expect(r.montoTotal).toBe(175);
      expect(r.desglose.horasEnTramo2).toBe(0);
    });

    it("cruza el umbral (acum=18, horas=4)", () => {
      const r = calculateHoursAmount(4, 18, cfg);
      expect(r.desglose.horasEnTramo1).toBe(2);
      expect(r.desglose.horasEnTramo2).toBe(2);
      expect(r.montoTotal).toBe(70 + 90); // 160
    });

    it("todo en tramo 2 (acum=25, horas=3)", () => {
      const r = calculateHoursAmount(3, 25, cfg);
      expect(r.desglose.horasEnTramo1).toBe(0);
      expect(r.montoTotal).toBe(135);
    });

    it("horas decimales (acum=19.75, horas=1.5)", () => {
      const r = calculateHoursAmount(1.5, 19.75, cfg);
      expect(r.desglose.horasEnTramo1).toBe(0.25);  // 0.25 * 35 = 8.75
      expect(r.desglose.horasEnTramo2).toBe(1.25);  // 1.25 * 45 = 56.25
      expect(r.montoTotal).toBe(65);
    });

    it("exactamente en el umbral (acum=20, horas=2)", () => {
      const r = calculateHoursAmount(2, 20, cfg);
      expect(r.desglose.horasEnTramo1).toBe(0);
      expect(r.montoTotal).toBe(90);
    });
  });
}
