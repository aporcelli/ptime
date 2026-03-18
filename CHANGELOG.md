# Changelog — Ptime

Todos los cambios notables del proyecto están documentados en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

---

## [1.0.0] — 2026-03-16

### 🚀 Primera versión de producción

#### Agregado
- **Auth**: NextAuth.js v5 con Google OAuth 2.0
- **Backend**: Google Sheets API v4 como base de datos (`lib/sheets/`)
- **Core Logic**: Algoritmo de precios escalonados con Vitest in-source tests (`lib/pricing/calculateHoursAmount.ts`)
- **Módulo Horas**: Formulario `HorasForm` con validación en tiempo real, preview de monto, inline creation de proyectos/tareas
- **Módulo Admin**: CRUD completo de Clientes, Proyectos, Tareas, Configuración y Usuarios
- **BI/Reportes**: Dashboard con KPIs, reportes por mes y proyecto, gráficas Recharts (BarChart, LineChart, PieChart)
- **PDF Export**: Template PDF profesional con `@react-pdf/renderer`
- **CSV Export**: Exportación con BOM en `ExportButton`
- **Componentes Shared**: `DataTable` adaptativa, `FilterBar` con URL params, `ExportButton`
- **Dark Mode**: `ThemeToggle` y `ThemeProvider` con `next-themes`
- **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS`, `Permissions-Policy`, `X-XSS-Protection`
- **Rate Limiting**: `lib/ratelimit.ts` con sliding window en memoria
- **Health Check**: `/api/health` endpoint con verificación de env vars
- **Tipos**: `types/api.ts`, `types/auth.d.ts` (NextAuth augment)
- **Hooks**: `useHours`, `useProjects`, `usePricingPreview`
- **Middleware RBAC**: Rutas `/admin/*` requieren rol `ADMIN`
- **Vercel**: `vercel.json` + `next.config.mjs` con config de producción

---

## [0.1.0] — 2026-01-01

### 🛠 Setup inicial

#### Agregado
- Scaffold Next.js 14 App Router + TypeScript + Tailwind CSS
- Shadcn/UI components
- NextAuth base configuration
- Google Sheets client singleton

---

## Guía de Deploy en Vercel

### Requisitos previos

1. Cuenta en [Vercel](https://vercel.com) (gratuita suficiente para este proyecto)
2. Repositorio Git: GitHub, GitLab o Bitbucket
3. Proyecto en Google Cloud con:
   - **OAuth 2.0 Client ID** habilitado
   - **Google Sheets API** habilitada

### Pasos

#### 1. Preparar Google Cloud

```bash
# En Google Cloud Console:
# 1. APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth 2.0 Client ID
# 2. Application type: Web application
# 3. Authorized redirect URIs:
#    https://tu-dominio.vercel.app/api/auth/callback/google
```

#### 2. Pushear el código

```bash
git add .
git commit -m "feat: release v1.0.0"
git push origin main
```

#### 3. Conectar a Vercel

```
vercel.com → Add New Project → Import Git Repository → Seleccionar ptime
```

#### 4. Configurar variables de entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agregar:

| Variable | Valor |
|----------|-------|
| `GOOGLE_CLIENT_ID` | El Client ID de OAuth |
| `GOOGLE_CLIENT_SECRET` | El Client Secret de OAuth |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` |
| `ADMIN_EMAIL` | Tu email de Google |

#### 5. Deploy

```
Vercel desplegará automáticamente al hacer push a main.
```

#### 6. Primer uso

1. Acceder a `https://tu-dominio.vercel.app/login`
2. Iniciar sesión con el email configurado en `ADMIN_EMAIL`
3. Ir a `/admin/configuracion` → conectar Google Sheet
4. ¡Listo!

---

## Verificar el deploy

```bash
# Health check
curl https://tu-dominio.vercel.app/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"...","version":"1.0.0","node":"v20.x.x","env":"production"}
```
