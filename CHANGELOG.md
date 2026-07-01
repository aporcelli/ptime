# Changelog — Ptime

Todos los cambios notables del proyecto están documentados en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [1.2.41] — 2026-06-22

### Mejorado
- **Reubicación de Gráfico de Clientes**: El gráfico `"Horas por cliente"` fue movido justo debajo de la tabla de `"Detalle por proyecto"`. Al iniciar en la **página 2**, se aprovecha el espacio disponible de forma natural sin forzar saltos de página toscos.
- **Margen de Página Corregido**: Se restauró el `paddingBottom` de la página a `52`, eliminando el espacio en blanco tosco que quedaba al final de la primera hoja.
- **Leyenda de Horas Fija en Hoja 1**: El cartel explicativo `*` de Horas Facturables ahora se renderiza dinámicamente como un bloque absoluto únicamente en el pie de página de la hoja 1, totalmente alineado e independiente de la fluidez del contenido.

## [1.2.40] — 2026-06-22

### Corregido
- **Maquetación de PDF**: Incrementado el `paddingBottom` de la página a `95` para reservar espacio físico. Esto evita que los gráficos o tablas relativas se superpongan o encimen con la nota absoluta del pie de página de la hoja 1.

## [1.2.39] — 2026-06-22

### Mejorado
- **Nota al Pie de Página Dinámica en PDF**: La leyenda explicativa `*` ahora se renderiza dinámicamente y con la propiedad `fixed` **exclusivamente en el pie de página de la hoja 1**, justo por encima del footer fijo común. Esto evita que se repita en hojas posteriores de detalle.

## [1.2.38] — 2026-06-22

### Mejorado
- **Gráfico de Horas por Cliente en PDF**: Cambiada la métrica de ingresos (costos) a **horas**, y actualizado el título de la sección a `"Horas por cliente"`. Se eliminó la limitación de mostrar solo el Top 5 para listar **todos los clientes** activos del reporte. El alto del gráfico es ahora dinámico para evitar superposiciones.
- **Leyenda de Horas en Pie de Página**: Movida la nota `*` de Horas Facturables para que se renderice como un bloque absoluto en el pie de página de la **primera hoja**, por encima de la banda navy fija.

## [1.2.37] — 2026-06-22

### Añadido
- **Gráfico de Ingresos por Cliente en PDF**: Agregado el gráfico horizontal de ingresos por cliente en la primera hoja del PDF, imitando exactamente el look y colores degradados del reporte web.
### Corregido
- **Eliminación de Alertas**: Removida la caja de alertas de proyectos de precio alto que no se solicitó.
- **Leyenda de Horas Facturables**: Se quitó la palabra "realmente" del comentario para mayor precisión (*"...diferir de las horas trabajadas..."*).

## [1.2.36] — 2026-06-22

### Añadido
- **Horas Trabajadas y Facturables en PDF**: El reporte PDF ahora calcula y muestra tanto las horas reales trabajadas como las horas facturables en la tarjeta de resumen.
- **Leyenda explicativa**: Agregada una nota al pie en la primera página del reporte explicando las reglas de redondeo y los umbrales aplicados sobre las horas facturables.

## [1.2.35] — 2026-06-22

### Mejorado
- **Diseño del Dashboard**: Reorganizado el diseño de la primera fila en pantallas de escritorio.
  - Los **KPIs** (4 tarjetas de métricas) y el **Calendario de Actividad** ahora se muestran lado a lado (`2/3` para KPIs y `1/3` para el Calendario).
  - Reduce sustancialmente el espacio vertical ocupado y sube las tarjetas de Registros Recientes y Estado de Proyectos.
  - El Calendario de Actividad se adaptó para ser aún más compacto y elegante como widget lateral.

## [1.2.34] — 2026-06-22

