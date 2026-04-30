import { beforeEach, describe, expect, it, vi } from "vitest";
import { SHEET_RANGES } from "@/lib/constants";
import { LOCAL_DEV_ACCESS_TOKEN } from "@/lib/env/dev-access";
import { getLocalRows, resetLocalStore } from "@/lib/sheets/local-store";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "u1", email: "user@ptime.test" } })),
}));
vi.mock("@/lib/sheets/context", () => ({
  getSheetCtx: vi.fn(async () => ({ sheetId: "local-sheet", accessToken: LOCAL_DEV_ACCESS_TOKEN })),
}));

describe("deleteHourAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetLocalStore({
      [SHEET_RANGES.PROYECTOS]: [["project-1", "Proyecto", "client-1", "", 12, 20, 35, 45, "activo", "", ""]],
      [SHEET_RANGES.REGISTROS_HORAS]: [[
        "record-1",
        "project-1",
        "task-1",
        "user@ptime.test",
        "2026-04-10",
        "1.5",
        "Trabajo",
        "35",
        "52.5",
        "confirmado",
        "",
        "",
        "client-1",
        "1.5",
        "1.5",
      ]],
    });
  });

  it("deletes current user record and subtracts worked hours from project", async () => {
    const { deleteHourAction } = await import("./hours");
    const { revalidatePath } = await import("next/cache");

    const result = await deleteHourAction("record-1");

    expect(result).toEqual({ success: true });
    expect(getLocalRows(SHEET_RANGES.REGISTROS_HORAS)).toEqual([]);
    expect(getLocalRows(SHEET_RANGES.PROYECTOS)[0][4]).toBe("10.5");
    expect(revalidatePath).toHaveBeenCalledWith("/horas");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/reportes");
    expect(revalidatePath).toHaveBeenCalledWith("/horas/record-1");
  });
});
