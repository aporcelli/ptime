#!/usr/bin/env npx tsx
/**
 * scripts/audit-pricing.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auditoría de pricing de Ptime — LÓGICA OFICIAL (no aplicar criterio propio).
 *
 * Uso:
 *   npx tsx scripts/audit-pricing.ts                     # mes actual
 *   npx tsx scripts/audit-pricing.ts --month 2026-08     # mes específico
 *   npx tsx scripts/audit-pricing.ts --month 2026-08 --user tu@email.com
 *   npx tsx scripts/audit-pricing.ts --month 2026-08 --dry-run   # solo reporte
 *   npx tsx scripts/audit-pricing.ts --month 2026-08 --fix       # corrige en el sheet
 *
 * Requisitos:
 *   - gws autenticado con la cuenta del workspace (gws auth status)
 *   - GOOGLE_WORKSPACE_PROJECT_ID en el entorno (project de GWS con acceso al sheet)
 *   - Acceso al sheet ptime_db (spreadsheet ID hardcodeado abajo)
 *
 * LÓGICA DE NEGOCIO (única y oficial):
 *   - Umbral: 20h por MES por USUARIO (acumulado GLOBAL, no por proyecto)
 *   - Hasta 20h: tarifa BASE ($35), redondeo de cada registro a 0.5h (ceil)
 *   - Superadas 20h: tarifa ALTA ($45), redondeo a hora entera (ceil)
 *   - Cruce de umbral: parte base redondea a 0.5, excedente a 1h
 *   - Acumulado de un registro = suma de horas de registros del mismo mes
 *     con fecha ESTRICTAMENTE anterior a la suya (posición cronológica)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { execSync } from "child_process";

// ── Configuración ────────────────────────────────────────────────────────────
const SHEET_ID = process.env.PTIME_SHEET_ID ?? "";
const PROJECT_ID = process.env.GOOGLE_WORKSPACE_PROJECT_ID ?? "";

if (!SHEET_ID || !PROJECT_ID) {
  console.error("Faltan variables de entorno:");
  console.error("  PTIME_SHEET_ID=<spreadsheet id>");
  console.error("  GOOGLE_WORKSPACE_PROJECT_ID=<gws project id>");
  console.error("Copialas de tu entorno local (NO hardcodear en el repo).");
  process.exit(1);
}
const TAB_REGISTROS = "Registros_Horas";
const TAB_PROYECTOS = "Proyectos";

// Precios por defecto (si no hay config por proyecto)
const DEFAULT_BASE = 35;
const DEFAULT_ALTA = 45;
const UMBRAL = 20;

// ── Helpers numéricos (idénticos a lib/pricing/calculateHoursAmount.ts) ─────
const round4 = (n: number) => Math.round(n * 10_000) / 10_000;
const round2 = (n: number) => Math.round(n * 100) / 100;
const roundBase = (n: number) => (n <= 0 ? 0 : round4(Math.ceil(round4(n) * 2) / 2));
const roundHigh = (n: number) => (n <= 0 ? 0 : Math.ceil(round4(n)));

// ── Acceso al sheet vía gws ──────────────────────────────────────────────────
function gwsRead(range: string): string[][] {
  const cmd = `gws sheets +read --spreadsheet ${SHEET_ID} --range "${range}" --format json`;
  const out = execSync(cmd, {
    encoding: "utf8",
    env: { ...process.env, GOOGLE_WORKSPACE_PROJECT_ID: PROJECT_ID },
  });
  const parsed = JSON.parse(out);
  return (parsed.values ?? []) as string[][];
}

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Registro {
  row: number;
  id: string;
  proyecto_id: string;
  usuario_id: string;
  fecha: string;
  horas: number;
  rate: number;
  monto: number;
  estado: string;
  created_at: string;
  updated_at: string;
  worked: number;
  billable: number;
}

interface Proyecto {
  id: string;
  base: number;
  alta: number;
}

// ── Parsers ──────────────────────────────────────────────────────────────────
function parseRegistros(rows: string[][]): Registro[] {
  return rows.slice(1).filter((r) => r[0]).map((r, i) => ({
    row: i + 2, // +1 header +1 index
    id: String(r[0] ?? ""),
    proyecto_id: String(r[1] ?? ""),
    usuario_id: String(r[3] ?? ""),
    fecha: String(r[4] ?? ""),
    horas: Number(r[5] ?? 0),
    rate: Number(r[7] ?? 0),
    monto: Number(r[8] ?? 0),
    estado: String(r[9] ?? ""),
    created_at: String(r[10] ?? ""),
    updated_at: String(r[11] ?? ""),
    worked: Number(r[13] ?? r[5] ?? 0),
    billable: Number(r[14] ?? r[5] ?? 0),
  }));
}

function parseProyectos(rows: string[][]): Map<string, Proyecto> {
  const map = new Map<string, Proyecto>();
  for (const r of rows.slice(1)) {
    if (!r[0]) continue;
    map.set(String(r[0]), {
      id: String(r[0]),
      base: Number(r[6] || DEFAULT_BASE),
      alta: Number(r[7] || DEFAULT_ALTA),
    });
  }
  return map;
}

// ── Cálculo oficial de un registro ───────────────────────────────────────────
function calcular(horas: number, acumuladoPrevio: number, base: number, alta: number) {
  const h = round4(horas);
  const acum = round4(acumuladoPrevio);
  const t1 = round4(Math.min(Math.max(UMBRAL - acum, 0), h)); // horas en tramo base
  const t2 = round4(Math.max(h - t1, 0));                      // horas en tramo alta
  const h1 = roundBase(t1);                                    // redondeo 0.5
  const h2 = roundHigh(t2);                                    // redondeo 1h
  const m1 = round2(h1 * base);
  const m2 = round2(h2 * alta);
  return {
    t1, t2, h1, h2, m1, m2,
    monto: round2(m1 + m2),
    rate: t2 > 0 || h2 > 0 ? alta : base,
    billable: round4(h1 + h2),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const monthIdx = args.findIndex((a) => a.startsWith("--month"));
  const monthArg = monthIdx >= 0
    ? (args[monthIdx].split("=")[1] ?? args[monthIdx + 1])
    : undefined;
  const userIdx = args.findIndex((a) => a.startsWith("--user"));
  const userArg = userIdx >= 0
    ? (args[userIdx].split("=")[1] ?? args[userIdx + 1])
    : undefined;
  const doFix = args.includes("--fix");
  const dryRun = args.includes("--dry-run");

  const now = new Date();
  const month = monthArg ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  console.log(`\n🔍 Auditoría de pricing — Ptime`);
  console.log(`   Mes: ${month}`);
  console.log(`   Usuario: ${userArg ?? "todos"}`);
  console.log(`   Modo: ${doFix ? "FIX (escribe en el sheet)" : dryRun ? "dry-run (solo reporte)" : "reporte"}\n`);

  const registros = parseRegistros(gwsRead(`${TAB_REGISTROS}!A:O`));
  const proyectos = parseProyectos(gwsRead(`${TAB_PROYECTOS}!A:J`));

  const delMes = registros
    .filter((r) => r.fecha.startsWith(month))
    .filter((r) => !userArg || r.usuario_id.toLowerCase() === userArg.toLowerCase())
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  if (delMes.length === 0) {
    console.log("⚠️  No hay registros para ese mes/usuario.");
    return;
  }

  // Acumulado global por usuario (todos los proyectos juntos)
  const acumuladoPorUsuario = new Map<string, number>();
  const issues: Array<{ reg: Registro; esperado: ReturnType<typeof calcular>; campo: string[] }> = [];
  let totalCargadas = 0, totalFacturables = 0, totalEsperado = 0, totalSheet = 0;
  let hBase = 0, hAlta = 0;

  for (const reg of delMes) {
    const base = proyectos.get(reg.proyecto_id)?.base ?? DEFAULT_BASE;
    const alta = proyectos.get(reg.proyecto_id)?.alta ?? DEFAULT_ALTA;
    const acum = acumuladoPorUsuario.get(reg.usuario_id) ?? 0;
    const esperado = calcular(reg.horas, acum, base, alta);

    acumuladoPorUsuario.set(reg.usuario_id, round4(acum + reg.horas));
    totalCargadas = round4(totalCargadas + reg.horas);
    totalFacturables = round4(totalFacturables + esperado.billable);
    totalEsperado = round2(totalEsperado + esperado.monto);
    totalSheet = round2(totalSheet + reg.monto);
    hBase = round4(hBase + esperado.h1);
    hAlta = round4(hAlta + esperado.h2);

    const campos = [] as string[];
    if (Math.abs(reg.rate - esperado.rate) > 0.001) campos.push("H(rate)");
    if (Math.abs(reg.monto - esperado.monto) > 0.005) campos.push("I(monto)");
    if (Math.abs(reg.billable - esperado.billable) > 0.0001) campos.push("O(billable)");
    if (campos.length) issues.push({ reg, esperado, campo: campos });
  }

  // ── Reporte totales ──
  console.log("── Totales del mes ──────────────────────────────────────");
  console.log(`   Horas cargadas:    ${totalCargadas} h`);
  console.log(`   Horas facturables: ${totalFacturables} h  (base ${hBase} + alta ${hAlta})`);
  console.log(`   Monto esperado:    $${totalEsperado}`);
  console.log(`   Monto en sheet:    $${totalSheet}`);
  console.log(`   Diferencia:        ${totalSheet >= totalEsperado ? "+" : ""}${round2(totalSheet - totalEsperado)}\n`);

  // ── Reporte inconsistencias ──
  if (issues.length === 0) {
    console.log("✅ Sin inconsistencias. Todos los registros cierran con la lógica oficial.\n");
  } else {
    console.log(`⚠️  ${issues.length} registro(s) con inconsistencias:\n`);
    for (const { reg, esperado, campo } of issues) {
      console.log(`  Fila ${reg.row} | ${reg.fecha} | id ${reg.id.slice(0, 8)}…`);
      console.log(`     sheet:    rate=${reg.rate} monto=${reg.monto} billable=${reg.billable}`);
      console.log(`     esperado: rate=${esperado.rate} monto=${esperado.monto} billable=${esperado.billable}  ← ${campo.join(", ")}`);
      console.log(`     (acum previo ${round4((acumuladoPorUsuario.get(reg.usuario_id) ?? 0) - reg.horas)} → t1=${esperado.t1} h1=${esperado.h1}×${proyectos.get(reg.proyecto_id)?.base ?? DEFAULT_BASE} + t2=${esperado.t2} h2=${esperado.h2}×${proyectos.get(reg.proyecto_id)?.alta ?? DEFAULT_ALTA})`);
      console.log("");
    }
  }

  // ── Fix ──
  if (issues.length > 0 && (doFix || dryRun)) {
    for (const { reg, esperado } of issues) {
      if (dryRun) {
        console.log(`  [dry-run] fila ${reg.row}: H=${reg.rate}→${esperado.rate} I=${reg.monto}→${esperado.monto} O=${reg.billable}→${esperado.billable}`);
        continue;
      }
      const now = new Date().toISOString();
      const cells: Array<[string, number | string]> = [];
      if (Math.abs(reg.rate - esperado.rate) > 0.001) cells.push(["H", esperado.rate]);
      if (Math.abs(reg.monto - esperado.monto) > 0.005) cells.push(["I", esperado.monto]);
      if (Math.abs(reg.billable - esperado.billable) > 0.0001) cells.push(["O", esperado.billable]);
      cells.push(["L", now]);

      for (const [col, val] of cells) {
        const range = `${TAB_REGISTROS}!${col}${reg.row}`;
        const params = JSON.stringify({ spreadsheetId: SHEET_ID, range, valueInputOption: "USER_ENTERED" });
        const body = JSON.stringify({ values: [[val]] });
        execSync(
          `gws sheets spreadsheets values update --params ${JSON.stringify(params)} --json ${JSON.stringify(body)} --format json`,
          { encoding: "utf8", env: { ...process.env, GOOGLE_WORKSPACE_PROJECT_ID: PROJECT_ID } },
        );
      }
      console.log(`  ✅ fila ${reg.row}: corregido (${cells.map(([c, v]) => `${c}=${v}`).join(", ")})`);
    }
    if (doFix) console.log("\nFix aplicado. Volvé a correr sin --fix para verificar.");
  }

  if (issues.length > 0 && !doFix && !dryRun) {
    console.log("💡 Para corregir: npx tsx scripts/audit-pricing.ts --month <MES> --fix  (requiere aprobación del usuario)\n");
  }
}

main();