### Mejorado
- **Calendario de Actividad (Heatmap)**: Reescrito completamente a un componente React/Tailwind nativo.
  - Elimina el Canvas de ECharts, resolviendo las celdas estiradas (rectangulares) en resoluciones de escritorio.
  - Cuadrados perfectos (`aspect-square`) con grid exacto de 7 columnas (Lunes a Domingo).
  - Rotulación clara de los días de la semana y los números de los días visibles.
  - Celdas de relleno para respetar los días reales del calendario según el mes.
  - Tooltip nativo interactivo con fecha y horas exactas.

## [1.2.33] — 2026-06-22

### Añadido
- **Filtro de mes en Dashboard**: Selector dinámico de mes que actualiza KPIs, heatmap y registros.
- **Soporte bilingüe en Heatmap**: Calendario de actividad adaptado automáticamente al idioma del navegador (EN/ES).

## [1.2.32] — 2026-06-22

### Añadido
- **Calendario de actividad diaria** en Dashboard: heatmap tipo GitHub con intensidad verde por horas.

## [1.2.31] — 2026-06-22

### Añadido
- **Ordenamiento en tablas admin**: Clientes, Proyectos y Tareas ahora ordenables clickeando columnas (▲/▼). Default alfabético por primera columna.

## [1.2.30] — 2026-06-22

### Corregido
- **Incógnito sin sheetId**: admins ahora obtienen `MASTER_SHEET_ID` directo del env, sin depender de `findSharedSheetForEmailEdge`.

## [1.2.29] — 2026-06-22

### Corregido
- **Token refresh con retry**: 3 intentos con 2s delay post-suspensión de equipo.

## [1.2.28] — 2026-06-22

### Corregido
- **ERR_TOO_MANY_REDIRECTS**: roto loop redirect en login cuando token expiraba.
- Login page no redirige si la sesión tiene `RefreshTokenError`.
- Middleware detecta sesión expirada y redirige a `/login?error=TokenExpired`.

## [1.2.27] — 2026-06-22

### Corregido
- **Google account chooser**: `prompt:select_account` permite elegir cuenta al hacer login.

## [1.2.26] — 2026-06-22

### Corregido
- **Judgment Day**: `updateHourAction` ahora ajusta horas de tarea al editar registro.

## [1.2.25] — 2026-06-22

### Añadido
- **Tareas acumulan horas**: campo `horas_acumuladas`, mutaciones, save-flow, deleteHour
- **TareasAdmin**: columna "Horas acum."
- **Gráfico horas por tarea**: barras horizontales en Reemplazado TareasPieChart
### Mejorado
- **Dashboard**: proyectos usan horas del mes actual, no acumuladas totales
- **Tipografía**: `font-serif` → `font-display` en todo el sitio

## [1.2.24] — 2026-06-22

### Añadido
- **Ingresos por cliente**: chart de barras horizontales en Reportes

## [1.2.23] — 2026-06-22

### Mejorado
- **Gráfico de ingresos**: reemplazada línea con barras + línea de tendencia overlay. Barras comparan mes a mes, línea muestra la tendencia general.

## [1.2.22] — 2026-06-22

### Mejorado
- **Tipografía unificada**: montos en Mis Horas y Reportes ahora usan Inter (`font-sans`) en vez de `font-serif`/`font-mono`.

## [1.2.21] — 2026-06-22

### Corregido
- **Filtro de estado en Mis Horas**: el resumen "A cobrar" ahora refleja el filtro activo (confirmado/facturado/todos).

## [1.2.20] — 2026-06-22

### Mejorado
- **Sesión extendida a 7 días** (antes 8 horas).
- **Login simplificado**: removido `prompt:consent`. Google solo pide autorizar scopes la primera vez.

## [1.2.19] — 2026-06-22

### Corregido
- **Avatar en Configuración**: usa proxy `/api/auth/avatar` (mismo que Topbar) — arregla imagen rota.
### Mejorado
- **Cliente en detalle de registro**: ahora se muestra en un box destacado con icono y tipografía más grande.

## [1.2.18] — 2026-06-22

