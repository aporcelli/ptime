// lib/sheets/client.ts
// ─────────────────────────────────────────────────────────────────────────────
// Singleton del cliente de Google Sheets.
// Este módulo SOLO ejecuta en servidor (Server Actions / Route Handlers).
// Las credenciales NUNCA cruzan al bundle de cliente.
// ─────────────────────────────────────────────────────────────────────────────

import { google, sheets_v4 } from "googleapis";

let _sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (_sheetsClient) return _sheetsClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "[Ptime] GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY son requeridos. " +
      "Revisa tu .env.local"
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key:  key,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  _sheetsClient = google.sheets({ version: "v4", auth });
  return _sheetsClient;
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// ── Helpers públicos ──────────────────────────────────────────────────────────

/**
 * Lee un rango del Spreadsheet y retorna filas como arrays de strings.
 * Omite la primera fila (encabezados).
 */
export async function getSheetRows(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const rows = res.data.values ?? [];
  return rows.slice(1); // Saltar encabezados
}

/**
 * Lee incluyendo encabezados (útil para validación inicial).
 */
export async function getSheetRowsWithHeaders(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return res.data.values ?? [];
}

/**
 * Agrega una nueva fila al final de la hoja.
 */
export async function appendSheetRow(
  range: string,
  values: (string | number | boolean)[]
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/**
 * Actualiza una fila específica por su número (1-indexed, incluyendo header).
 */
export async function updateSheetRow(
  sheetName: string,
  rowNumber: number,
  values: (string | number | boolean)[]
): Promise<void> {
  const sheets = getSheetsClient();
  const range = `${sheetName}!A${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/**
 * Elimina (limpia) una fila específica.
 * En Google Sheets no existe "delete row" via API values, se deja en blanco
 * o se usa batchUpdate para eliminar la fila físicamente.
 */
export async function clearSheetRow(
  sheetName: string,
  rowNumber: number
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${rowNumber}:Z${rowNumber}`,
  });
}

/**
 * Obtiene el número de la próxima fila vacía en una hoja.
 */
export async function getNextEmptyRow(sheetName: string): Promise<number> {
  const rows = await getSheetRowsWithHeaders(`${sheetName}!A:A`);
  return rows.length + 1;
}
