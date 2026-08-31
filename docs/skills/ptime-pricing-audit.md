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
- Los registros del mismo día que el de referencia NO cuentan en su acumulado.

## Errores históricos conocidos (no repetir)

1. **Separar por proyecto**: el umbral es GLOBAL por usuario/mes, nunca por proyecto.
2. **Usar acumulado histórico total del proyecto** (134–139h): todo queda a tarifa alta.
3. **Usar todo el mes al editar un registro viejo**: bug v1.2.64.x que re-preciaba
   registros del 05-08 con el acumulado del 07-08 (fix: `getAccumulatedWorkedHoursUpTo`).
4. **`hasPersistedBilling`**: `repriceMonthlyRecords` respeta registros con
   `horas_trabajadas`, `horas_a_cobrar` y `monto_total > 0` persistidos — no los recalcula.

## Cómo auditar un mes (procedimiento)

1. Leer `Registros_Horas!A:O` y `Proyectos!A:J` del sheet oficial.
2. El sheet oficial es `ptime_db`:
   - Spreadsheet ID: `PTIME_SHEET_ID_PLACEHOLDER`
   - Acceso: `gws` autenticado como `owner@example.com`
   - Env: `GOOGLE_WORKSPACE_PROJECT_ID=PTIME_GWS_PROJECT_PLACEHOLDER`
   - Comando: `gws sheets +read --spreadsheet <ID> --range "Registros_Horas!A:O" --format json`
3. Filtrar registros del mes (`fecha.startsWith("YYYY-MM")`).
4. Ordenar por `created_at` (orden real de carga) o por fecha.
5. Para cada registro, acumular globalmente (todos los proyectos juntos) y aplicar:
   - `t1 = min(max(20 - acumulado_previo, 0), horas)`
   - `t2 = horas - t1`
   - `h1 = ceil(t1 * 2) / 2` (base, redondeo 0.5)
   - `h2 = ceil(t2)` (alta, redondeo 1h)
   - `monto = h1 × base + h2 × alta`
   - tarifa aplicada = alta si `t2 > 0`, si no base
6. Comparar con columnas del sheet: `H` (applied_hourly_rate), `I` (total_amount),
   `N` (worked_hours), `O` (billable_hours).
7. Los registros con `updated_at != created_at` fueron EDITADOS — revisar si la
   edición recalculó con posición correcta.

## Columnas de Registros_Horas

```
A=id, B=project_id, C=task_id, D=user_id, E=date, F=hours,
G=description, H=applied_hourly_rate, I=total_amount, J=status,
K=created_at, L=updated_at, M=client_id, N=worked_hours, O=billable_hours
```

## Archivos clave del código

- `lib/hours/accounting.ts` — `getAccumulatedWorkedHoursUpTo` (acumulado por fecha)
- `lib/pricing/calculateHoursAmount.ts` — cálculo marginal base/alta con redondeos
- `lib/hours/save-flow.ts` — creación de registro
- `app/actions/hours.ts` + `app/api/horas/route.ts` — edición (recalcula solo si cambian proyecto/fecha/horas)
- `lib/hours/monthly.ts` — `repriceMonthlyRecords` (respeta `hasPersistedBilling`)

## Cómo corregir un registro en el sheet

Usar `gws sheets spreadsheets values update`:

```bash
export GOOGLE_WORKSPACE_PROJECT_ID=PTIME_GWS_PROJECT_PLACEHOLDER
gws sheets spreadsheets values update \
  --params '{"spreadsheetId":"PTIME_SHEET_ID_PLACEHOLDER","range":"Registros_Horas!H<FILA>","valueInputOption":"USER_ENTERED"}' \
  --json '{"values":[[35]]}' --format json
```

Actualizar SOLO las celdas necesarias (H rate, I monto, O billable, L updated_at).
**Pedir aprobación al usuario antes de escribir en el sheet.**

## Referencia del caso real (agosto 2026)

- 89h cargadas → 95h facturables (redondeos alta) → $4,075.00
- Base: 20h × $35 = $700 · Alta: 75h × $45 = $3,375
- Registro corregido: 05-08 Impl (2h → rate 35, billable 2, monto $70)
- Registro corregido: 06-08 Admin (monto $97.50 → $107.50)