### Corregido
- **Cliente en detalle de horas**: usaba `proyecto.cliente_id` en vez de `registro.cliente_id`. Corregido para matchear con la lista de Mis Horas.

## [1.2.16 — 1.2.17] — 2026-06-22

### Corregido
- **Avatar en Config**: revertido cambio que rompía la página con error 500.
- **Cliente en detalle**: fallback "Sin cliente asignado" cuando no hay match.

## [1.2.15] — 2026-06-22

### Mejorado
- **Detalle de horas**: ahora muestra el cliente asignado al registro.

## [1.2.12 — 1.2.14] — 2026-06-22

### Añadido
- **Landing page pública** en `/` para verificación OAuth de Google.
- **Toggle de idioma EN/ES** en el header, default inglés.
- **Fondo atmosférico** con imagen + gradient overlay oscuro.
- **Animaciones Framer Motion**: fade-up, stagger, hover effects.
- **Theme toggle** (dark/light) en el header.
- **Privacy Policy y Terms of Service en inglés** con sección de Data Protection.
### Corregido
- Middleware: `/` agregado a rutas públicas.
- Email de contacto: `info@tucloud.pro`.

---

## [1.2.11] — 2026-05-20

### 🎯 Rediseño 180° de actividad diaria + tendencia de ingresos premium

#### Corregido / Mejorado
- **Actividad diaria**: se reemplaza el heatmap tipo grilla por un visual de ritmo diario más informativo:
  - barras de horas por día,
  - línea de promedio móvil 7 días,
  - línea de objetivo diario,
  - tooltip enriquecido con horas, promedio 7d e ingresos.
- **KPIs de actividad integrados**: días activos, racha actual, promedio por día activo, pico diario con fecha.
- **Tendencia de ingresos**: visual más denso y menos vacío:
  - área con gradiente fuerte y glow en línea,
  - `markLine` de promedio,
  - `markPoint` de pico,
  - tooltip con variación vs período anterior,
  - mini-KPIs arriba del gráfico (total, promedio, tendencia, pico).
- **Ajustes de lectura ejecutiva**: ejes compactos, mejor legibilidad dark/light y mayor señal visual por panel.
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.11**; versión visible en Sidebar **v1.2.11-dev.20260520-1842**.

#### Verificación
- `next lint` en archivos tocados: OK.
- `npm run build`: OK (incluye type-check y generación de rutas).

---

## [1.2.10] — 2026-05-20

### 🛠️ Fix de build en Vercel (tipado ECharts)

#### Corregido
- **Error de tipado en `IngresosLineChart`** al construir en Vercel/TypeScript:
  - `series` en ECharts se normaliza con literales estrictos (`type: "line" as const`, `symbol: "none" as const`, `lineStyle.type: "dashed" as const`).
  - Se tipa explícitamente `series` como `NonNullable<EChartsOption["series"]>` para evitar widening a `string`.
- **Impacto**: se resuelve el fallo `Type 'string' is not assignable to type '"line"'` durante `next build`.
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.10**; versión visible en Sidebar **v1.2.10-dev.20260520-1828**.

#### Verificación
- `npm run build`: OK (compila y genera rutas correctamente).
- `next lint` archivos tocados: OK.
- `vitest`: `lib/hours/monthly.test.ts` pasando.

---

## [1.2.9] — 2026-05-20

### ⚡ Migración a Apache ECharts y dashboard iterativo (4 charts)

#### Agregado
- **Apache ECharts** integrado (`echarts`, `echarts-for-react`) como nuevo motor de visualización para Reportes.
- **Wrapper reusable** `components/charts/EChart.tsx` (SSR-safe con dynamic import).
- **Tema de gráficos centralizado** `lib/utils/echarts-theme.ts` para coherencia dark/light.
- **Nuevo 4.º gráfico**: `ActividadHeatmap` (heatmap calendario de horas por día).

