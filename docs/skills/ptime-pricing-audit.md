---
name: ptime-pricing-audit
description: >-
  Audita montos, horas y costos en Ptime usando la lógica de precios oficial.
  Úsalo cuando el usuario pregunte por costos, montos, horas facturables,
  redondeos, umbral de tarifa, recálculos de registros, o inconsistencias
  entre el sheet y los reportes de Ptime. También para verificar que un
  registro creado o editado quedó bien precificado.
---

# Ptime Pricing Audit

Lógica de negocio de precios de Ptime y cómo auditar registros contra ella.
**NO aplicar criterio propio: usar SIEMPRE esta lógica.**

## 🚀 LO PRIMERO: ejecutar el script de auditoría

**NO generar código nuevo ni recalcular en Python.** El script oficial ya
existe y hace todo el trabajo:

```bash
cd /home/porche/git-repos/ptime
export GOOGLE_WORKSPACE_PROJECT_ID=<GWS_PROJECT_ID>   # del entorno local, NO del repo
export PTIME_SHEET_ID=<SPREADSHEET_ID>                # del entorno local, NO del repo

# Reporte del mes actual
npx tsx scripts/audit-pricing.ts

# Mes específico (acepta --month YYYY-MM o --month=YYYY-MM)
npx tsx scripts/audit-pricing.ts --month 2026-08

# Filtrar por usuario
npx tsx scripts/audit-pricing.ts --month 2026-08 --user tu@email.com

# Solo reportar qué se corregiría (sin escribir)
npx tsx scripts/audit-pricing.ts --month 2026-08 --dry-run

# Corregir en el sheet (SOLO con aprobación explícita del usuario)
npx tsx scripts/audit-pricing.ts --month 2026-08 --fix
```

También disponible como: `npm run audit:pricing -- --month 2026-08`

**Los valores reales de `PTIME_SHEET_ID` y `GOOGLE_WORKSPACE_PROJECT_ID`
viven en el entorno local del usuario (shell profile, .env local, o como el
usuario los tenga configurados). NUNCA hardcodearlos ni commitearlos.**

El script lee `Registros_Horas!A:O` y `Proyectos!A:J` vía gws, calcula con la
lógica oficial (posición cronológica) y reporta:
- Totales: horas cargadas, horas facturables (base + alta), monto esperado vs sheet
- Inconsistencias: fila, id, valores actuales vs esperados, desglose del cálculo
- Modo `--fix`: corrige solo las celdas necesarias (H rate, I monto, O billable, L updated_at)

**El script SOLO escribe con `--fix`, y eso exige aprobación del usuario antes.**

## Regla de negocio (única y oficial)

- **Umbral: 20 horas por MES por USUARIO** (acumulado GLOBAL, no por proyecto).
- **Hasta 20h acumuladas**: tarifa BASE ($35/h por defecto), redondeo de cada
  registro a múltiplos de **0.5h** (ceil: 1.3h → 1.5h).
- **Superadas las 20h**: tarifa ALTA ($45/h), redondeo de cada registro a
  **hora entera** (ceil: 1.5h → 2h, 0.5h → 1h).
- **Cruce de umbral dentro de un registro**: la parte que cabe en las 20h se
  paga a base (redondeo 0.5), el excedente a alta (redondeo 1h).

### Ejemplo oficial (dado por el dueño)
Acumulado 19h + registro de 2.5h:
- De 19h a 20h → 1h en base (redondeo 0.5) = 1h × 35 = $35
- De 20h a 21.5h → 1.5h en alta, redondeo a 1h → 2h × 45 = $90
- Total = $125

## El acumulado se calcula por POSICIÓN CRONOLÓGICA

El acumulado previo de un registro = **suma de horas de los registros del
mismo mes con fecha ESTRICTAMENTE anterior a la fecha del registro**
(ver `getAccumulatedWorkedHoursUpTo` en `lib/hours/accounting.ts`).

- **NO** es la suma de todo el mes (eso rompe la lógica al editar registros viejos).
- **NO** es el acumulado histórico total del proyecto.
- **Mismo día**: se desempatan por orden cronológico de creación (`created_at`). El registro creado antes suma al posterior; el registro posterior nunca suma al anterior.

## Errores históricos conocidos (no repetir)

1. **Separar por proyecto**: el umbral es GLOBAL por usuario/mes, nunca por proyecto.
2. **Usar acumulado histórico total del proyecto** (134–139h): todo queda a tarifa alta.
3. **Usar todo el mes al editar un registro viejo**: bug v1.2.64.x que re-preciaba
   registros del 05-08 con el acumulado del 07-08 (fix v1.2.65.6: `getAccumulatedWorkedHoursUpTo`).
4. **`hasPersistedBilling`**: `repriceMonthlyRecords` respeta registros con
   `horas_trabajadas`, `horas_a_cobrar` y `monto_total > 0` persistidos — no los recalcula.

## Datos del sheet (para referencia / escritura manual)

- Sheet oficial: **ptime_db** — los valores de spreadsheet ID y project ID se
  obtienen del entorno local (ver sección de uso arriba). NO están en el repo.
- Acceso: `gws` autenticado con la cuenta del workspace.
- Comando lectura: `gws sheets +read --spreadsheet <ID> --range "Registros_Horas!A:O" --format json`
- Comando escritura: `gws sheets spreadsheets values update --params '{"spreadsheetId":"<ID>","range":"Registros_Horas!H<FILA>","valueInputOption":"USER_ENTERED"}' --json '{"values":[[35]]}' --format json`

## Columnas de Registros_Horas

```
A=id, B=project_id, C=task_id, D=user_id, E=date, F=hours,
G=description, H=applied_hourly_rate, I=total_amount, J=status,
K=created_at, L=updated_at, M=client_id, N=worked_hours, O=billable_hours
```

## Archivos clave del código

- `scripts/audit-pricing.ts` — script oficial de auditoría (usar SIEMPRE primero)
- `lib/hours/accounting.ts` — `getAccumulatedWorkedHoursUpTo` (acumulado por fecha)
- `lib/pricing/calculateHoursAmount.ts` — cálculo marginal base/alta con redondeos
- `lib/hours/save-flow.ts` — creación de registro
- `app/actions/hours.ts` + `app/api/horas/route.ts` — edición (recalcula solo si cambian proyecto/fecha/horas)
- `lib/hours/monthly.ts` — `repriceMonthlyRecords` (respeta `hasPersistedBilling`)

## Referencia del caso real (agosto 2026)

- 89h cargadas → 95h facturables (redondeos alta) → $4,075.00
- Base: 20h × $35 = $700 · Alta: 75h × $45 = $3,375
- Meses verificados sin inconsistencias: abril, mayo, junio, julio, agosto 2026
