// lib/sheets/client.ts
// Cliente liviano de Google Sheets usando fetch + OAuth token del usuario.
// Evita dependencias pesadas de googleapis que en Node 24/Vercel pueden romper por ESM/CJS.

import { SHEET_HEADERS, SHEET_NAMES } from "@/lib/constants";
import { LOCAL_DEV_ACCESS_TOKEN } from "@/lib/env/dev-access";
import { appendLocalRow, clearLocalRow, getLocalRows, updateLocalRow } from "./local-store";

type Primitive = string | number | boolean;

type SheetsGetResponse = {
  sheets?: Array<{ properties?: { title?: string } }>;
  properties?: { title?: string };
};

type ValuesResponse = {
  values?: unknown[][];
};

function apiBase(spreadsheetId: string): string {
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`;
}

async function sheetsRequest<T>(
  spreadsheetId: string,
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`${apiBase(spreadsheetId)}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      if (res.status === 204) return {} as T;
      return (await res.json()) as T;
    }

    const shouldRetry = res.status === 429 || res.status >= 500;
    const text = await res.text();

    if (!shouldRetry || attempt === maxAttempts) {
      throw new Error(`Google Sheets API ${res.status}: ${text || res.statusText}`);
    }

    const retryAfterSeconds = Number(res.headers.get("retry-after") ?? "0");
    const baseMs = retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : Math.min(1000 * 2 ** (attempt - 1), 8000);
    const jitterMs = Math.floor(Math.random() * 400);
    await new Promise((resolve) => setTimeout(resolve, baseMs + jitterMs));
  }

  throw new Error("Google Sheets request retry loop exhausted");
}

async function valuesGet(spreadsheetId: string, accessToken: string, range: string, withDateTime = false): Promise<ValuesResponse> {
  const params = new URLSearchParams({
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  if (withDateTime) params.set("dateTimeRenderOption", "FORMATTED_STRING");
  return sheetsRequest<ValuesResponse>(spreadsheetId, accessToken, `/values/${encodeURIComponent(range)}?${params.toString()}`);
}

async function valuesUpdate(
  spreadsheetId: string,
  accessToken: string,
  range: string,
  values: Primitive[][],
  valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED",
): Promise<void> {
  const params = new URLSearchParams({ valueInputOption });
  await sheetsRequest(spreadsheetId, accessToken, `/values/${encodeURIComponent(range)}?${params.toString()}`, {
    method: "PUT",
    body: JSON.stringify({ values }),
  });
}

async function valuesAppend(
  spreadsheetId: string,
  accessToken: string,
  range: string,
  values: Primitive[][],
  valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED",
  insertDataOption: "INSERT_ROWS" | "OVERWRITE" = "INSERT_ROWS",
): Promise<void> {
  const params = new URLSearchParams({ valueInputOption, insertDataOption });
  await sheetsRequest(spreadsheetId, accessToken, `/values/${encodeURIComponent(range)}:append?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify({ values }),
  });
}

async function valuesClear(spreadsheetId: string, accessToken: string, range: string): Promise<void> {
  await sheetsRequest(spreadsheetId, accessToken, `/values/${encodeURIComponent(range)}:clear`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

async function spreadsheetGet(spreadsheetId: string, accessToken: string, fields?: string): Promise<SheetsGetResponse> {
  const q = fields ? `?${new URLSearchParams({ fields }).toString()}` : "";
  return sheetsRequest<SheetsGetResponse>(spreadsheetId, accessToken, q);
}

async function spreadsheetBatchUpdate(
  spreadsheetId: string,
  accessToken: string,
  requests: Array<Record<string, unknown>>,
): Promise<void> {
  await sheetsRequest(spreadsheetId, accessToken, `:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  });
}

export async function getSheetRows(spreadsheetId: string, accessToken: string, range: string): Promise<string[][]> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return getLocalRows(range);
  const res = await valuesGet(spreadsheetId, accessToken, range, true);
  const rows = (res.values ?? []) as string[][];
  return rows.slice(1);
}

export function mergeSheetHeaders(current: unknown[], expected: readonly string[]): string[] {
  const next = [...current.map((value) => String(value ?? ""))];
  expected.forEach((header, index) => {
    if (!next[index]) next[index] = header;
  });
  return next;
}

