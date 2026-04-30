// scripts/migrate-reprice-abril.ts
// Reprices Abril 2026 Registros_Horas records with correct post-umbral rounding logic.
// Run with: npx tsx scripts/migrate-reprice-abril.ts

import { google } from "googleapis";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const SHEET_ID = process.env.MASTER_SHEET_ID?.replace(/"/g, "") ?? "";
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";

interface SheetRecord {
  row: number;
  id: string;
  fecha: string;
  horas: number;
  horas_trabajadas?: number;
  horas_a_cobrar?: number;
  monto_total: number;
  precio_hora_aplicado?: number;
  estado: string;
  proyecto_id: string;
  tarea_id: string;
  usuario_id: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  cliente_id: string;
}

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;
const round2 = (n: number) => Math.round(n * 100) / 100;
const roundBase = (n: number) => (n <= 0 ? 0 : round4(Math.ceil(round4(n) * 2) / 2));
const roundHigh = (n: number) => (n <= 0 ? 0 : Math.ceil(round4(n)));

function calculateHoursAmount(horasNuevas: number, horasAcumuladasMes: number, precioBase: number, precioAlto: number, umbralHoras: number) {
  const horas = round4(horasNuevas);
  const acum = round4(horasAcumuladasMes);
  const horasTrabajadasTramo1 = round4(Math.min(Math.max(umbralHoras - acum, 0), horas));
  const horasTrabajadasTramo2 = round4(Math.max(horas - horasTrabajadasTramo1, 0));
  const horasEnTramo1 = roundBase(horasTrabajadasTramo1);
  const horasEnTramo2 = roundHigh(horasTrabajadasTramo2);
  const montoTramo1 = round2(horasEnTramo1 * precioBase);
  const montoTramo2 = round2(horasEnTramo2 * precioAlto);
  const montoTotal = round2(montoTramo1 + montoTramo2);
  const precioAplicado = horasTrabajadasTramo2 > 0 || horasEnTramo2 > 0 ? precioAlto : precioBase;
  return {
    montoTotal,
    precioAplicado,
    horasTrabajadas: horas,
    horasACobrar: round4(horasEnTramo1 + horasEnTramo2),
  };
}

async function getServiceAccountToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: SERVICE_EMAIL,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");
  const signingInput = `${header}.${claim}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const sig = sign.sign(PRIVATE_KEY).toString("base64url");
  const jwt = `${signingInput}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function main() {
  console.log("=== Abril 2026 Reprice Migration ===\n");

  const token = await getServiceAccountToken();
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  const sheets = google.sheets({ version: "v4", auth });

  // Read all Registros_Horas
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Registros_Horas!A:O",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const allRows = res.data.values ?? [];
  const headers = allRows[0];
  console.log("Headers:", headers);
  console.log("Total rows:", allRows.length);

  // Find Abril records (skip header row)
  const abrilRecords: SheetRecord[] = [];
  for (let i = 1; i < allRows.length; i++) {
    const r = allRows[i];
    const fecha = r[4] ? String(r[4]) : "";
    if (!fecha.startsWith("2026-04")) continue;
    abrilRecords.push({
      row: i + 1,
      id: String(r[0] || ""),
      fecha,
      horas: Number(r[5] || 0),
      horas_trabajadas: r[13] ? Number(r[13]) : undefined,
      horas_a_cobrar: r[14] ? Number(r[14]) : undefined,
      monto_total: Number(r[8] || 0),
      precio_hora_aplicado: r[7] ? Number(r[7]) : undefined,
      estado: String(r[9] || ""),
      proyecto_id: String(r[1] || ""),
      tarea_id: String(r[2] || ""),
      usuario_id: String(r[3] || ""),
      descripcion: String(r[6] || ""),
      created_at: String(r[10] || ""),
      updated_at: String(r[11] || ""),
      cliente_id: String(r[12] || ""),
    });
  }

  // Sort chronologically
  abrilRecords.sort((a, b) => {
    const dateCmp = a.fecha.localeCompare(b.fecha);
    if (dateCmp !== 0) return dateCmp;
    return a.row - b.row;
  });

  console.log(`Found ${abrilRecords.length} Abril records\n`);
  if (abrilRecords.length > 0) {
    console.log("First record:", abrilRecords[0]);
    console.log("Last record:", abrilRecords[abrilRecords.length - 1]);
  }

  // Reprice chronologically
  const precioBase = 35;
  const precioAlto = 45;
  const umbralHoras = 20;
  let acumulado = 0;
  let totalOld = 0;
  let totalNew = 0;
  const updates: { row: number; values: (string | number)[]; record: SheetRecord; old: number; new: number }[] = [];

  for (const record of abrilRecords) {
    const calc = calculateHoursAmount(record.horas, acumulado, precioBase, precioAlto, umbralHoras);
    totalOld += record.monto_total;
    totalNew += calc.montoTotal;

    const diff = round2(calc.montoTotal - record.monto_total);
    if (Math.abs(diff) > 0.01) {
      updates.push({
        row: record.row,
        values: [
          record.id,
          record.proyecto_id,
          record.tarea_id,
          record.usuario_id,
          record.fecha,
          record.horas,
          record.descripcion,
          calc.precioAplicado,
          calc.montoTotal,
          record.estado,
          record.created_at,
          new Date().toISOString(),
          record.cliente_id,
          calc.horasTrabajadas,
          calc.horasACobrar,
        ],
        record,
        old: record.monto_total,
        new: calc.montoTotal,
      });
      console.log(
        `Row ${record.row} | ${record.fecha} | ${record.horas}h | $${record.monto_total} → $${calc.montoTotal} | ${calc.horasTrabajadas}h worked / ${calc.horasACobrar}h billable (+$${diff})`
      );
    }

    acumulado = round4(acumulado + record.horas);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total old: $${round2(totalOld)}`);
  console.log(`Total new: $${round2(totalNew)}`);
  console.log(`Difference: $${round2(totalNew - totalOld)}`);
  console.log(`Records to update: ${updates.length}`);
  console.log(`Total Abril hours worked: ${round4(acumulado)}h`);

  if (updates.length === 0) {
    console.log("\nNo updates needed.");
    return;
  }

  // Apply updates
  console.log(`\nApplying ${updates.length} updates...`);
  for (const u of updates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Registros_Horas!A${u.row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [u.values] },
    });
    console.log(`  ✓ Row ${u.row} updated`);
  }

  console.log("\nMigration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
