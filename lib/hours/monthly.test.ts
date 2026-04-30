import { describe, expect, it } from "vitest";
import {
  getAdjacentMonth,
  getClientFilteredRecords,
  getEligibleInvoiceRecordIds,
  getFilteredRecords,
  getLatestMonthWithRecords,
  getMonthFilteredRecords,
  getMonthInvoiceSummary,
  repriceMonthlyRecords,
  summarizeRecords,
} from "./monthly";
import type { PricingConfig, RegistroHoras } from "@/types/entities";

const record = (
  id: string,
  fecha: string,
  estado: RegistroHoras["estado"] | "rechazado",
  monto_total: number,
  horas = 1,
  horas_a_cobrar = horas,
  cliente_id?: string,
): RegistroHoras => ({
  id,
  cliente_id,
  proyecto_id: "p1",
  tarea_id: "t1",
  usuario_id: id.startsWith("other") ? "other@test" : "user@test",
  fecha,
  horas,
  horas_trabajadas: horas,
  horas_a_cobrar,
  descripcion: "Trabajo mensual",
  precio_hora_aplicado: 35,
  monto_total,
  estado: estado as RegistroHoras["estado"],
  created_at: "",
  updated_at: "",
});

const rows = [
  record("old", "2026-03-20", "confirmado", 35, 1, 1, "c1"),
  record("draft", "2026-04-01", "borrador", 17.5, 0.25, 0.5, "c1"),
  record("confirmed", "2026-04-02", "confirmado", 45, 1, 1, "c2"),
  record("invoiced", "2026-04-03", "facturado", 35, 1, 1, "c2"),
  record("rejected", "2026-04-04", "rechazado", 99, 1, 1, "c1"),
  record("newest", "2026-05-01", "confirmado", 70, 2, 2, "c2"),
];

const cfg: PricingConfig = { precioBase: 35, precioAlto: 45, umbralHoras: 20 };

describe("monthly hours helpers", () => {
  it("finds latest month with records and previous month", () => {
    expect(getLatestMonthWithRecords(rows)).toBe("2026-05");
    expect(getAdjacentMonth("2026-05", -1)).toBe("2026-04");
  });

  it("filters latest, previous, and all records", () => {
    expect(getMonthFilteredRecords(rows, "latest").map((r) => r.id)).toEqual(["newest"]);
    expect(getMonthFilteredRecords(rows, "previous").map((r) => r.id)).toEqual(["draft", "confirmed", "invoiced", "rejected"]);
    expect(getMonthFilteredRecords(rows, "all")).toHaveLength(rows.length);
  });

  it("filters by client and combines month + client filters", () => {
    expect(getClientFilteredRecords(rows, "c1").map((r) => r.id)).toEqual(["old", "draft", "rejected"]);
    expect(getFilteredRecords(rows, "previous", "c2").map((r) => r.id)).toEqual(["confirmed", "invoiced"]);
  });

  it("summarizes filtered records excluding rejected from totals", () => {
    expect(summarizeRecords(getFilteredRecords(rows, "previous", "c1"))).toMatchObject({
      totalWorkedHours: 0.25,
      totalBillableHours: 0.5,
      totalAmount: 17.5,
      eligibleCount: 1,
      eligibleAmount: 17.5,
    });
  });

  it("summarizes worked hours, billable hours, and eligible monthly invoice rows", () => {
    const summary = getMonthInvoiceSummary(rows, "2026-04");

    expect(summary).toMatchObject({
      month: "2026-04",
      totalWorkedHours: 2.25,
      totalBillableHours: 2.5,
      totalAmount: 97.5,
      eligibleCount: 2,
      eligibleAmount: 62.5,
    });
    expect(summary.eligibleRecords.map((r) => r.id)).toEqual(["draft", "confirmed"]);
  });

  it("selects only current-user month records not rejected or invoiced", () => {
    const scopedRows = [...rows, record("other-confirmed", "2026-04-02", "confirmado", 45, 1, 1, "c1")];

    expect(getEligibleInvoiceRecordIds(scopedRows, "2026-04", "user@test")).toEqual(["draft", "confirmed"]);
    expect(getEligibleInvoiceRecordIds(scopedRows, "2026-04", "other@test")).toEqual(["other-confirmed"]);
  });

  it("reprices month records in sequence using current billing logic for stale legacy rows", () => {
    const repriced = repriceMonthlyRecords([
      record("a", "2026-04-01", "confirmado", 17.5, 19.5, 19.5, "c1"),
      record("b", "2026-04-02", "confirmado", 17.5, 0.3, 0.3, "c1"),
      record("c", "2026-04-03", "confirmado", 17.5, 0.5, 0.5, "c1"),
    ], {}, cfg);

    expect(repriced.map((row) => ({
      id: row.id,
      horas_a_cobrar: row.horas_a_cobrar,
      monto_total: row.monto_total,
    }))).toEqual([
      { id: "a", horas_a_cobrar: 19.5, monto_total: 682.5 },
      { id: "b", horas_a_cobrar: 0.5, monto_total: 17.5 },
      { id: "c", horas_a_cobrar: 1, monto_total: 45 },
    ]);

    expect(summarizeRecords(repriced)).toMatchObject({
      totalWorkedHours: 20.3,
      totalBillableHours: 21,
      totalAmount: 745,
    });
  });

  it("calculates April example as monthly aggregate: 61.5h -> 2590 USD", () => {
    const aprilRows = [
      record("base", "2026-04-01", "confirmado", 0, 20, 20, "c1"),
      ...Array.from({ length: 83 }, (_, index) =>
        record(`high-${index}`, `2026-04-${String(2 + Math.floor(index / 4)).padStart(2, "0")}`, "confirmado", 0, 0.5, 0.5, "c1"),
      ),
    ];

    expect(summarizeRecords(repriceMonthlyRecords(aprilRows, {}, cfg))).toMatchObject({
      totalWorkedHours: 61.5,
      totalBillableHours: 62,
      totalAmount: 2590,
    });
  });

  it("keeps March example at 55h -> 2275 USD", () => {
    const marchRows = Array.from({ length: 55 }, (_, index) =>
      record(`march-${index}`, `2026-03-${String(1 + Math.floor(index / 2)).padStart(2, "0")}`, "facturado", 0, 1, 1, "c1"),
    );

    expect(summarizeRecords(repriceMonthlyRecords(marchRows, {}, cfg))).toMatchObject({
      totalWorkedHours: 55,
      totalBillableHours: 55,
      totalAmount: 2275,
    });
  });
});
