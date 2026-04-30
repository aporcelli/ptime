import { describe, expect, it } from "vitest";
import { parseClienteRow, parseProyectoRow, parseRegistroHorasRow, serializeRegistroHorasRow } from "./serializers";

describe("Sheets serializers", () => {
  it("parses empty cells, booleans, numbers, and dates into JSON-safe entities", () => {
    expect(parseClienteRow(["c1", "Acme", "a@b.test", "", "si", "", undefined])).toEqual({
      id: "c1",
      nombre: "Acme",
      email: "a@b.test",
      activo: true,
      created_at: "",
      updated_at: "",
    });

    expect(parseProyectoRow(["p1", "Web", "c1", "", "bad", "", "", "", "", "", ""])).toMatchObject({
      id: "p1",
      horas_acumuladas: 0,
      estado: "activo",
    });
    expect(parseProyectoRow(["p1", "Web", "c1", "", "bad", "", "", "", "", "", ""])).not.toHaveProperty("presupuesto_horas");
  });

  it("preserves Registro_Horas cliente_id plus worked and billable hour columns when parsing and serializing", () => {
    const parsed = parseRegistroHorasRow([
      "r1", "p1", "t1", "u@test", "27/04/2026", "1.5", "Trabajo", "35", "70", "confirmado", "", "", "c1", "1.25", "2",
    ]);

    expect(parsed).toMatchObject({ fecha: "2026-04-27", horas: 1.5, horas_trabajadas: 1.25, horas_a_cobrar: 2, monto_total: 70, cliente_id: "c1" });
    expect(serializeRegistroHorasRow(parsed)).toHaveLength(15);
    expect(serializeRegistroHorasRow(parsed)[12]).toBe("c1");
    expect(serializeRegistroHorasRow(parsed).slice(13, 15)).toEqual([1.25, 2]);
  });

  it("keeps existing rows compatible by falling back worked and billable hours to legacy horas", () => {
    const parsed = parseRegistroHorasRow([
      "r1", "p1", "t1", "u@test", "27/04/2026", "1.5", "Trabajo", "35", "52.5", "confirmado", "", "", "c1",
    ]);

    expect(parsed).toMatchObject({ horas: 1.5, horas_trabajadas: 1.5, horas_a_cobrar: 1.5 });
  });
});