#### Modificado / Mejorado
- **Tendencia de ingresos** migrada a ECharts con línea suave + área, referencia promedio y zoom interactivo.
- **Horas por proyecto** migrada a barras horizontales en ECharts (top 10, mejor lectura comparativa).
- **Distribución por tarea** migrada a donut ECharts con total central y énfasis interactivo.
- **Layout de charts** en Reportes actualizado a grid de 4 paneles para lectura ejecutiva más completa.
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.9**; versión visible en Sidebar **v1.2.9-dev.20260520-1820**.

#### Verificación
- `next lint` en archivos tocados de Reportes/Charts/UI sin warnings ni errores.
- `vitest`: `lib/hours/monthly.test.ts` pasando.

---

## [1.2.8] — 2026-05-20

### 📊 Modernización Reportes (fases 1–5): visual, filtros, charts, accesibilidad

#### Agregado
- **Tokens semánticos de charts** en `globals.css` para ambos temas (`--chart-1..6`, `--chart-grid`) y estilo reutilizable `.chart-tooltip`.
- **Semántica accesible en gráficos**: wrappers con `role="img"` + `aria-label` descriptivo para tendencia, proyectos y tareas.
- **Accesibilidad en tablas de reportes**: `caption` oculto para SR y `scope="col"` en encabezados.

#### Modificado / Mejorado
- **Dark/Light bugs corregidos en charts**: se eliminaron referencias a variables inexistentes (`--border-light`, `--text-muted`) y se migró a paleta semántica `hsl(var(--...))`.
- **Charts modernizados**:
  - Tendencia de ingresos: `ComposedChart` con área degradada + línea + referencia promedio.
  - Horas por proyecto: barras horizontales (top 8) para mejor legibilidad de nombres largos.
  - Tareas: donut con total central y leyenda enriquecida con porcentajes.
- **Filtros de Reportes rediseñados**:
  - Layout responsive por bloques.
  - Clientes/proyectos en orden alfabético.
  - Chips de filtros activos con remove individual.
  - Reseteo automático de proyecto inválido al cambiar cliente.
  - Estado `rechazado` agregado al selector.
- **Polish de interacción**:
  - Animaciones `framer-motion` en panel de filtros y acordeón PDF.
  - Botones rápidos con estado activo visible.
  - Hover/focus states refinados en cards y controles (`focus-visible`).
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.8**; versión visible en Sidebar **v1.2.8-dev.20260520-1802**.

#### Verificación
- `next lint` sobre archivos tocados de Reportes/Charts/UI sin warnings ni errores.
- `vitest`: `lib/hours/monthly.test.ts` pasando.

---

## [1.2.7] — 2026-05-20

### 🧭 Ordenamiento de carga de horas y listado en Mis Horas

#### Modificado / Mejorado
- **Carga de horas**: combos de **Clientes**, **Proyectos** y **Tareas** ordenados alfabéticamente.
- **Mis Horas (vista default)**: tabla/listado ordenado explícitamente de **fecha más reciente a más antigua**.
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.7**; versión visible en Sidebar **v1.2.7-dev.20260520-1651**.

#### Verificación
- `vitest`: `lib/hours/monthly.test.ts` pasando.
- Nota: `app/actions/hours.test.ts` mantiene falla preexistente de `revalidatePath` (no relacionada con este cambio de ordenamiento UI).

---

## [1.2.6] — 2026-05-18

### 🔐 Hardening de auth y actualización legal

#### Agregado
- **Hardening multi-tenant en `/api/horas`**: el `sheetId` del body ya no puede sobreescribir el contexto confiable (JWT/cookie).
- **Control de mismatch**: nuevo error `SHEET_CONTEXT_MISMATCH` con respuesta `403` cuando el `sheetId` enviado no coincide con el contexto autenticado.
- **Documentación legal ampliada**: `/privacy` y `/terms` reescritas con contenido completo y metadata.

