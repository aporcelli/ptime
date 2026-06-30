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

## Versión actual: v1.2.29
