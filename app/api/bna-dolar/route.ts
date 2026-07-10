import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial";

export async function GET() {
  try {
    const response = await fetch(DOLAR_API_URL, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error(`DolarApi respondió HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || typeof data.compra !== "number" || typeof data.venta !== "number") {
      throw new Error("Datos de cotización inválidos o vacíos recibidos de la API");
    }

    // Formatear la fecha en formato YYYY-MM-DD
    const fecha = data.fechaActualizacion 
      ? data.fechaActualizacion.slice(0, 10) 
      : new Date().toISOString().slice(0, 10);

    return NextResponse.json({
      success: true,
      source: DOLAR_API_URL,
      fetchedAt: new Date().toISOString(),
      fecha,
      compra: data.compra,
      venta: data.venta,
    });
  } catch (error) {
    console.error("[BNA Dollar API Error]:", error);
    return NextResponse.json(
      { 
        success: false, 
        source: DOLAR_API_URL, 
        error: error instanceof Error ? error.message : "Error consultando la cotización" 
      },
      { status: 502 },
    );
  }
}
