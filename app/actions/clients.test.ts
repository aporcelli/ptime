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

describe("createClienteAction", () => {
  beforeEach(() => {
    resetLocalStore({
      [SHEET_RANGES.CLIENTES]: [["existing-client", "Cliente Existente", "billing@ptime.test", "", "true", "", ""]],
    });
  });

  it("creates a new client when another client already uses the same email", async () => {
    const { createClienteAction } = await import("./clients");

    const result = await createClienteAction({
      nombre: "Cliente Nuevo",
      email: "billing@ptime.test",
      telefono: "",
      activo: true,
    });

    expect(result.success).toBe(true);
    expect(getLocalRows(SHEET_RANGES.CLIENTES).map((row) => row[2])).toEqual([
      "billing@ptime.test",
      "billing@ptime.test",
    ]);
  });

  it("keeps rejecting clients with invalid email format", async () => {
    const { createClienteAction } = await import("./clients");

    const result = await createClienteAction({
      nombre: "Cliente Nuevo",
      email: "no-es-email",
      telefono: "",
      activo: true,
    });

    expect(result.success).toBe(false);
    expect(getLocalRows(SHEET_RANGES.CLIENTES).map((row) => row[0])).toEqual(["existing-client"]);
  });
});
