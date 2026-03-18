'use server';

import { getSheetCtx }  from "@/lib/sheets/context";
import { getAppConfig } from "@/lib/sheets/queries";
import { upsertConfig } from "@/lib/sheets/mutations";
import { configSchema } from "@/lib/schemas/client";
import { auth }          from "@/auth";
import { revalidatePath } from "next/cache";
import type { AppConfig, PricingConfig, ActionResult } from "@/types/entities";
import { CONFIG_CACHE_TTL, PRICING_DEFAULTS } from "@/lib/constants";

let _cache: Map<string, { config: AppConfig; ts: number }> = new Map();

export async function getConfig(): Promise<AppConfig> {
  const ctx  = await getSheetCtx();
  const key  = ctx.sheetId;
  const hit  = _cache.get(key);
  if (hit && Date.now() - hit.ts < CONFIG_CACHE_TTL) return hit.config;
  const config = await getAppConfig(ctx);
  _cache.set(key, { config, ts: Date.now() });
  return config;
}

export async function invalidateConfigCache(): Promise<void> {
  const ctx = await getSheetCtx();
  _cache.delete(ctx.sheetId);
}

export async function getPricingConfigForProject(proyectoId: string): Promise<PricingConfig> {
  const { getProyectoById } = await import("@/lib/sheets/queries");
  const ctx     = await getSheetCtx();
  const [global, proyecto] = await Promise.all([getConfig(), getProyectoById(ctx, proyectoId)]);
  if (!proyecto) return global;
  return {
    precioBase:  proyecto.precio_base        ?? global.precioBase,
    precioAlto:  proyecto.precio_alto        ?? global.precioAlto,
    umbralHoras: proyecto.umbral_precio_alto ?? global.umbralHoras,
  };
}

export async function updateConfig(rawData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Acceso denegado" };
  }
  const parsed = configSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };
  const ctx = await getSheetCtx();
  const { precioBase, precioAlto, umbralHoras } = parsed.data;
  await Promise.all([
    upsertConfig(ctx, "precio_base_global",  String(precioBase)),
    upsertConfig(ctx, "precio_alto_global",  String(precioAlto)),
    upsertConfig(ctx, "umbral_horas_global", String(umbralHoras)),
  ]);
  await invalidateConfigCache();
  revalidatePath("/admin/configuracion");
  return { success: true, data: undefined };
}
