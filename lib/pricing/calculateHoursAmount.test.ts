import { describe, expect, it } from "vitest";
import { calculateHoursAmount, calculateMonthlyBillingSnapshot } from "./calculateHoursAmount";
import type { PricingConfig } from "@/types/entities";

const cfg: PricingConfig = { precioBase: 35, precioAlto: 45, umbralHoras: 20 };

describe("calculateHoursAmount per-record threshold billing", () => {
  it.each([
    [0.1, 0.5, 17.5],
    [0.3, 0.5, 17.5],
    [0.5, 0.5, 17.5],
    [1, 1, 35],
    [20, 20, 700],
  ])("base segment %s worked -> %s billable", (worked, billable, amount) => {
    const result = calculateHoursAmount(worked, 0, cfg);

    expect(result.horasTrabajadas).toBe(worked);
    expect(result.horasACobrar).toBe(billable);
    expect(result.precioAplicado).toBe(35);
    expect(result.montoTotal).toBe(amount);
  });

  it.each([
    [0.5, 1, 45],
    [1, 1, 45],
    [1.5, 2, 90],
    [41.5, 42, 1890],
  ])("high segment from threshold %s worked -> per-record integer high", (worked, billable, amount) => {
    const result = calculateHoursAmount(worked, 20, cfg);

    expect(result.horasTrabajadas).toBe(worked);
    expect(result.horasACobrar).toBe(billable);
    expect(result.precioAplicado).toBe(45);
    expect(result.montoTotal).toBe(amount);
  });

  it("charges each fractional high-segment record even when prior high total is fractional", () => {
    const firstHalf = calculateHoursAmount(0.5, 20, cfg);
    const secondHalf = calculateHoursAmount(0.5, 20.5, cfg);

    expect(firstHalf).toMatchObject({ horasACobrar: 1, montoTotal: 45 });
    expect(secondHalf).toMatchObject({ horasACobrar: 1, montoTotal: 45 });
    expect(firstHalf.montoTotal + secondHalf.montoTotal).toBe(90);
  });

  it("charges 61.5 accumulated + 0.5 new as 1 high billable hour", () => {
    const result = calculateHoursAmount(0.5, 61.5, cfg);

    expect(result).toMatchObject({
      horasTrabajadas: 0.5,
      horasACobrar: 1,
      precioAplicado: 45,
      montoTotal: 45,
    });
    expect(result.desglose).toMatchObject({
      horasTrabajadasTramo1: 0,
      horasTrabajadasTramo2: 0.5,
      horasEnTramo1: 0,
      horasEnTramo2: 1,
      montoTramo1: 0,
      montoTramo2: 45,
    });
  });

  it("splits crossing entry against monthly aggregate totals", () => {
    const result = calculateHoursAmount(1, 19.5, cfg);

    expect(result.precioAplicado).toBe(45);
    expect(result.horasTrabajadas).toBe(1);
    expect(result.horasACobrar).toBe(1.5);
    expect(result.montoTotal).toBe(62.5);
    expect(result.desglose).toEqual({
      horasTrabajadasTramo1: 0.5,
      horasTrabajadasTramo2: 0.5,
      horasEnTramo1: 0.5,
      horasEnTramo2: 1,
      montoTramo1: 17.5,
      montoTramo2: 45,
    });
  });

  it("keeps aggregate snapshot available only as a legacy monthly estimate", () => {
    expect(calculateMonthlyBillingSnapshot(61.5, cfg)).toMatchObject({
      baseBillableHours: 20,
      highBillableHours: 42,
      totalBillableHours: 62,
      totalAmount: 2590,
    });
    expect(calculateMonthlyBillingSnapshot(55, cfg)).toMatchObject({
      baseBillableHours: 20,
      highBillableHours: 35,
      totalBillableHours: 55,
      totalAmount: 2275,
    });
  });
});
