import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/utils/safe-callback-url";

describe("safeCallbackUrl", () => {
  it("allows internal application paths with query and hash", () => {
    expect(safeCallbackUrl("/dashboard?tab=horas#top")).toBe("/dashboard?tab=horas#top");
    expect(safeCallbackUrl("/horas/nuevo")).toBe("/horas/nuevo");
  });

  it("falls back for empty or external URLs", () => {
    expect(safeCallbackUrl()).toBe("/dashboard");
    expect(safeCallbackUrl("")).toBe("/dashboard");
    expect(safeCallbackUrl("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("//evil.com")).toBe("/dashboard");
  });

  it("falls back for encoded or backslash redirect bypasses", () => {
    expect(safeCallbackUrl("/%2Fevil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("/\\evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("/%5Cevil.com")).toBe("/dashboard");
  });

  it("falls back for auth routes that can create loops", () => {
    expect(safeCallbackUrl("/login")).toBe("/dashboard");
    expect(safeCallbackUrl("/api/auth/signin")).toBe("/dashboard");
  });
});
