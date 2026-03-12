# Ptime — Gestión de Horas Profesionales

Aplicación SaaS para la gestión y carga de horas en servicios profesionales, construida con Next.js 14, TypeScript y Google Sheets como backend.

## Stack

- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
- **UI**: Shadcn/UI (Radix UI)
- **Backend**: Next.js Server Actions
- **Datos**: Google Sheets API v4
- **Auth**: NextAuth.js v5
- **Validación**: Zod
- **Tests**: Vitest

## Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Google Sheets

1. Crear un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar la **Google Sheets API**
3. Crear una **Service Account** con rol Editor
4. Descargar las credenciales JSON
5. Crear un nuevo Google Spreadsheet con estas 5 hojas:
   - `Registros_Horas`
   - `Proyectos`
   - `Clientes`
   - `Tareas`
   - `Configuraciones`
6. Compartir el Spreadsheet con el email de la Service Account

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`
- `NEXTAUTH_SECRET` (generar con `openssl rand -base64 32`)
- `ADMIN_EMAIL`

### 4. Inicializar Shadcn/UI

```bash
npx shadcn@latest init
npx shadcn@latest add button input form select table badge card dialog toast
```

### 5. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura de Google Sheets

### Encabezados requeridos (fila 1 de cada hoja)

**Registros_Horas**: `id | proyecto_id | tarea_id | usuario_id | fecha | horas | descripcion | precio_hora_aplicado | monto_total | estado | created_at | updated_at`

**Proyectos**: `id | nombre | cliente_id | presupuesto_horas | horas_acumuladas | umbral_precio_alto | precio_base | precio_alto | estado | created_at | updated_at`

**Clientes**: `id | nombre | email | telefono | activo | created_at | updated_at`

**Tareas**: `id | nombre | categoria | activa | created_at`

**Configuraciones**: `clave | valor | updated_at`

### Datos iniciales de Configuraciones

| clave | valor |
|-------|-------|
| precio_base_global | 35 |
| precio_alto_global | 45 |
| umbral_horas_global | 20 |
| moneda | USD |
| nombre_empresa | Ptime |

## Lógica de Precios

- Tramo 1: **$35/h** hasta las primeras 20 horas acumuladas por proyecto
- Tramo 2: **$45/h** a partir de la hora 20.01 en adelante
- Los precios son configurables globalmente y por proyecto desde el Admin
- Se admiten decimales (ej. 1.5h, 0.25h)

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run test     # Tests unitarios (Vitest)
npm run lint     # ESLint
```

## Seguridad

- Las credenciales de Google NUNCA se exponen al cliente
- Toda comunicación con Sheets ocurre en Server Actions (server-side)
- Validación doble con Zod (cliente + servidor)
- Sanitización XSS con DOMPurify
- Sesiones HttpOnly + JWT con NextAuth v5
- RBAC: rutas `/admin/*` requieren rol `ADMIN`

## Créditos

Arquitectura diseñada siguiendo principios SOLID. Código limpio y mantenible.
