import { beforeEach, describe, expect, it, vi } from "vitest";
import { SHEET_RANGES } from "@/lib/constants";
import { LOCAL_DEV_ACCESS_TOKEN } from "@/lib/env/dev-access";
import { getLocalRows, resetLocalStore } from "@/lib/sheets/local-store";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => new Headers()) }));

const ctx = { sheetId: "local-sheet", accessToken: LOCAL_DEV_ACCESS_TOKEN } as const;

const PROYECTO_TIERED = ["proj-tiered", "Tiered", "client-1", "", 10, 20, 35, 45, "activo", "", ""];
const PROYECTO_FLAT = ["proj-flat", "Flat", "client-1", "", 10, 20, 35, 45, "activo", "", ""];

function seed() {
  resetLocalStore({
    [SHEET_RANGES.PROYECTOS]: [
      PROYECTO_TIERED,
      // Flat rate: usar_tarifa_fija=true en columna 10
      [...PROYECTO_FLAT.slice(0, 10), "true"],
    ],
    [SHEET_RANGES.REGISTROS_HORAS]: [],
  });
}

describe("lib/hours/service.ts — updateHourRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seed();
  });

  it("recalculates with flat rate when the project has usar_tarifa_fija (bug fix: API ignored it)", async () => {
    const { updateHourRecord } = await import("./service");
    const { getLocalRows } = await import("@/lib/sheets/local-store");

    // Registrar una hora en el proyecto flat → todo a base (35), sin umbral
    const existing = [
      "rec-1", "proj-flat", "task-1", "user@ptime.test", "2026-08-05", "10", "trabajo",
      "35", "350", "confirmado", "", "", "client-1", "10", "10",
    ];
    resetLocalStore({
      [SHEET_RANGES.PROYECTOS]: [[...PROYECTO_FLAT.slice(0, 10), "true"]],
      [SHEET_RANGES.REGISTROS_HORAS]: [existing],
    });

    // Editar el mismo registro cambiando solo la descripción (no recalcula)
    await updateHourRecord(ctx, "rec-1", {
      cliente_id: "client-1",
      proyecto_id: "proj-flat",
      tarea_id: "task-1",
      fecha: "2026-08-05",
      horas: 10,
      descripcion: "trabajo editado",
      estado: "confirmado",
    }, "user@ptime.test");

    const rows = getLocalRows(SHEET_RANGES.REGISTROS_HORAS);
    expect(rows[0][6]).toBe("trabajo editado"); // descripcion
    expect(rows[0][7]).toBe("35"); // rate se mantiene
    expect(rows[0][8]).toBe("350"); // monto se mantiene
  });

  it("applies flat-rate pricing on hours change (single rate, no premium)", async () => {
    const { updateHourRecord } = await import("./service");

    const existing = [
      "rec-1", "proj-flat", "task-1", "user@ptime.test", "2026-08-05", "10", "trabajo",
      "35", "350", "confirmado", "", "", "client-1", "10", "10",
    ];
    resetLocalStore({
      [SHEET_RANGES.PROYECTOS]: [[...PROYECTO_FLAT.slice(0, 10), "true"]],
      [SHEET_RANGES.REGISTROS_HORAS]: [existing],
    });

    // Cambiar horas → recalcula: flat rate → 12h × 35 = 420 (sin umbral/premium)
    await updateHourRecord(ctx, "rec-1", {
      cliente_id: "client-1",
      proyecto_id: "proj-flat",
      tarea_id: "task-1",
      fecha: "2026-08-05",
      horas: 12,
      descripcion: "trabajo",
      estado: "confirmado",
    }, "user@ptime.test");

    const rows = getLocalRows(SHEET_RANGES.REGISTROS_HORAS);
    expect(rows[0][7]).toBe("35"); // rate = base
    expect(rows[0][8]).toBe("420"); // 12 × 35
  });

  it("recalculates by chronological position for tiered projects", async () => {
    const { updateHourRecord } = await import("./service");

    const existing = [
      "rec-1", "proj-tiered", "task-1", "user@ptime.test", "2026-08-05", "2", "trabajo",
      "35", "70", "confirmado", "", "", "client-1", "2", "2",
    ];
    resetLocalStore({
      [SHEET_RANGES.PROYECTOS]: [PROYECTO_TIERED],
      [SHEET_RANGES.REGISTROS_HORAS]: [existing],
    });

    // Editar con 3h el día 05-08 → acumulado previo 0 → todo base: 3 × 35 = 105
    await updateHourRecord(ctx, "rec-1", {
      cliente_id: "client-1",
      proyecto_id: "proj-tiered",
      tarea_id: "task-1",
      fecha: "2026-08-05",
      horas: 3,
      descripcion: "trabajo",
      estado: "confirmado",
    }, "user@ptime.test");

    const rows = getLocalRows(SHEET_RANGES.REGISTROS_HORAS);
    expect(rows[0][7]).toBe("35");
    expect(rows[0][8]).toBe("105");
  });

  it("throws REGISTRO_NOT_FOUND for unknown id", async () => {
    const { updateHourRecord } = await import("./service");
    await expect(updateHourRecord(ctx, "no-existe", {
      cliente_id: "client-1",
      proyecto_id: "proj-tiered",
      tarea_id: "task-1",
      fecha: "2026-08-05",
      horas: 1,
      descripcion: "x",
      estado: "confirmado",
    }, "user@ptime.test")).rejects.toThrow("REGISTRO_NOT_FOUND");
  });
});