#### Modificado / Mejorado
- **Resolución de contexto en páginas** (`getPageCtx`): redirecciones más precisas (`/login`, `/login?error=TokenExpired`, `/setup`).
- **Middleware API unificado**: `/api/horas` deja de bypass-ear middleware y usa validación homogénea para auth/sheet.
- **Avatar auth proxy cache**: `Cache-Control` optimizado (`private, max-age=600, stale-while-revalidate=3600`).
- **Versionado sincronizado**: `package.json` y `package-lock.json` en **v1.2.6**; versión visible en Sidebar **v1.2.6-dev.20260518-1504**.

#### Verificación
- `vitest` smoke: `lib/env/dev-access.test.ts` y `lib/utils/safe-callback-url.test.ts` pasando.

---

## [1.2.5] — 2026-04-28

### 🚀 Facturación, desarrollo local y reportes

#### Agregado
- **Modo local sin OAuth**: `LOCAL_DEV_ACCESS=true npm run dev` permite probar la app en `localhost` sin depender del callback OAuth de Google. El bypass está bloqueado por diseño en producción.
- **Facturación mensual corregida**: cálculo por usuario/mes con primeras 20h a precio base y tramo alto posterior al umbral.
- **Redondeo facturable**: en tramo base las fracciones facturan mínimo 0.5h; en tramo alto cualquier fracción redondea a hora completa.
- **Trazabilidad de horas**: se diferencian `horas_trabajadas` y `horas_a_cobrar` para no mezclar tiempo real con tiempo facturable.
- **Mis Horas mensual**: filtro por último mes, mes anterior y ver todo; totales alineados al filtro seleccionado.
- **Cierre mensual**: acción segura para marcar como `facturado` el mes seleccionado sin tocar registros rechazados o ya facturados.
- **Cotización BNA**: endpoint `/api/bna-dolar` y parser para mostrar dólar oficial venta del Banco Nación en la tarjeta “A cobrar”.
- **Tests ampliados**: cobertura Vitest para pricing, save-flow, serializers, BNA, fechas, helpers de horas, acciones y acceso local.

#### Modificado / Mejorado
- **PDF de reportes**: mejoras visuales en logos TuCloud, salto de página para `Detalle de registros`, fechas DD-MM-AA, títulos, leyendas y layout de tablas.
- **Clientes**: se permite crear clientes con emails repetidos; la identidad de cliente depende del `id`, no del email.
- **React Flight / Server Actions**: resultados y datos de Sheets se normalizan para evitar objetos no serializables, `undefined` y `NaN` en límites cliente-servidor.
- **UI estructural**: nuevos componentes de estructura/tokenización para paneles, tarjetas y estados.
- **ESLint**: `.eslintrc.json` agregado para evitar prompts interactivos en `npm run lint`.
- **Versión visible**: Sidebar, `package.json` y `package-lock.json` sincronizados en **v1.2.5**.

#### Verificación
- `npm test -- --run`: 56 tests pasando.
- `npx tsc --noEmit`: OK.
- `npm run lint`: OK con warnings no bloqueantes de imágenes/alt text.
- `npm run build`: OK.

---

## [1.2.2] — 2026-04-23

### 🚀 Refactor Mayor: Persistencia, UI/UX y Componentes

#### Agregado
- **Persistencia Cross-Device del Sheet ID**: Ahora el `auth.ts` consulta el `MASTER_SHEET_ID` durante el callback `jwt` del login para recuperar el `sheetId` del usuario automáticamente. **Ya nunca más se pide el link en una nueva sesión / navegador / dispositivo**.
- **Edge-compatible Service Account JWT**: Nuevo módulo `lib/sheets/master-edge.ts` que genera tokens RS256 vía Web Crypto API sin depender de `googleapis` (que rompía el build).
- **Glass effect**: Nueva clase `.glass` para superficies con blur, usada en login y setup.
- **Animación `slide-up`**: Nueva animación de entrada elegante.

