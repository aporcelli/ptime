// app/api/health/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Health check endpoint para Vercel y monitoreo de uptime.
// Retorna 200 si todo está en orden, 503 si faltan variables críticas.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
] as const;

export async function GET() {
    const missing = REQUIRED_ENV.filter((k) => !process.env[k]);

    if (missing.length > 0) {
        return NextResponse.json(
            {
                status: "degraded",
                timestamp: new Date().toISOString(),
                missing_env: missing,
            },
            { status: 503 }
        );
    }

    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "0.1.0",
        node: process.version,
        env: process.env.NODE_ENV,
    });
}
