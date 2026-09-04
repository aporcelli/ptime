# Directivas de Proyecto — Ptime (AGENTS.md)

Este repositorio contiene Ptime. Todo agente de IA (Antigravity, Pi, Claude, Codex, etc.) DEBE acatar estrictamente las siguientes instrucciones operativas.

## 🚨 Triggers Automáticos por Palabras Clave

Al detectar en el mensaje del usuario pedidos de:
- **"aplicar fix"**, **"fix"**, **"arreglar bug"**:
  1. No parchear a ciegas: investigar causa raíz y flujos completos (servicios, acciones, API, vistas UI).
  2. Implementar código y tests unitarios.
  3. Validar: `npm run test:run` y `npx tsc --noEmit`.
  4. Ejecutar el bump oficial: `npm run version:fix` (actualiza `package.json`, `package-lock.json`, `Sidebar.tsx`).
  5. Documentar en `CHANGELOG.md` con la versión nueva y fecha.
  6. Commit convencional: `git commit -m "fix(<VERSION>): <descripción>"`. NUNCA incluir "Co-Authored-By" ni menciones a IA.

- **"cambios"**, **"feature"**, **"nueva funcionalidad"**:
  1. Diseñar arquitectura limpia (Hexagonal, capas desacopladas, contenedor-presentacional).
  2. Tests unitarios.
  3. Bump oficial: `npm run version:feature`.
  4. Documentar en `CHANGELOG.md`.
  5. Commit convencional: `git commit -m "feat(<VERSION>): <descripción>"`.

- **"subir a git"**, **"subida a git"**, **"git push"**:
  1. Verificar que el working tree esté limpio y todos los tests pasen.
  2. Ejecutar `git push origin master`.
  3. **NUNCA** hacer git push si el usuario no lo pide expresamente.

- **"auditar precios"**, **"revisar cobranza"**, **"check pricing"**:
  1. Usar el script existente: `npx tsx scripts/audit-pricing.ts --month YYYY-MM`.
  2. NUNCA reescribir la lógica en scripts nuevos.
  3. Usar `--fix` ÚNICAMENTE si el usuario aprueba la escritura en el Google Sheet.

## 📐 Esquema de Versionado
Formato: `MAJOR.MINOR.FEATURE.FIX` (ej: `1.2.64.18`).
- `npm run version:fix` → sube FIX (ej: `1.2.64.18` → `1.2.64.19`).
- `npm run version:feature` → sube FEATURE y resetea FIX a 0 (ej: `1.2.64.18` → `1.2.65.0`).
- `npm run version:major` → sube MAJOR y resetea a 0 (ej: `2.0.0.0`).

## 💰 Reglas de Billing Ptime
- Umbral mensual de 20h acumuladas por usuario (global, no por proyecto).
- Base ($35/h default, redondeo cada 0.5h). Alta ($45/h default, redondeo a 1h). Cruce marginal.
- Acumulado cronológico: determinado por tupla `(fecha, created_at, id)`. Registros del mismo día se desempatan por `created_at`.
