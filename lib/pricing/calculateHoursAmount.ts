// lib/pricing/calculateHoursAmount.ts
// ─────────────────────────────────────────────────────────────────────────────
// Algoritmo de cálculo de precios escalonado.
// Función pura — sin efectos secundarios, 100% testeable.
//
// REGLA DE NEGOCIO:
//   - El umbral (ej. 20h) se resetea el 1° de cada mes.
//   - El acumulado es GLOBAL: suma todas las horas del mes del usuario,
//     independientemente del proyecto.
//   - La hora NO se fracciona en precio: si la entrada cruza el umbral
//     (aunque sea en el medio), TODA la entrada va a precio_alto.
//   - Ejemplos con umbral=20, precioBase=35, precioAlto=45:
//       acum=0,  horas=5  → 5×35 = $175  (no cruza)
//       acum=18, horas=4  → 4×45 = $180  (cruza → todo precio alto)
//       acum=20, horas=2  → 2×45 = $90   (ya superó → todo precio alto)
//       acum=15, horas=5  → 5×35 = $175  (15+5=20, no supera → precio base)
// ─────────────────────────────────────────────────────────────────────────────

import type { PricingConfig } from "@/types/entities";

export interface CalculationResult {
  montoTotal:      number;
  precioAplicado:  number;
  desglose: {
    horasEnTramo1: number;
    horasEnTramo2: number;
    montoTramo1:   number;
    montoTramo2:   number;
  };
}

/**
 * Calcula el monto total de un nuevo registro de horas.
 *
 * @param horasNuevas              - Horas del nuevo registro (ej. 1.5)
 * @param horasAcumuladasMes       - Total de horas del mes del usuario ANTES
 *                                   de este registro (todos los proyectos)
 * @param config                   - Configuración de precios
 */
export function calculateHoursAmount(
  horasNuevas: number,
  horasAcumuladasMes: number,
  config: PricingConfig
): CalculationResult {
  const { precioBase, precioAlto, umbralHoras } = config;

  const horas = round4(horasNuevas);
  const acum  = round4(horasAcumuladasMes);

  // Si ya superó el umbral, o si esta entrada lo cruza → todo a precio alto.
  // La hora no se fracciona: no hay precios mixtos dentro de un registro.
  const usaPrecioAlto = acum >= umbralHoras || (acum + horas) > umbralHoras;

  const precioAplicado = usaPrecioAlto ? precioAlto : precioBase;
  const montoTotal     = round2(horas * precioAplicado);

  // Desglose: sin mezcla — todo cae en un solo tramo
  const horasEnTramo1 = usaPrecioAlto ? 0 : horas;
  const horasEnTramo2 = usaPrecioAlto ? horas : 0;
  const montoTramo1   = round2(horasEnTramo1 * precioBase);
  const montoTramo2   = round2(horasEnTramo2 * precioAlto);

  return {
    montoTotal,
    precioAplicado,
    desglose: { horasEnTramo1, horasEnTramo2, montoTramo1, montoTramo2 },
  };
}

// ── Preview instantáneo para el formulario ────────────────────────────────────
/**
 * Retorna solo el monto total estimado. Usado en el hook usePricingPreview.
 *
 * @param horasNuevas        - Horas a ingresar
 * @param horasAcumuladasMes - Total horas del mes del usuario hasta ahora
 * @param config             - Configuración de precios
 */
export function previewMonto(
  horasNuevas: number,
  horasAcumuladasMes: number,
  config: PricingConfig
): number {
  if (!horasNuevas || horasNuevas <= 0) return 0;
  return calculateHoursAmount(horasNuevas, horasAcumuladasMes, config).montoTotal;
}

// ── Helpers privados ──────────────────────────────────────────────────────────
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Tests (vitest) ────────────────────────────────────────────────────────────
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const cfg: PricingConfig = { precioBase: 35, precioAlto: 45, umbralHoras: 20 };

  describe("calculateHoursAmount — regla: hora indivisible, umbral mensual global", () => {
    it("todo en tramo base (acum=0, horas=5) → 5×35=175", () => {
      const r = calculateHoursAmount(5, 0, cfg);
      expect(r.precioAplicado).toBe(35);
      expect(r.montoTotal).toBe(175);
      expect(r.desglose.horasEnTramo2).toBe(0);
    });

    it("exactamente en el umbral (acum=15, horas=5) → no cruza → 5×35=175", () => {
      const r = calculateHoursAmount(5, 15, cfg);
      expect(r.precioAplicado).toBe(35);
      expect(r.montoTotal).toBe(175);
    });

    it("cruza el umbral (acum=18, horas=4) → todo precio alto → 4×45=180", () => {
      const r = calculateHoursAmount(4, 18, cfg);
      expect(r.precioAplicado).toBe(45);
      expect(r.montoTotal).toBe(180);
      expect(r.desglose.horasEnTramo1).toBe(0);
      expect(r.desglose.horasEnTramo2).toBe(4);
    });

    it("exactamente en el umbral (acum=20, horas=2) → ya superó → 2×45=90", () => {
      const r = calculateHoursAmount(2, 20, cfg);
      expect(r.precioAplicado).toBe(45);
      expect(r.montoTotal).toBe(90);
    });

    it("todo en tramo alto (acum=25, horas=3) → 3×45=135", () => {
      const r = calculateHoursAmount(3, 25, cfg);
      expect(r.precioAplicado).toBe(45);
      expect(r.montoTotal).toBe(135);
    });

    it("horas decimales sin cruce (acum=19, horas=0.5) → no cruza → 0.5×35=17.5", () => {
      const r = calculateHoursAmount(0.5, 19, cfg);
      expect(r.precioAplicado).toBe(35);
      expect(r.montoTotal).toBe(17.5);
    });

    it("horas decimales con cruce (acum=19.5, horas=1) → cruza → 1×45=45", () => {
      const r = calculateHoursAmount(1, 19.5, cfg);
      expect(r.precioAplicado).toBe(45);
      expect(r.montoTotal).toBe(45);
    });

    it("caso real marzo: 20h×35 + 35h×45 = 2275", () => {
      // Simular 55h en el mes con umbral=20
      const UMBRAL = 20;
      let acum = 0;
      let total = 0;
      // 20 entradas de 1h
      for (let i = 0; i < 20; i++) {
        const r = calculateHoursAmount(1, acum, cfg);
        total += r.montoTotal;
        acum += 1;
      }
      // 35 entradas de 1h
      for (let i = 0; i < 35; i++) {
        const r = calculateHoursAmount(1, acum, cfg);
        total += r.montoTotal;
        acum += 1;
      }
      expect(acum).toBe(55);
      expect(total).toBe(20 * 35 + 35 * 45); // 2275
    });
  });
}
