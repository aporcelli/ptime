import { describe, expect, it } from "vitest";
import { convertUsdToArs, parseExchangeRateInput } from "./currency";

describe("ARS conversion helpers", () => {
  it("parses Argentine exchange-rate inputs", () => {
    expect(parseExchangeRateInput("1200")).toBe(1200);
    expect(parseExchangeRateInput("1.200,50")).toBe(1200.5);
    expect(parseExchangeRateInput("1200.50")).toBe(1200.5);
    expect(parseExchangeRateInput("1.200")).toBe(1200);
  });

  it("rejects empty or invalid rates", () => {
    expect(parseExchangeRateInput("")).toBeNull();
    expect(parseExchangeRateInput("0")).toBeNull();
    expect(parseExchangeRateInput("abc")).toBeNull();
  });

  it("converts USD amount to ARS", () => {
    expect(convertUsdToArs(2590, 1200)).toBe(3108000);
    expect(convertUsdToArs(2590.55, null)).toBeNull();
  });
});
