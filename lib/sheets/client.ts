// lib/sheets/client.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cliente de Google Sheets usando el OAuth token del usuario autenticado.
// NO usa Service Account — las credenciales son del propio usuario.
// ─────────────────────────────────────────────────────────────────────────────
import { google, sheets_v4 } from "googleapis";
import { LOCAL_DEV_ACCESS_TOKEN } from "@/lib/env/dev-access";
import { appendLocalRow, clearLocalRow, getLocalRows, updateLocalRow } from "./local-store";

/**
 * Crea un cliente de Sheets autenticado con el access token del usuario.
 * Se instancia por request (no singleton) porque cada usuario tiene su token.
 */
function createSheetsClient(accessToken: string): sheets_v4.Sheets {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth });
}

// ── Helpers públicos ──────────────────────────────────────────────────────────

export async function getSheetRows(
  spreadsheetId: string,
  accessToken: string,
  range: string
): Promise<string[][]> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return getLocalRows(range);
  const sheets = createSheetsClient(accessToken);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption:    "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const rows = res.data.values ?? [];
  return rows.slice(1); // Saltar fila de encabezados
}

export async function getSheetRowsWithHeaders(
  spreadsheetId: string,
  accessToken: string,
  range: string
): Promise<string[][]> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return getLocalRows(range);
  const sheets = createSheetsClient(accessToken);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return res.data.values ?? [];
}

export async function appendSheetRow(
  spreadsheetId: string,
  accessToken: string,
  range: string,
  values: (string | number | boolean)[]
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    appendLocalRow(range, values);
    return;
  }
  const sheets = createSheetsClient(accessToken);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

export async function updateSheetRow(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  rowNumber: number,
  values: (string | number | boolean)[]
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    updateLocalRow(sheetName, rowNumber, values);
    return;
  }
  const sheets = createSheetsClient(accessToken);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range:            `${sheetName}!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function clearSheetRow(
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  rowNumber: number
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) {
    clearLocalRow(sheetName, rowNumber);
    return;
  }
  const sheets = createSheetsClient(accessToken);
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:Z${rowNumber}`,
  });
}

/**
 * Verifica que el spreadsheet existe y es accesible con el token dado.
 * Usado en el setup inicial para validar el Sheet ID.
 */
export async function validateSpreadsheet(
  spreadsheetId: string,
  accessToken: string
): Promise<{ valid: boolean; title?: string; error?: string }> {
  try {
    if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return { valid: true, title: "Ptime Local" };
    const sheets = createSheetsClient(accessToken);
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties.title",
    });
    return { valid: true, title: res.data.properties?.title ?? "Sin título" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { valid: false, error: msg };
  }
}

/**
 * Crea las 5 hojas requeridas en el spreadsheet si no existen.
 */
export async function initializeSpreadsheet(
  spreadsheetId: string,
  accessToken: string
): Promise<void> {
  if (accessToken === LOCAL_DEV_ACCESS_TOKEN) return;
  const sheets  = createSheetsClient(accessToken);
  const headers = {
    Registros_Horas: ["id","proyecto_id","tarea_id","usuario_id","fecha","horas","descripcion","precio_hora_aplicado","monto_total","estado","created_at","updated_at","cliente_id","horas_trabajadas","horas_a_cobrar"],
    Proyectos:       ["id","nombre","cliente_id","presupuesto_horas","horas_acumuladas","umbral_precio_alto","precio_base","precio_alto","estado","created_at","updated_at"],
    Clientes:        ["id","nombre","email","telefono","activo","created_at","updated_at"],
    Tareas:          ["id","nombre","categoria","activa","created_at"],
    Configuraciones: ["clave","valor","updated_at"],
    Usuarios:        ["id","nombre","email","rol","activo","ultimo_acceso","sheet_id"],
    Workspace_Members: ["email","sheet_id","rol","invited_by","created_at","updated_at"],
  };

  // Obtener hojas existentes
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
  const existentes = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title ?? ""));

  const requests: sheets_v4.Schema$Request[] = [];
  const nuevas: string[] = [];

  for (const nombre of Object.keys(headers)) {
    if (!existentes.has(nombre)) {
      requests.push({ addSheet: { properties: { title: nombre } } });
      nuevas.push(nombre);
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }

  // Escribir encabezados en hojas nuevas (o vacías)
  for (const [nombre, cols] of Object.entries(headers)) {
    if (nuevas.includes(nombre) || !existentes.has(nombre)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range:            `${nombre}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [cols] },
      });
    }
  }

  // Insertar configuración por defecto
  if (nuevas.includes("Configuraciones")) {
    const defaults = [
      ["precio_base_global",  "35",    new Date().toISOString()],
      ["precio_alto_global",  "45",    new Date().toISOString()],
      ["umbral_horas_global", "20",    new Date().toISOString()],
      ["moneda",              "USD",   new Date().toISOString()],
      ["nombre_empresa",      "Ptime", new Date().toISOString()],
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range:            "Configuraciones!A2",
      valueInputOption: "RAW",
      requestBody: { values: defaults },
    });
  }
}
