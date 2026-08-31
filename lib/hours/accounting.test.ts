import { describe, expect, it } from "vitest";
import { calculateProjectHourAdjustments, getAccumulatedWorkedHoursUpTo, getMonthlyWorkedHoursAccumulated } from "./accounting";

describe("project hour accounting for Registro_Horas updates", () => {
  it("uses only the hour difference when an edit stays in the same project", () => {
    expect(calculateProjectHourAdjustments({ proyecto_id: "p1", horas: 2 }, { proyecto_id: "p1", horas: 3.5 })).toEqual([
      { proyectoId: "p1", deltaHoras: 1.5 },
    ]);
  });

  it("subtracts from old project and adds to new project when moved", () => {
    expect(calculateProjectHourAdjustments({ proyecto_id: "p1", horas: 2 }, { proyecto_id: "p2", horas: 3 })).toEqual([
      { proyectoId: "p1", deltaHoras: -2 },
      { proyectoId: "p2", deltaHoras: 3 },
    ]);
  });

  it("accumulates raw worked monthly hours for aggregate monthly billing", () => {
    expect(getMonthlyWorkedHoursAccumulated([
      { id: "r1", fecha: "2026-04-01", horas: 0.3 },
      { id: "r2", fecha: "2026-04-02", horas: 0.5 },
      { id: "r3", fecha: "2026-03-31", horas: 9 },
    ], "2026-04")).toBe(0.8);
  });

  it("can exclude current record while recalculating edited entry monthly accumulation", () => {
    expect(getMonthlyWorkedHoursAccumulated([
      { id: "keep", fecha: "2026-04-01", horas: 19.5 },
      { id: "edit", fecha: "2026-04-02", horas: 0.3 },
    ], "2026-04", "edit")).toBe(19.5);
  });
});
describe("getAccumulatedWorkedHoursUpTo — posición cronológica", () => {
  it("suma solo registros con fecha anterior a la referencia", () => {
    expect(getAccumulatedWorkedHoursUpTo([
      { id: "r1", fecha: "2026-08-03", horas: 3 },
      { id: "r2", fecha: "2026-08-05", horas: 2 },
      { id: "r3", fecha: "2026-08-06", horas: 2 },
      { id: "r4", fecha: "2026-08-10", horas: 1.5 },
    ], "2026-08", "2026-08-06")).toBe(5);
  });

  it("no incluye registros del mismo día que la referencia", () => {
    expect(getAccumulatedWorkedHoursUpTo([
      { id: "r1", fecha: "2026-08-05", horas: 3 },
      { id: "r2", fecha: "2026-08-05", horas: 2 },
    ], "2026-08", "2026-08-05")).toBe(0);
  });

  it("ignora registros de otros meses", () => {
    expect(getAccumulatedWorkedHoursUpTo([
      { id: "r1", fecha: "2026-07-31", horas: 50 },
      { id: "r2", fecha: "2026-08-01", horas: 2 },
    ], "2026-08", "2026-08-10")).toBe(2);
  });

  it("editar un registro viejo usa la posición de SU fecha, no el total del mes", () => {
    const registros = [
      { id: "viejo", fecha: "2026-08-05", horas: 2 },
      { id: "a", fecha: "2026-08-06", horas: 2 },
      { id: "b", fecha: "2026-08-10", horas: 60 },
    ];
    // Acumulado para el registro viejo (05-08): solo registros con fecha < 05-08 → 0
    expect(getAccumulatedWorkedHoursUpTo(registros, "2026-08", "2026-08-05", "viejo")).toBe(0);
  });

  it("backfill con fecha pasada no se contamina con el futuro", () => {
    const registros = [
      { id: "a", fecha: "2026-08-10", horas: 10 },
      { id: "b", fecha: "2026-08-15", horas: 10 },
    ];
    // Registro nuevo con fecha 03-08: acumulado = registros anteriores al 03-08 → 0
    expect(getAccumulatedWorkedHoursUpTo(registros, "2026-08", "2026-08-03")).toBe(0);
  });

  it("cambio de fecha a otro mes usa la posición en el mes nuevo", () => {
    const registros = [
      { id: "a", fecha: "2026-09-02", horas: 5 },
      { id: "b", fecha: "2026-09-05", horas: 6 },
    ];
    expect(getAccumulatedWorkedHoursUpTo(registros, "2026-09", "2026-09-05", "b")).toBe(5);
  });
});

