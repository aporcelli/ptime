import { describe, expect, it } from "vitest";
import { calculateProjectHourAdjustments, getMonthlyWorkedHoursAccumulated } from "./accounting";

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
