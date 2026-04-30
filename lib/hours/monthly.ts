import { calculateHoursAmount } from "@/lib/pricing/calculateHoursAmount";
import type { PricingConfig, Proyecto, RegistroHoras } from "@/types/entities";

export type MonthFilter = "latest" | "previous" | "all";
export type ClientFilter = "all" | string;
type PricingSource = Pick<Proyecto, "precio_base" | "precio_alto" | "umbral_precio_alto">;

const round4 = (value: number) => Math.round(value * 10_000) / 10_000;
const round2 = (value: number) => Math.round(value * 100) / 100;

function sortMonthlyRecords(records: RegistroHoras[]) {
  return [...records].sort((a, b) => {
    const byDate = a.fecha.localeCompare(b.fecha);
    if (byDate !== 0) return byDate;
    const byCreated = (a.created_at ?? "").localeCompare(b.created_at ?? "");
    if (byCreated !== 0) return byCreated;
    return a.id.localeCompare(b.id);
  });
}

function getPricingConfigForRecord(
  record: RegistroHoras,
  pricingByProject: Record<string, PricingSource>,
  fallbackConfig: PricingConfig,
): PricingConfig {
  const pricing = pricingByProject[record.proyecto_id];
  return {
    precioBase: pricing?.precio_base ?? fallbackConfig.precioBase,
    precioAlto: pricing?.precio_alto ?? fallbackConfig.precioAlto,
    umbralHoras: pricing?.umbral_precio_alto ?? fallbackConfig.umbralHoras,
  };
}

export function repriceMonthlyRecords(
  records: RegistroHoras[],
  pricingByProject: Record<string, PricingSource>,
  fallbackConfig: PricingConfig,
): RegistroHoras[] {
  const horasTrabajadasPorMes = new Map<string, number>();

  return sortMonthlyRecords(records).map((record) => {
    const month = record.fecha.slice(0, 7);
    const acumulado = horasTrabajadasPorMes.get(month) ?? 0;
    const recalculated = calculateHoursAmount(
      record.horas_trabajadas ?? record.horas,
      acumulado,
      getPricingConfigForRecord(record, pricingByProject, fallbackConfig),
    );

    horasTrabajadasPorMes.set(month, round4(acumulado + recalculated.horasTrabajadas));

    return {
      ...record,
      horas_trabajadas: recalculated.horasTrabajadas,
      horas_a_cobrar: recalculated.horasACobrar,
      precio_hora_aplicado: recalculated.precioAplicado,
      monto_total: recalculated.montoTotal,
    };
  });
}

export function getLatestMonthWithRecords(records: Pick<RegistroHoras, "fecha">[]): string {
  return records.reduce((latest, record) => {
    const month = record.fecha.slice(0, 7);
    return month > latest ? month : latest;
  }, "");
}

export function getAdjacentMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

export function resolveMonthFilter(records: Pick<RegistroHoras, "fecha">[], filter: MonthFilter): string | null {
  if (filter === "all") return null;
  const latest = getLatestMonthWithRecords(records);
  if (!latest) return null;
  return filter === "previous" ? getAdjacentMonth(latest, -1) : latest;
}

export function getMonthFilteredRecords<T extends Pick<RegistroHoras, "fecha">>(records: T[], filter: MonthFilter): T[] {
  const month = resolveMonthFilter(records, filter);
  return month ? records.filter((record) => record.fecha.startsWith(month)) : records;
}

export function getClientFilteredRecords<T extends Pick<RegistroHoras, "cliente_id">>(records: T[], clientFilter: ClientFilter): T[] {
  if (clientFilter === "all") return records;
  return records.filter((record) => record.cliente_id === clientFilter);
}

export function getFilteredRecords<T extends Pick<RegistroHoras, "fecha" | "cliente_id">>(records: T[], monthFilter: MonthFilter, clientFilter: ClientFilter): T[] {
  return getClientFilteredRecords(getMonthFilteredRecords(records, monthFilter), clientFilter);
}

export function isInvoiceEligible(record: Pick<RegistroHoras, "estado">): boolean {
  return record.estado === "borrador" || record.estado === "confirmado";
}

export function summarizeRecords(records: Pick<RegistroHoras, "estado" | "horas" | "horas_trabajadas" | "horas_a_cobrar" | "monto_total">[]) {
  const billableRecords = records.filter((record) => record.estado !== "rechazado");
  const eligibleRecords = records.filter(isInvoiceEligible);

  const sum = (
    list: Pick<RegistroHoras, "horas" | "horas_trabajadas" | "horas_a_cobrar">[],
    selector: (record: Pick<RegistroHoras, "horas" | "horas_trabajadas" | "horas_a_cobrar">) => number | undefined,
  ) => round4(list.reduce((total, record) => total + (selector(record) ?? 0), 0));

  return {
    totalWorkedHours: sum(billableRecords, (record) => record.horas_trabajadas ?? record.horas),
    totalBillableHours: sum(billableRecords, (record) => record.horas_a_cobrar ?? record.horas),
    totalAmount: round2(billableRecords.reduce((total, record) => total + record.monto_total, 0)),
    eligibleCount: eligibleRecords.length,
    eligibleAmount: round2(eligibleRecords.reduce((total, record) => total + record.monto_total, 0)),
  };
}

export function getEligibleInvoiceRecordIds(records: RegistroHoras[], month: string, usuarioId: string): string[] {
  return records
    .filter((record) => record.usuario_id === usuarioId)
    .filter((record) => record.fecha.startsWith(month))
    .filter(isInvoiceEligible)
    .map((record) => record.id);
}

export function getMonthInvoiceSummary(records: RegistroHoras[], month: string) {
  const monthRecords = records.filter((record) => record.fecha.startsWith(month));
  const eligibleRecords = monthRecords.filter(isInvoiceEligible);

  return {
    month,
    records: monthRecords,
    eligibleRecords,
    ...summarizeRecords(monthRecords),
  };
}