export async function ensureSheetHeaders(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  expectedHeaders: readonly string[],
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return;
  const res = await valuesGet(spreadsheetId, accessToken, `${sheetName}!1:1`);
  const current = (res.values?.[0] ?? []) as unknown[];
  const merged = mergeSheetHeaders(current, expectedHeaders);
  const needsUpdate = merged.length !== current.length || merged.some((value, index) => value !== String(current[index] ?? ""));
  if (!needsUpdate) return;
  await valuesUpdate(spreadsheetId, accessToken, `${sheetName}!A1`, [merged], "RAW");
}

export async function ensureRegistroHorasHeaders(spreadsheetId: string, accessToken: string): Promise<void> {
  try {
    await ensureSheetHeaders(spreadsheetId, accessToken, SHEET_NAMES.REGISTROS_HORAS, SHEET_HEADERS.REGISTROS_HORAS);
  } catch (error) {
    console.warn("[ensureRegistroHorasHeaders] No se pudieron migrar headers; se continúa sin bloquear guardado", error);
  }
}

export async function getSheetRowsWithHeaders(spreadsheetId: string, accessToken: string, range: string): Promise<string[][]> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return getLocalRows(range);
  const res = await valuesGet(spreadsheetId, accessToken, range);
  return (res.values ?? []) as string[][];
}

export async function appendSheetRow(
  spreadsheetId: string,
  accessToken: string,
  range: string,
  values: Primitive[],
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    appendLocalRow(range, values);
    return;
  }
  await valuesAppend(spreadsheetId, accessToken, range, [values], "USER_ENTERED", "INSERT_ROWS");
}

export async function updateSheetRow(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  rowNumber: number,
  values: Primitive[],
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    updateLocalRow(sheetName, rowNumber, values);
    return;
  }
  await valuesUpdate(spreadsheetId, accessToken, `${sheetName}!A${rowNumber}`, [values], "USER_ENTERED");
}

export async function clearSheetRow(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  rowNumber: number,
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    clearLocalRow(sheetName, rowNumber);
    return;
  }
  await valuesClear(spreadsheetId, accessToken, `${sheetName}!A${rowNumber}:Z${rowNumber}`);
}

export async function validateSpreadsheet(
  spreadsheetId: string,
  accessToken: string,
): Promise<{ valid: boolean; title?: string; error?: string }> {
  try {
    if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return { valid: true, title: "Ptime Local" };
    const res = await spreadsheetGet(spreadsheetId, accessToken, "properties.title");
    return { valid: true, title: res.properties?.title ?? "Sin título" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { valid: false, error: msg };
  }
}

export async function initializeSpreadsheet(spreadsheetId: string, accessToken: string): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return;

  const headers: Record<string, readonly string[]> = {
    Registros_Horas: SHEET_HEADERS.REGISTROS_HORAS,
    Proyectos: SHEET_HEADERS.PROYECTOS,
    Clientes: SHEET_HEADERS.CLIENTES,
    Tareas: SHEET_HEADERS.TAREAS,
    Configuraciones: SHEET_HEADERS.CONFIGURACIONES,
    Usuarios: ["id", "nombre", "email", "rol", "activo", "ultimo_acceso", "sheet_id"],
    Workspace_Members: ["email", "sheet_id", "rol", "invited_by", "created_at", "updated_at"],
  };

  const meta = await spreadsheetGet(spreadsheetId, accessToken, "sheets.properties.title");
  const existentes = new Set((meta.sheets ?? []).map((s) => s.properties?.title ?? ""));

  const requests: Array<Record<string, unknown>> = [];
  const nuevas: string[] = [];

  for (const nombre of Object.keys(headers)) {
    if (!existentes.has(nombre)) {
      requests.push({ addSheet: { properties: { title: nombre } } });
      nuevas.push(nombre);
    }
  }

  if (requests.length > 0) {
    await spreadsheetBatchUpdate(spreadsheetId, accessToken, requests);
  }

  for (const [nombre, cols] of Object.entries(headers)) {
    if (nuevas.includes(nombre) || !existentes.has(nombre)) {
      await valuesUpdate(spreadsheetId, accessToken, `${nombre}!A1`, [Array.from(cols)], "RAW");
    } else {
      await ensureSheetHeaders(spreadsheetId, accessToken, nombre, cols);
    }
  }

  if (nuevas.includes("Configuraciones")) {
    const now = new Date().toISOString();
    const defaults: Primitive[][] = [
      ["precio_base_global", "35", now],
      ["precio_alto_global", "45", now],
      ["umbral_horas_global", "20", now],
      ["moneda", "USD", now],
      ["nombre_empresa", "Ptime", now],
    ];
    await valuesAppend(spreadsheetId, accessToken, "Configuraciones!A2", defaults, "RAW", "INSERT_ROWS");
  }
}
