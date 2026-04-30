import { SHEET_RANGES } from "@/lib/constants";

type Row = (string | number | boolean)[];

const initialStore: Record<string, Row[]> = {
  [SHEET_RANGES.CLIENTES]: [["local-client", "Cliente Local", "local@ptime.test", "", "true", "", ""]],
  [SHEET_RANGES.PROYECTOS]: [["local-project", "Proyecto Local", "local-client", "", 0, 20, 35, 45, "activo", "", ""]],
  [SHEET_RANGES.TAREAS]: [["local-task", "Desarrollo", "General", "true", ""]],
  [SHEET_RANGES.REGISTROS_HORAS]: [],
  [SHEET_RANGES.CONFIGURACIONES]: [
    ["precio_base_global", "35", ""],
    ["precio_alto_global", "45", ""],
    ["umbral_horas_global", "20", ""],
    ["moneda", "USD", ""],
    ["nombre_empresa", "Ptime Local", ""],
  ],
  [SHEET_RANGES.WORKSPACE_MEMBERS]: [],
};

const cloneRows = (rows: Row[]) => rows.map((row) => [...row]);

const cloneStore = (source: Record<string, Row[]>) => Object.fromEntries(
  Object.entries(source).map(([range, rows]) => [range, cloneRows(rows)]),
) as Record<string, Row[]>;

const store: Record<string, Row[]> = cloneStore(initialStore);

const sheetNameToRange: Record<string, string> = {
  Clientes: SHEET_RANGES.CLIENTES,
  Proyectos: SHEET_RANGES.PROYECTOS,
  Tareas: SHEET_RANGES.TAREAS,
  Registros_Horas: SHEET_RANGES.REGISTROS_HORAS,
  Configuraciones: SHEET_RANGES.CONFIGURACIONES,
  Workspace_Members: SHEET_RANGES.WORKSPACE_MEMBERS,
};

export function getLocalRows(range: string): string[][] {
  return (store[range] ?? []).map((row) => row.map((cell) => String(cell)));
}

export function resetLocalStore(seed: Partial<Record<string, Row[]>> = {}): void {
  const next = cloneStore(initialStore);
  for (const [range, rows] of Object.entries(seed)) {
    if (rows) next[range] = cloneRows(rows);
  }

  for (const key of Object.keys(store)) delete store[key];
  Object.assign(store, next);
}

export function appendLocalRow(range: string, values: Row): void {
  store[range] = [...(store[range] ?? []), values];
}

export function updateLocalRow(sheetName: string, rowNumber: number, values: Row): void {
  const range = sheetNameToRange[sheetName];
  if (!range) return;
  const index = rowNumber - 2;
  const rows = store[range] ?? [];
  if (index >= 0 && index < rows.length) rows[index] = values;
}

export function clearLocalRow(sheetName: string, rowNumber: number): void {
  const range = sheetNameToRange[sheetName];
  if (!range) return;
  const index = rowNumber - 2;
  const rows = store[range] ?? [];
  if (index >= 0 && index < rows.length) rows.splice(index, 1);
}
