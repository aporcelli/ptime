import { describe, expect, it } from "vitest";
import { actionError, actionOk, toPlainJson } from "./result";

describe("ActionResult JSON safety", () => {
  it("removes undefined object fields and converts invalid numbers to null", () => {
    const value = toPlainJson({ ok: true, missing: undefined, total: NaN, nested: { amount: Infinity } });

    expect(value).toEqual({ ok: true, total: null, nested: { amount: null } });
  });

  it("normalizes Error instances and dates into plain serializable action payloads", () => {
    const ok = actionOk({ at: new Date("2026-04-27T12:00:00.000Z") });
    const err = actionError(new Error("Sheets failed"));

    expect(ok).toEqual({ success: true, data: { at: "2026-04-27T12:00:00.000Z" } });
    expect(err).toEqual({ success: false, error: "Sheets failed" });
  });
});
