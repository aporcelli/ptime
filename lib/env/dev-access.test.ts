import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getLocalDevAccessContext,
  getRootRedirectTarget,
  isLocalDevAccessEnabled,
  resolveProtectedAppAccess,
} from "./dev-access";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
});

describe("local dev no-OAuth access guard", () => {
  it("enables explicit localhost dev access outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_DEV_ACCESS", "true");
    vi.stubEnv("LOCAL_DEV_SHEET_ID", "local-sheet");

    expect(isLocalDevAccessEnabled("http://localhost:3000/dashboard")).toBe(true);
    expect(getLocalDevAccessContext("http://localhost:3000/dashboard")).toEqual({ sheetId: "local-sheet", accessToken: "local-dev-access" });
  });

  it("rejects production even when the explicit flag is present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOCAL_DEV_ACCESS", "true");

    expect(() => isLocalDevAccessEnabled("http://localhost:3000/dashboard")).toThrow("LOCAL_DEV_ACCESS cannot be enabled in production");
  });

  it("keeps bypass disabled unless env flag and localhost host are both present", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_DEV_ACCESS", "false");
    expect(isLocalDevAccessEnabled("http://localhost:3000/dashboard")).toBe(false);

    vi.stubEnv("LOCAL_DEV_ACCESS", "true");
    expect(isLocalDevAccessEnabled()).toBe(false);
    expect(isLocalDevAccessEnabled("https://ptime.tucloud.pro/dashboard")).toBe(false);
    expect(isLocalDevAccessEnabled("http://127.0.0.1:3000/dashboard")).toBe(true);
  });

  it("hard-fails production before host evaluation", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOCAL_DEV_ACCESS", "true");

    expect(() => isLocalDevAccessEnabled("https://ptime.tucloud.pro/dashboard")).toThrow("LOCAL_DEV_ACCESS cannot be enabled in production");
  });

  it("allows protected app access on localhost when local dev access is enabled", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_DEV_ACCESS", "true");
    vi.stubEnv("LOCAL_DEV_SHEET_ID", "local-sheet");

    expect(
      resolveProtectedAppAccess({
        session: null,
        cookieSheetId: undefined,
        requestUrl: "http://127.0.0.1:3010/dashboard",
      })
    ).toEqual({
      kind: "allow",
      user: { id: "local.dev@ptime.local", email: "local.dev@ptime.local", name: "Local Dev", role: "ADMIN" },
      sheetId: "local-sheet",
    });
    expect(getRootRedirectTarget({ sessionUser: undefined, requestUrl: "http://127.0.0.1:3010/" })).toBe("/dashboard");
  });

  it("keeps protected access on the normal auth path when local dev access is unavailable", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_DEV_ACCESS", "true");

    expect(
      resolveProtectedAppAccess({
        session: null,
        cookieSheetId: undefined,
        requestUrl: "https://ptime.tucloud.pro/dashboard",
      })
    ).toEqual({ kind: "redirect", target: "/login" });
    expect(getRootRedirectTarget({ sessionUser: undefined, requestUrl: "https://ptime.tucloud.pro/" })).toBe("/login");
    expect(
      resolveProtectedAppAccess({
        session: {
          user: { id: "u1", email: "u@example.com", name: "User", role: "USER", sheetId: "sheet-1" },
        },
        cookieSheetId: undefined,
        requestUrl: "https://ptime.tucloud.pro/dashboard",
      })
    ).toEqual({
      kind: "allow",
      user: { id: "u1", email: "u@example.com", name: "User", role: "USER", sheetId: "sheet-1" },
      sheetId: "sheet-1",
    });
  });
});
