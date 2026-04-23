# Changelog — Ptime

Todos los cambios notables del proyecto están documentados en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

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