#### Modificado / Mejorado
- **Combobox reescrito desde cero**: Reemplazo total del componente roto basado en `cmdk` por uno nativo + Radix Popover. Los dropdowns de cliente, proyecto y tarea ahora **funcionan correctamente, son clickables, soportan búsqueda y se ven bien en dark/light**.
- **Tokens Shadcn unificados** (`globals.css`): Todos los `--background`, `--card`, `--popover`, `--muted`, `--accent`, `--border`, etc. ahora se definen consistentemente en `:root` (light) y `.dark`. Removida cualquier dependencia de hardcoded `bg-ink`, `text-white`, `bg-slate-900`.
- **Sidebar**, **Topbar**, **DashboardShell**, **Login**, **Setup**: Todos migrados a tokens semánticos (`bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`). El cambio de tema dark↔light ahora es **instantáneo y consistente** en toda la app.
- **Middleware**: Prefiere el `sheetId` del JWT (persistente cross-device) y sincroniza la cookie automáticamente si está vacía.
- **`getPageCtx`** y **dashboard layout**: Igual — JWT primero, cookie como fallback.
- Versión bumpeada a **v1.2.2**.

---

## [1.2.1] — 2026-04-23

### 🚀 Correcciones Críticas y Auto-Configuración de Workspace

#### Agregado
- **Auto-Configuración de Workspace (`/setup`)**: Ahora, si un usuario ha sido invitado a un Workspace, la pantalla de Setup lo detecta automáticamente consultando el `MASTER_SHEET_ID` y le permite unirse con un solo clic.

#### Modificado
- **Dominios Permitidos**: Se agregaron los dominios `ptime.tucloud.pro` y `*.ptime.tucloud.pro` en `next.config.mjs` para garantizar el correcto funcionamiento de los Server Actions en producción.
- **Filtrado de Proyectos en Carga de Horas**: Se corrigió el error por el cual no se desplegaba la lista de proyectos después de seleccionar un cliente. Ahora se sanitizan y formatean correctamente los IDs como `String` en las consultas de `queries.ts`.
- **Reset Automático**: Al cambiar el cliente en el formulario de Horas, el campo de Proyecto se resetea automáticamente si no pertenece al nuevo cliente.

---

## [1.2.0] — 2026-04-21

### 🚀 Workspace Compartido, Deploy en Vercel y Mejoras de Auth

#### Agregado
- **Workspace Members** (`/admin/workspace`): Cualquier owner puede invitar colaboradores o viewers a su Sheet. Roles: `OWNER`, `COLABORADOR` (carga/edita horas), `VIEWER` (solo lectura). UI completa con invite, cambio de rol y remoción inline.
- **Nueva hoja `Workspace_Members`** en cada Google Sheet como base de datos de invitaciones.
- **Sheets individuales por usuario**: Cada usuario configura su propio Sheet en el Setup. `sheetId` persiste en el JWT para acceso cross-device (`auth.update()`).
- **Páginas públicas** `/privacy` y `/terms` con links desde el login — requeridas por Google para verificar la app OAuth.
- **Edición de registros de horas** (`/horas/[id]/editar`): Formulario completo de edición con recálculo de precios.
- **Campo `cliente_id`** en `Registros_Horas` — se selecciona el cliente al cargar horas; los proyectos se filtran por cliente.
- **Logo TuCloud.pro** integrado en Sidebar y PDF (header + footer de cada página).
- **Deploy Vercel + dominio** `https://ptime.tucloud.pro` con Cloudflare DNS.

#### Modificado
- **UI/UX Overhaul**: Componentes Shadcn implementados.
- **Logo TuCloud.pro más grande**: Sidebar (`h-6`), PDF header (`h-22`), PDF footer (`h-14`).
- **Dashboard** con `try/catch` — si falla la carga del Sheet redirige a `/setup` en vez de error 500.
- **Middleware**: `/privacy`, `/terms` son rutas públicas sin autenticación.
- **`getPageCtx`**: Lee `sheetId` desde cookie o JWT (cross-device).
- **Filtros rápidos** en Reportes: botones "Este mes" / "Mes pasado" + selector nativo por mes.
- **Avatar de Google** en el Topbar.
- **Versión** en Sidebar: `v1.1.0` → `v1.2.0`.
