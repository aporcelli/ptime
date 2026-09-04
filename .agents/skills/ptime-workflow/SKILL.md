---
name: ptime-workflow
description: >-
  Reglas oficiales, guardrails y ciclo de vida para desarrollo en Ptime.
  Se activa automáticamente ante palabras clave como 'aplicar fix', 'fix',
  'cambios', 'subir a git', 'git push', 'auditar pricing' o 'versionado'.
---

# Ptime Workflow & Guardrails

Protocolo obligatorio para cualquier cambio, fix, feature, auditoría o subida a git en Ptime.

## 🔑 Palabras Clave y Triggers Automáticos

Cuando el usuario use estas palabras o intenciones, ejecutar AUTOMÁTICAMENTE este flujo sin saltearse pasos:

| Intención / Palabras Clave | Acción Requerida |
|---|---|
| **"aplicar fix" / "fix" / "corregir bug"** | Diagnóstico raíz → Código + Tests → `npm run test:run` & `npx tsc --noEmit` → `npm run version:fix` → `CHANGELOG.md` → Commit convencional con versión |
| **"cambios" / "feature" / "nueva funcionalidad"** | Diseño arquitectónico → Código + Tests → Verificación → `npm run version:feature` → `CHANGELOG.md` → Commit convencional |
| **"subir a git" / "subida a git" / "git push"** | Verificación de tests limpios → Verificar alineación versión/CHANGELOG → `git push origin master` |
| **"auditar pricing" / "revisar cobranza"** | Ejecutar `npm run audit:pricing -- --month YYYY-MM` → Reportar → Modificar Sheet con `--fix` **SOLO** bajo aprobación explícita |

---

## 📐 1. Esquema de Versionado (Estricto)

Formato: **`MAJOR.MINOR.FEATURE.FIX`** (ejemplo actual: `1.2.64.18`)

| Tipo | Comando de Bump | Ejemplo | Efecto |
|---|---|---|---|
| **Fix** | `npm run version:fix` | `1.2.64.18` → `1.2.64.19` | Sube FIX (+1) |
| **Feature** | `npm run version:feature` | `1.2.64.18` → `1.2.65.0` | Sube FEATURE (+1), FIX resetea a 0 |
| **Major** | `npm run version:major` | `1.2.64.18` → `2.0.0.0` | Sube MAJOR (+1), resetea todo |

*Nota*: `npm run version:*` ejecuta `scripts/bump-version.mjs`, actualizando `package.json`, `components/layout/Sidebar.tsx` y sincronizando `package-lock.json`. **NUNCA** alterar estos números a mano.

---

## 📋 2. Checklist Obligatorio Pre-Commit

Antes de hacer commit en cualquier fix o feature:

1. [ ] **Tests unitarios al 100%**: `npm run test:run` (17+ suites, todos pasando).
2. [ ] **Tipado TypeScript limpio**: `npx tsc --noEmit` (0 errores).
3. [ ] **Version Bump ejecutado**: `npm run version:fix` o `npm run version:feature`.
4. [ ] **Sidebar actualizado**: Verificado que `Sidebar.tsx` tenga `Ptime v<NUEVA_VERSION>`.
5. [ ] **Lockfile sincronizado**: `package-lock.json` alineado.
6. [ ] **CHANGELOG.md actualizado**: Entrada arriba de todo con la fecha de hoy (`YYYY-MM-DD`), versión y resumen de cambios.
7. [ ] **Conventional Commit**: Mensaje con formato `fix(<VERSION>): <resumen>` o `feat(<VERSION>): <resumen>`.
   - ⚠️ **PROHIBIDO**: Agregar `"Co-Authored-By"` o cualquier atribución de IA.

---

## 🚀 3. Subidas a Git (Push)

- **Regla de oro**: `git push` se ejecuta **ÚNICAMENTE** cuando el usuario lo solicita explícitamente (ej: *"subí a git"*, *"hacé git push"*).
- Rama principal de trabajo: `master` (`git push origin master`).
- Jamás dejar ramas o commits desincronizados con el changelog.

---

## 💰 4. Reglas de Negocio de Precios y Auditoría

- **Umbral**: 20 horas por mes por usuario (**acumulado global**, no por proyecto).
- **Tarifa Base**: Hasta 20h ($35/h default), redondeo por registro a múltiplos de **0.5h**.
- **Tarifa Alta**: Pasadas las 20h ($45/h default), redondeo por registro a **hora entera (1h)**.
- **Acumulado**: Calculado estrictamente por **posición cronológica** mediante la tupla `(fecha, created_at, id)` con `getAccumulatedWorkedHoursUpTo`.
  - Registros de días anteriores en el mes: suman siempre.
  - Registros de días posteriores: nunca suman (evita contaminación por backfill).
  - Registros del mismo día: se desempatan por `created_at` (el creado antes suma al posterior).
- **Script de Auditoría**: `scripts/audit-pricing.ts`.
  - Variables de entorno locales: `GOOGLE_WORKSPACE_PROJECT_ID=gws-ai-491712`, `PTIME_SHEET_ID=1Sz0Q0F6KID9k5TRyEQHqrTzkUIx15M-ALZ9yfxZAZWQ`.
  - `--fix` **SOLO** con consentimiento explícito del usuario.
