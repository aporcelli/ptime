# Guardrails — Ptime

## ⚠️ CADA CAMBIO DE CÓDIGO — CHECKLIST OBLIGATORIO

Antes de hacer commit, verificá que estén actualizados:

```
[ ] package.json          → version bump (SI es fix/feature. NO para docs, reorg, cleanup)
[ ] package-lock.json     → npm install (sincronizado)
[ ] Sidebar.tsx           → "Ptime vX.Y.Z"
[ ] CHANGELOG.md          → nueva entrada con fecha y cambios
[ ] git commit            → mensaje incluye versión si hubo bump
[ ] git push              → solo si el usuario lo pide
```

**NUNCA** commitear sin haber hecho estos pasos si el cambio es funcional.
**NO** bumpear versión para: docs, reorganización, limpieza, formateo.

---

## 📐 Esquema de versionado (OBLIGATORIO)

Formato: **`MAJOR.MINOR.FEATURE.FIX`** — ejemplo: `1.2.64.13`

| Tipo de cambio | Qué sube | Ejemplo |
|---|---|---|
| **Feature** (funcionalidad nueva) | FEATURE, resetea FIX a 0 | `1.2.64.13` → `1.2.65.0` |
| **Fix** (corrección de bug) | FIX | `1.2.64.13` → `1.2.64.14` |
| **Major** (breaking, incompatible) | MAJOR, resetea todo | `1.2.x` → `2.0.0.0` |

**REGLAS CRÍTICAS:**
- Un **fix NUNCA sube FEATURE** — siempre FIX. Los fixes consecutivos son `1.2.64.14`, `1.2.64.15`, `1.2.64.16`...
- Un **feature NUNCA hereda** el FIX viejo — `1.2.65.0`, nunca `1.2.65.6`
- Respetá el patrón de Agy: numeración continua y coherente, sin saltos de segmento.

**USAR EL SCRIPT AUTOMATIZADO (no hacer el bump a mano):**
```bash
npm run version:feature   # feature nueva → 1.2.X.0
npm run version:fix       # fix → 1.2.X.(+1)
npm run version:major     # breaking → 2.0.0.0
```
El script actualiza `package.json`, `Sidebar.tsx` y sincroniza el lockfile.
Después: agregá la entrada en `CHANGELOG.md` con la nueva versión.

---

## 🔑 Triggers Automáticos por Palabras Clave

Cuando el usuario use estas palabras clave, tomar siempre y en forma automática estas reglas:

- **"aplicar fix" / "fix" / "arreglar bug"**:
  1. Investigar causa raíz en toda la cadena (servicios, acciones, API, vistas UI).
  2. Implementar código y tests unitarios.
  3. `npm run test:run` y `npx tsc --noEmit`.
  4. `npm run version:fix` (actualiza `package.json`, `package-lock.json`, `Sidebar.tsx`).
  5. Entrada nueva en `CHANGELOG.md` con fecha y versión.
  6. Git commit: `git commit -m "fix(<VERSION>): <resumen>"` (sin Co-Authored-By).

- **"cambios" / "feature"**:
  1. Diseño limpio y tests.
  2. `npm run version:feature`.
  3. Entrada en `CHANGELOG.md`.
  4. Git commit: `git commit -m "feat(<VERSION>): <resumen>"`.

- **"subir a git" / "git push"**:
  1. Verificar tests y sincronización de versión/CHANGELOG.
  2. `git push origin master`.
  3. NUNCA hacer push sin pedido explícito del usuario.

---

## Versión actual: v1.2.64.19

