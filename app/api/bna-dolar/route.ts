import { NextResponse } from "next/server";
import { parseBnaDolarBillete } from "@/lib/bna-dolar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BNA_URL = "https://www.bna.com.ar/Personas";

export async function GET() {
  try {
    const response = await fetch(BNA_URL, {
      headers: { "user-agent": "ptime/1.0 (+https://www.bna.com.ar/Personas)" },
      next: { revalidate: 60 * 30 },
    });
    if (!response.ok) throw new Error(`BNA respondió HTTP ${response.status}`);

    const html = await response.text();
    const rate = parseBnaDolarBillete(html);

    return NextResponse.json({
      success: true,
      source: BNA_URL,
      fetchedAt: new Date().toISOString(),
      ...rate,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, source: BNA_URL, error: error instanceof Error ? error.message : "Error consultando BNA" },
      { status: 502 },
    );
  }
}
