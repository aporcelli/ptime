import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_DEV_ACCESS_TOKEN } from "@/lib/env/dev-access";
import { SHEET_RANGES } from "@/lib/constants";
import { getLocalRows, resetLocalStore } from "@/lib/sheets/local-store";
import { saveHourFromActionInput } from "./save-flow";

const clienteId = "11111111-1111-4111-8111-111111111111";
const proyectoId = "22222222-2222-4222-8222-222222222222";
const tareaId = "33333333-3333-4333-8333-333333333333";

function expectReactFlightSafe(value: unknown) {
  expect(JSON.stringify(value)).not.toContain("undefined");
  expect(value).toEqual(JSON.parse(JSON.stringify(value)));
}

afterEach(() => {
  vi.unstubAllEnvs();
  resetLocalStore();
});

describe("hour save flow runtime normalization", () => {
  it("normalizes action-like form input through the local dev store into a JSON-safe success result", async () => {
    resetLocalStore({
      [SHEET_RANGES.CLIENTES]: [[clienteId, "Cliente", "cliente@ptime.test", "", "true", "", ""]],
      [SHEET_RANGES.PROYECTOS]: [[proyectoId, "Proyecto", clienteId, "", 4, 20, 35, 45, "activo", "", ""]],
      [SHEET_RANGES.TAREAS]: [[tareaId, "Desarrollo", "General", "true", ""]],
      [SHEET_RANGES.REGISTROS_HORAS]: [],
    });

    const result = await saveHourFromActionInput(
      {
        cliente_id: clienteId,
        proyecto_id: proyectoId,
        tarea_id: tareaId,
        fecha: "2026-04-27",
        horas: 1.25,
        descripcion: "  Implementar guard runtime seguro  ",
        estado: "confirmado",
      },
      {
        ctx: { sheetId: "local", accessToken: LOCAL_DEV_ACCESS_TOKEN },
        user: { id: "local", email: "local.dev@ptime.local" },
        idFactory: () => "record-1",
        now: () => "2026-04-27T12:00:00.000Z",
      },
    );

    expect(result).toMatchObject({
      success: true,
      data: {
        id: "record-1",
        cliente_id: clienteId,
        proyecto_id: proyectoId,
        tarea_id: tareaId,
        usuario_id: "local.dev@ptime.local",
        descripcion: "Implementar guard runtime seguro",
        horas: 1.25,
        precio_hora_aplicado: 35,
        monto_total: 52.5,
      },
    });
    expectReactFlightSafe(result);
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)[0][12]).toBe(clienteId);
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)[0][13]).toBe("1.25");
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)[0][14]).toBe("1.5");
    expect(getLocalRows(SHEET_RANGES.PROYECTOS)[0][4]).toBe("5.25");
  });

  it("persists worked hours separately from billable rounded hours", async () => {
    resetLocalStore({
      [SHEET_RANGES.CLIENTES]: [[clienteId, "Cliente", "cliente@ptime.test", "", "true", "", ""]],
      [SHEET_RANGES.PROYECTOS]: [[proyectoId, "Proyecto", clienteId, "", 0, 20, 35, 45, "activo", "", ""]],
      [SHEET_RANGES.TAREAS]: [[tareaId, "Desarrollo", "General", "true", ""]],
      [SHEET_RANGES.REGISTROS_HORAS]: [],
    });

    const result = await saveHourFromActionInput(
      {
        cliente_id: clienteId,
        proyecto_id: proyectoId,
        tarea_id: tareaId,
        fecha: "2026-04-27",
        horas: 0.3,
        descripcion: "  Ajuste menor de estilos  ",
        estado: "confirmado",
      },
      {
        ctx: { sheetId: "local", accessToken: LOCAL_DEV_ACCESS_TOKEN },
        user: { id: "local", email: "local.dev@ptime.local" },
        idFactory: () => "record-rounded",
        now: () => "2026-04-27T12:00:00.000Z",
      },
    );

    expect(result).toMatchObject({
      success: true,
      data: {
        horas: 0.3,
        horas_trabajadas: 0.3,
        horas_a_cobrar: 0.5,
        precio_hora_aplicado: 35,
        monto_total: 17.5,
      },
    });
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)[0].slice(13, 15)).toEqual(["0.3", "0.5"]);
  });

  it("uses prior raw worked monthly hours to calculate per-record high threshold billing", async () => {
    resetLocalStore({
      [SHEET_RANGES.CLIENTES]: [[clienteId, "Cliente", "cliente@ptime.test", "", "true", "", ""]],
      [SHEET_RANGES.PROYECTOS]: [[proyectoId, "Proyecto", clienteId, "", 0, 20, 35, 45, "activo", "", ""]],
      [SHEET_RANGES.TAREAS]: [[tareaId, "Desarrollo", "General", "true", ""]],
      [SHEET_RANGES.REGISTROS_HORAS]: [
        ["prev-1", proyectoId, tareaId, "local.dev@ptime.local", "2026-04-01", "20", "Primer bloque", "35", "700", "confirmado", "", "", clienteId, "20", "20"],
        ["prev-2", proyectoId, tareaId, "local.dev@ptime.local", "2026-04-02", "41.5", "Segundo bloque", "45", "1890", "confirmado", "", "", clienteId, "41.5", "42"],
      ],
    });

    const result = await saveHourFromActionInput(
      {
        cliente_id: clienteId,
        proyecto_id: proyectoId,
        tarea_id: tareaId,
        fecha: "2026-04-27",
        horas: 0.5,
        descripcion: "  Trabajo luego de llegar al umbral  ",
        estado: "confirmado",
      },
      {
        ctx: { sheetId: "local", accessToken: LOCAL_DEV_ACCESS_TOKEN },
        user: { id: "local", email: "local.dev@ptime.local" },
        idFactory: () => "record-after-threshold",
        now: () => "2026-04-27T12:00:00.000Z",
      },
    );

    expect(result).toMatchObject({
      success: true,
      data: {
        horas: 0.5,
        horas_trabajadas: 0.5,
        horas_a_cobrar: 1,
        precio_hora_aplicado: 45,
        monto_total: 45,
      },
    });
  });

  it("returns JSON-safe validation errors instead of unsafe thrown values", async () => {
    const result = await saveHourFromActionInput(
      { cliente_id: "", proyecto_id: "bad", tarea_id: "", fecha: "not-a-date", horas: Number.NaN, descripcion: "x" },
      {
        ctx: { sheetId: "local", accessToken: LOCAL_DEV_ACCESS_TOKEN },
        user: { id: "local", email: "local.dev@ptime.local" },
        idFactory: () => "record-2",
        now: () => "2026-04-27T12:00:00.000Z",
      },
    );

    expect(result).toMatchObject({ success: false, error: "Datos inválidos" });
    expect(result).toHaveProperty("fieldErrors.proyecto_id");
    expectReactFlightSafe(result);
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)).toEqual([]);
  });
});
