const round2 = (value: number) => Math.round(value * 100) / 100;

export function parseExchangeRateInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed.replace(/^([0-9]{1,3})\.([0-9]{3})$/, "$1$2");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function convertUsdToArs(usdAmount: number, exchangeRate: number | null): number | null {
  if (!exchangeRate || exchangeRate <= 0) return null;
  return round2(usdAmount * exchangeRate);
}
