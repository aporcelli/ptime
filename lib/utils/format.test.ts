import { describe, expect, it } from "vitest";
import { formatDateShort, formatDateTimeShort, formatMonthShort, formatMonthYearLabel, formatPeriodLabel } from "./index";

describe("date display helpers", () => {
  it("formats ISO dates as DD-MM-AA", () => {
    expect(formatDateShort("2026-04-28")).toBe("28-04-26");
    expect(formatDateShort("2026-04-28T12:30:00.000Z")).toBe("28-04-26");
  });

  it("formats month keys as MM-AA", () => {
    expect(formatMonthShort("2026-04")).toBe("04-26");
  });

  it("keeps invalid values readable", () => {
    expect(formatDateShort("bad-date")).toBe("bad-date");
    expect(formatMonthShort("bad-month")).toBe("bad-month");
  });

  it("formats ISO datetime with date first", () => {
    expect(formatDateTimeShort("2026-04-28T12:30:00.000Z")).toMatch(/^28-04-26/);
  });

  it("formats month/year and readable periods", () => {
    expect(formatMonthYearLabel("2026-04")).toBe("Abril 2026");
    expect(formatPeriodLabel("2026-04-01", "2026-04-30")).toBe("Abril 2026 · 01-04-26 - 30-04-26");
  });
});
