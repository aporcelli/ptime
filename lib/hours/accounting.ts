export interface HourProjectSnapshot {
  proyecto_id: string;
  horas: number;
}

export interface ProjectHourAdjustment {
  proyectoId: string;
  deltaHoras: number;
}

export interface MonthlyWorkedHourSnapshot {
  id?: string;
  fecha: string;
  horas: number;
}

const round4 = (value: number) => Math.round(value * 10_000) / 10_000;

export function calculateProjectHourAdjustments(oldRecord: HourProjectSnapshot, nextRecord: HourProjectSnapshot): ProjectHourAdjustment[] {
  if (oldRecord.proyecto_id === nextRecord.proyecto_id) {
    const deltaHoras = round4(nextRecord.horas - oldRecord.horas);
    return deltaHoras === 0 ? [] : [{ proyectoId: nextRecord.proyecto_id, deltaHoras }];
  }

  return [
    { proyectoId: oldRecord.proyecto_id, deltaHoras: round4(-oldRecord.horas) },
    { proyectoId: nextRecord.proyecto_id, deltaHoras: round4(nextRecord.horas) },
  ].filter((adjustment) => adjustment.deltaHoras !== 0);
}

export function applyProjectHourDelta(currentHours: number, deltaHours: number): number {
  return round4(currentHours + deltaHours);
}

export function getMonthlyWorkedHoursAccumulated(
  records: MonthlyWorkedHourSnapshot[],
  month: string,
  excludedRecordId?: string,
): number {
  return round4(
    records
      .filter((record) => record.fecha.startsWith(month))
      .filter((record) => !excludedRecordId || record.id !== excludedRecordId)
      .reduce((sum, record) => sum + record.horas, 0),
  );
}

/**
 * Acumulado mensual respetando la POSICIÓN CRONOLÓGICA del registro.
 *
 * Solo suma registros del mismo mes con fecha ESTRICTAMENTE anterior a
 * `referenceDate`. Evita que el tramo base/alta de un registro se calcule
 * con horas cargadas DESPUÉS de su fecha (bug de recálculo al editar
 * registros viejos o al hacer backfill de fechas pasadas).
 */
export function getAccumulatedWorkedHoursUpTo(
  records: MonthlyWorkedHourSnapshot[],
  month: string,
  referenceDate: string,
  excludedRecordId?: string,
): number {
  const referenceDay = String(referenceDate ?? "").slice(0, 10);
  return round4(
    records
      .filter((record) => record.fecha.startsWith(month))
      .filter((record) => !excludedRecordId || record.id !== excludedRecordId)
      .filter((record) => {
        const recordDay = String(record.fecha ?? "").slice(0, 10);
        return recordDay < referenceDay;
      })
      .reduce((sum, record) => sum + record.horas, 0),
  );
}
