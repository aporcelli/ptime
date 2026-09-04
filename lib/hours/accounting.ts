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
  created_at?: string;
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
 * Suma registros del mismo mes que sean anteriores en la línea de tiempo:
 * 1. Registros con fecha estrictamente anterior (< referenceDay).
 * 2. Registros del mismo día (=== referenceDay) creados estrictamente antes
 *    (< referenceCreatedAt), permitiendo múltiples cargas en el mismo día
 *    sin perder el acumulado ni omitir saltos de tarifa.
 *
 * Evita que el tramo base/alta de un registro se calcule con horas cargadas
 * DESPUÉS de su momento (evita bugs de recálculo al editar o hacer backfills).
 */
export function getAccumulatedWorkedHoursUpTo(
  records: MonthlyWorkedHourSnapshot[],
  month: string,
  referenceDate: string,
  excludedRecordId?: string,
  referenceCreatedAt?: string,
): number {
  const referenceDay = String(referenceDate ?? "").slice(0, 10);
  return round4(
    records
      .filter((record) => record.fecha.startsWith(month))
      .filter((record) => !excludedRecordId || record.id !== excludedRecordId)
      .filter((record) => {
        const recordDay = String(record.fecha ?? "").slice(0, 10);
        if (recordDay < referenceDay) {
          return true;
        }
        if (recordDay > referenceDay) {
          return false;
        }
        // Mismo día calendario:
        // Si no se especifica timestamp de creación de referencia, mantenemos solo fechas previas
        if (!referenceCreatedAt) {
          return false;
        }
        const recordCreated = String(record.created_at ?? "");
        return recordCreated !== "" && recordCreated < referenceCreatedAt;
      })
      .reduce((sum, record) => sum + record.horas, 0),
  );
}

