export interface BnaDolarRate {
  fecha: string;
  compra: number;
  venta: number;
}

function parseBnaNumber(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error(`Cotización inválida: ${value}`);
  return parsed;
}

function parseBnaDate(value: string): string {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) throw new Error(`Fecha BNA inválida: ${value}`);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseBnaDolarBillete(html: string): BnaDolarRate {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const afterBilletes = text.split(/Cotizaci[oó]n Billetes/i)[1] ?? text;
  const match = afterBilletes.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+Compra\s+Venta\s+Dolar\s+U\.S\.A\s+([\d.,]+)\s+([\d.,]+)/i)
    ?? afterBilletes.match(/Dolar\s+U\.S\.A\s+([\d.,]+)\s+([\d.,]+)/i);

  if (!match) throw new Error("No se encontró Dolar U.S.A en Cotización Billetes BNA");

  const hasDate = match.length === 4;
  return {
    fecha: hasDate ? parseBnaDate(match[1]) : "",
    compra: parseBnaNumber(match[hasDate ? 2 : 1]),
    venta: parseBnaNumber(match[hasDate ? 3 : 2]),
  };
}
