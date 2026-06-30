# Guardrails — Ptime

## ⚠️ CADA CAMBIO DE CÓDIGO — CHECKLIST OBLIGATORIO

Antes de hacer commit, verificá que estén actualizados:

```
[ ] package.json          → version bump (patch = fix, minor = feature)
[ ] package-lock.json     → npm install (sincronizado)
[ ] Sidebar.tsx           → "Ptime vX.Y.Z" (sin dev-XXXX)
[ ] CHANGELOG.md          → nueva entrada con fecha y cambios
[ ] git commit            → mensaje incluye versión: "fix(1.2.X): ..."
[ ] git push              → solo si el usuario lo pide
```

**NUNCA** commitear sin haber hecho estos 5 pasos. Si el usuario pregunta "ya actualizaste X?", la respuesta fue NO y hay que hacerlo ya.

## Versión actual: v1.2.29
