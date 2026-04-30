import { describe, expect, it } from "vitest";
import { parseBnaDolarBillete } from "./bna-dolar";

describe("BNA dólar parser", () => {
  it("extracts first Dolar U.S.A venta after Cotización Billetes from BNA Personas layout", () => {
    const html = `
      <a>Cotización Billetes</a>
      <a>Cotización Divisas</a>
      <div>28/4/2026 Compra Venta</div>
      <table><tr><td>Dolar U.S.A</td><td>1380,00</td><td>1430,00</td></tr></table>
      <div>28/4/2026 Compra Venta Dolar U.S.A 1395.5000 1404.5000</div>
    `;

    expect(parseBnaDolarBillete(html)).toEqual({ fecha: "2026-04-28", compra: 1380, venta: 1430 });
  });
});
