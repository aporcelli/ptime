import { describe, expect, it } from "vitest";
import { SHEET_HEADERS } from "@/lib/constants";
import { mergeSheetHeaders } from "./client";

describe("mergeSheetHeaders", () => {
  it("appends new Registros_Horas headers to legacy sheets without changing existing columns", () => {
    const legacy = [
      "id", "proyecto_id", "tarea_id", "usuario_id", "fecha", "horas",
      "descripcion", "precio_hora_aplicado", "monto_total", "estado",
      "created_at", "updated_at", "cliente_id",
    ];

    const merged = mergeSheetHeaders(legacy, SHEET_HEADERS.REGISTROS_HORAS);

    expect(merged).toHaveLength(15);
    expect(merged.slice(0, legacy.length)).toEqual(legacy);
    expect(merged.slice(13)).toEqual(["horas_trabajadas", "horas_a_cobrar"]);
  });

  it("fills blank header cells but preserves custom non-empty legacy names", () => {
    const merged = mergeSheetHeaders(["id", "", "custom"], ["id", "proyecto_id", "tarea_id"]);

    expect(merged).toEqual(["id", "proyecto_id", "custom"]);
  });
});
