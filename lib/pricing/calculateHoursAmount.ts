// lib/pricing/calculateHoursAmount.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cálculo marginal mensual.
//
// REGLA DE NEGOCIO:
//   - Umbral mensual global: 20h.
//   - Hasta 20h: precio base, redondeo a múltiplos de 0.5h.
//   - Pasado 20h: precio alto, redondeo MENSUAL agregado a horas completas.
//   - Ejemplo mes 61.5h: 20×35 + ceil(41.5)×45 = 700 + 1890 = 2590.
//   - La función devuelve el delta que aporta el nuevo registro contra el total
//     mensual antes/después. Así la suma del mes siempre respeta la fórmula.
// ─────────────────────────────────────────────────────────────────────────────

import type { PricingConfig } from "@/types/entities";

export interface CalculationResult {
  montoTotal:      number;
  precioAplicado:  number;
  horasTrabajadas: number;
  horasACobrar:    number;
  desglose: {
    horasTrabajadasTramo1: number;
    horasTrabajadasTramo2: number;
    horasEnTramo1: number;
    horasEnTramo2: number;
    montoTramo1:   number;
    montoTramo2:   number;
  };
}

interface MonthlyBillingSnapshot {
  baseBillableHours: number;
  highBillableHours: number;
  totalBillableHours: number;
  baseAmount: number;
  highAmount: number;
  totalAmount: number;
}

/**
 * Calcula el delta facturable de un nuevo registro.
 *
 * @param horasNuevas        Horas trabajadas del registro nuevo.
 * @param horasAcumuladasMes Horas trabajadas crudas acumuladas del mes antes del registro.
 * @param config             Configuración de precios.
 */
export function calculateHoursAmount(
  horasNuevas: number,
  horasAcumuladasMes: number,
  config: PricingConfig
): CalculationResult {
  const { precioBase, precioAlto, umbralHoras } = config;

  const horas = round4(horasNuevas);
  const acum = round4(horasAcumuladasMes);
  const nextAcum = round4(acum + horas);

  const before = calculateMonthlyBillingSnapshot(acum, config);
  const after = calculateMonthlyBillingSnapshot(nextAcum, config);

  const horasTrabajadasTramo1 = round4(Math.min(Math.max(umbralHoras - acum, 0), horas));
  const horasTrabajadasTramo2 = round4(Math.max(horas - horasTrabajadasTramo1, 0));

  const horasEnTramo1 = round4(after.baseBillableHours - before.baseBillableHours);
  const horasEnTramo2 = round4(after.highBillableHours - before.highBillableHours);
  const montoTramo1 = round2(after.baseAmount - before.baseAmount);
  const montoTramo2 = round2(after.highAmount - before.highAmount);
  const montoTotal = round2(after.totalAmount - before.totalAmount);
  const precioAplicado = horasTrabajadasTramo2 > 0 || horasEnTramo2 > 0 ? precioAlto : precioBase;

  return {
    montoTotal,
    precioAplicado,
    horasTrabajadas: horas,
    horasACobrar: round4(after.totalBillableHours - before.totalBillableHours),
    desglose: { horasTrabajadasTramo1, horasTrabajadasTramo2, horasEnTramo1, horasEnTramo2, montoTramo1, montoTramo2 },
  };
}

export function previewMonto(
  horasNuevas: number,
  horasAcumuladasMes: number,
  config: PricingConfig
): number {
  if (!horasNuevas || horasNuevas <= 0) return 0;
  return calculateHoursAmount(horasNuevas, horasAcumuladasMes, config).montoTotal;
}

export function calculateMonthlyBillingSnapshot(totalWorkedHours: number, config: PricingConfig): MonthlyBillingSnapshot {
  const { precioBase, precioAlto, umbralHoras } = config;
  const totalWorked = round4(Math.max(totalWorkedHours, 0));
  const baseWorked = Math.min(totalWorked, umbralHoras);
  const highWorked = Math.max(totalWorked - umbralHoras, 0);

  const baseBillableHours = totalWorked <= umbralHoras ? roundBaseHours(baseWorked) : umbralHoras;
  const highBillableHours = roundHighHours(highWorked);
  const baseAmount = round2(baseBillableHours * precioBase);
  const highAmount = round2(highBillableHours * precioAlto);

  return {
    baseBillableHours,
    highBillableHours,
    totalBillableHours: round4(baseBillableHours + highBillableHours),
    baseAmount,
    highAmount,
    totalAmount: round2(baseAmount + highAmount),
  };
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function roundBaseHours(n: number): number {
  return n <= 0 ? 0 : round4(Math.ceil(round4(n) * 2) / 2);
}
function roundHighHours(n: number): number {
  return n <= 0 ? 0 : Math.ceil(round4(n));
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  const cfg: PricingConfig = { precioBase: 35, precioAlto: 45, umbralHoras: 20 };

  describe("calculateHoursAmount — regla mensual agregada", () => {
    it("base hasta 20h: 20×35 = 700", () => {
      const r = calculateHoursAmount(20, 0, cfg);
      expect(r.montoTotal).toBe(700);
      expect(r.horasACobrar).toBe(20);
    });

    it("abril 61.5h: 20×35 + ceil(41.5)×45 = 2590", () => {
      const r = calculateHoursAmount(61.5, 0, cfg);
      expect(r.montoTotal).toBe(2590);
      expect(r.horasACobrar).toBe(62);
    });

    it("marzo 55h: 20×35 + 35×45 = 2275", () => {
      const r = calculateHoursAmount(55, 0, cfg);
      expect(r.montoTotal).toBe(2275);
      expect(r.horasACobrar).toBe(55);
    });
  });
}
