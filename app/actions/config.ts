// app/actions/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuración global inyectable desde Admin.
// Incluye cache en memoria para reducir llamadas a Sheets.
// ─────────────────────────────────────────────────────────────────────────────
"use server";

import { auth } from "@/auth";
import { getAppConfig, getProyectoById } from "@/lib/sheets/queries";
import { upsertConfig } from "@/lib/sheets/mutations";
import { configSchema } from "@/lib/schemas/client";
import { revalidatePath } from "next/cache";
import type { AppConfig, PricingConfig, ActionResult } from "@/types/entities";
import { CONFIG_CACHE_TTL } from "@/lib/constants";

// ── Cache en memoria (Server-side) ────────────────────────────────────────────
let _configCache: AppConfig | null = null;
let _cacheTimestamp = 0;

function isCacheValid(): boolean {
  return _configCache !== null && Date.now() - _cacheTimestamp < CONFIG_CACHE_TTL;
}

export async function getConfig(): Promise<AppConfig> {
  if (isCacheValid()) return _configCache!;

  const config    = await getAppConfig();
  _configCache    = config;
  _cacheTimestamp = Date.now();
  return config;
}

export function invalidateConfigCache(): void {
  _configCache    = null;
  _cacheTimestamp = 0;
}

// ── Precios por proyecto (usa override del proyecto si existe) ────────────────
export async function getPricingConfigForProject(
  proyectoId: string
): Promise<PricingConfig> {
  const [globalConfig, proyecto] = await Promise.all([
    getConfig(),
    getProyectoById(proyectoId),
  ]);

  if (!proyecto) return globalConfig;

  // El proyecto puede sobreescribir los precios globales
  return {
    precioBase:   proyecto.precio_base   ?? globalConfig.precioBase,
    precioAlto:   proyecto.precio_alto   ?? globalConfig.precioAlto,
    umbralHoras:  proyecto.umbral_precio_alto ?? globalConfig.umbralHoras,
  };
}

// ── Actualizar configuración (solo ADMIN) ─────────────────────────────────────
export async function updateConfig(
  rawData: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Acceso denegado — solo administradores" };
  }

  const parsed = configSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success:     false,
      error:       "Datos de configuración inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { precioBase, precioAlto, umbralHoras } = parsed.data;

  await Promise.all([
    upsertConfig("precio_base_global",  String(precioBase)),
    upsertConfig("precio_alto_global",  String(precioAlto)),
    upsertConfig("umbral_horas_global", String(umbralHoras)),
  ]);

  // Invalidar cache para que la próxima llamada lea valores frescos
  invalidateConfigCache();
  revalidatePath("/admin/configuracion");

  return { success: true, data: undefined };
}
