# Postmortem: incidente guardado de horas en producción (`/api/horas`)

Fecha cierre: 2026-05-06
Estado: Resuelto
Severidad: Alta (bloqueo de operación core)

## 1) Resumen ejecutivo
Durante ~1 semana, el guardado/actualización de horas falló en producción con errores 500 intermitentes y síntomas mezclados:
- Fase A: respuestas HTML 500 de Next (`nextExport:true`) en fallback API.
- Fase B: respuestas JSON 500 del handler PUT (`Error al actualizar`).

El problema final (causa raíz de la Fase B) fue incompatibilidad ESM/CJS en Node 24 (Vercel) por dependencias transitivas cargadas al importar módulos server:
- `isomorphic-dompurify` (vía `lib/utils/sanitize.ts`) -> `html-encoding-sniffer` -> `@exodus/bytes/encoding-lite.js`.

Además, hubo una causa previa distinta (Fase A): despliegues/runtimes con comportamiento de static export detectado por `nextExport:true`.

## 2) Impacto
- Usuarios no podían guardar/editar horas en producción.
- Alto costo operativo por múltiples iteraciones de deploy sin señal diagnóstica suficientemente fina al inicio.

## 3) Síntomas observados

### 3.1 Síntoma histórico (Fase A)
- `PUT /api/horas` devolvía HTML 500.
- `rawBody` incluía `__NEXT_DATA__.nextExport:true`.
- Headers observados en pruebas puntuales:
  - `x-matched-path: /500`
  - `x-next-error-status:500`

### 3.2 Síntoma final previo al fix (Fase B)
Con `?debug=1` en UI fallback:
```json
{
  "source": "api-fallback",
  "status": 500,
  "payload": {
    "success": false,
    "error": "Error al actualizar",
    "debugCode": "PUT_IMPORT_SANITIZE",
    "debugMessage": "require() of ES Module ... @exodus/bytes/encoding-lite.js ..."
  },
  "staticExportDetected": false
}
```

## 4) Línea de tiempo técnica (resumida)
1. Se añadió fallback cliente `HorasForm -> /api/horas` para sortear fallos RSC transport y exponer debug en UI.
2. Se instrumentó detección `staticExportDetected` al parsear `rawBody` HTML.
3. Se agregaron guardas de build en `package.json`:
   - `prebuild`: bloquear envs que fuerzan export estático.
   - `postbuild`: fallar si falta artefacto server `.next/server/app/api/horas/route.js`.
4. Se refactorizó `app/api/horas/route.ts` a lazy imports para evitar crash en import-time global.
5. Error pasó de HTML 500 a JSON 500 (mejor señal).
6. Se agregó stage-debug en PUT (`debugCode`, `debugMessage`).
7. Stage indicó `PUT_IMPORT_SHEETS` -> se reemplazó `lib/sheets/client.ts` (googleapis) por cliente fetch REST.
8. Persistió 500 pero cambió a `PUT_IMPORT_SANITIZE`.
9. Se reemplazó `lib/utils/sanitize.ts` (isomorphic-dompurify) por sanitizer server-safe sin DOM/jsdom.
10. Operación de guardado quedó funcional en producción.

## 5) Causas raíz

### Causa raíz final (confirmada)
Incompatibilidad ESM/CJS en runtime Node 24 de Vercel al importar librerías con cadena transitive dependency no compatible:
- `isomorphic-dompurify` en entorno server de API route.

### Causa contribuyente previa
Despliegues con comportamiento de static export (`nextExport:true`) que devolvían HTML de error en lugar de JSON del handler.

## 6) Cambios definitivos aplicados

### 6.1 Reemplazo cliente Sheets
Archivo: `lib/sheets/client.ts`
- Antes: `googleapis`.
- Después: cliente propio con `fetch` contra Google Sheets API v4 (`values.get/update/append/clear`, `spreadsheets.get`, `batchUpdate`).
- Beneficio: elimina superficie de choque ESM/CJS en runtime serverless Node 24.

### 6.2 Reemplazo sanitizer
Archivo: `lib/utils/sanitize.ts`
- Antes: `isomorphic-dompurify`.
- Después: sanitizer textual server-safe:
  - elimina tags HTML,
  - elimina chars de control,
  - colapsa whitespace.
- Beneficio: evita dependencias DOM/jsdom en API route.

### 6.3 Observabilidad de runtime
Archivo: `app/api/horas/route.ts`
- `debugCode` por etapa de PUT.
- `debugMessage` en status 500.
- Permitió aislar módulo exacto que rompía en producción.

### 6.4 Guardas de build anti-regresión
Archivo: `package.json`
- `engines.node = 24.x`
- `prebuild` anti-export env
- `postbuild` valida artefacto server de `/api/horas`

## 7) Validación de resolución
Criterios de aceptación usados:
1. Build ID actualizado visible en Sidebar tras deploy.
2. `?debug=1` sin `PUT_IMPORT_*` error.
3. Guardado/edición de horas exitoso en producción.
4. Sin `staticExportDetected` en la ruta crítica.

Resultado: Cumplido.

## 8) Lecciones aprendidas
1. En incidentes de runtime serverless, exponer `debugCode` por etapa reduce drásticamente tiempo de diagnóstico.
2. Evitar dependencias “isomorphic” en API routes Node si arrastran árbol DOM/jsdom.
3. Para integraciones Google Sheets en server actions/routes, `fetch` REST explícito puede ser más estable que SDK pesado en entornos edge/serverless.
4. Separar fallas por clases de síntoma (HTML 500 de plataforma vs JSON 500 de lógica app) evita mezclar causas.

## 9) Playbook anti-regresión

### 9.1 Checklist antes de deploy
- [ ] `next lint` en archivos tocados
- [ ] endpoint `/api/horas` sigue exportado como `runtime=nodejs` + `dynamic=force-dynamic`
- [ ] `prebuild` no detecta envs de static export
- [ ] `postbuild` confirma artefacto `.next/server/app/api/horas/route.js`

### 9.2 Checklist post deploy
- [ ] validar build ID en UI
- [ ] prueba real guardar/editar hora
- [ ] si falla: capturar payload completo de `?debug=1`

### 9.3 Regla de diseño
- Mantener módulos importados por API routes libres de dependencias DOM/browser-only.

## 10) Archivos clave afectados
- `app/api/horas/route.ts`
- `components/forms/HorasForm.tsx`
- `app/(dashboard)/horas/nuevo/page.tsx`
- `app/(dashboard)/horas/[id]/editar/page.tsx`
- `lib/sheets/client.ts`
- `lib/utils/sanitize.ts`
- `middleware.ts`
- `package.json`
- `components/layout/Sidebar.tsx`

## 11) Estado de deuda técnica
- Opcional recomendado: limitar `debugMessage` a entorno no productivo o detrás de flag admin para minimizar exposición de detalles internos.
