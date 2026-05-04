# Ptime - TuCloud.pro

**Ptime** es una aplicación robusta para el registro y gestión de horas trabajadas y facturación, utilizando Google Sheets como base de datos en tiempo real (BaaS). Optimizado para despliegues rápidos y sin fricción, aprovecha el ecosistema de Vercel y Google Workspace.

## 🚀 Características Clave

- **Persistencia Cross-Device y Workspaces Compartidos**: El Sheet ID del usuario ahora persiste automáticamente vía JWT, eliminando la necesidad de reconfiguración. Los workspaces se pueden compartir, permitiendo a los propietarios invitar colaboradores o espectadores con roles definidos (`OWNER`, `COLABORADOR`, `VIEWER`). La auto-configuración de Workspaces simplifica el onboarding de nuevos miembros.
- **Google Sheets como DB:** Utiliza una hoja de cálculo como backend, permitiendo a los administradores editar datos directamente o visualizar reportes crudos sin salir de Google.
- **Autenticación Segura:** NextAuth.js integrado con Google OAuth 2.0 y control de acceso basado en roles (RBAC) para proteger zonas administrativas. Soporte para JWTs Edge-compatible.
- **Experiencia de Usuario Moderna**: Componentes Shadcn/UI reescritos y optimizados para Tailwind CSS v3 (Combobox, Popover, Card, Button, etc.). Diseño completamente migrado a tokens semánticos, ofreciendo un **Dark/Light Mode unificado, instantáneo y consistente** en toda la aplicación. Nuevos efectos "glass" y animaciones "slide-up" mejoran la interfaz.
- **Tarifas y Facturación Escalonada:** Algoritmo mensual por usuario: primeras 20h a precio base, fracciones del tramo base redondeadas a 0.5h y tramo alto redondeado a hora completa. Se guardan horas trabajadas y horas facturables por separado.
- **Mis Horas con Cierre Mensual:** Vista por último mes, mes anterior o todo. Totales de horas trabajadas, horas facturables, monto USD, conversión manual ARS/USD, cotización BNA oficial y acción segura para marcar un mes como `facturado`.
- **Módulo BI / Reportes:** Dashboard completo y exportación PDF con branding TuCloud, fechas DD-MM-AA, layouts optimizados y gráficos interactivos (`react-pdf` y Recharts).
- **Gestión Administrativa Completa:** CRUD de Clientes, Proyectos, Tareas, Configuraciones y Usuarios. Los clientes pueden compartir email si el negocio lo requiere; la identidad real sigue siendo el `id` del cliente.
- **Server Actions con Seguridad Mejorada**: Configuración de `allowedOrigins` para `ptime.tucloud.pro` y `*.ptime.tucloud.pro`, garantizando el correcto funcionamiento en producción.
- **Modo Local sin OAuth**: Para desarrollo se puede entrar en localhost sin OAuth con `LOCAL_DEV_ACCESS=true`; este bypass queda bloqueado en producción.
- **Suite de Tests**: Vitest cubre pricing, horas, serialización, BNA, acciones y helpers críticos.

## 📦 Tecnologías

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/) (Radix Primitives)
- [NextAuth.js v5 (beta)](https://nextjs.authjs.dev/)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Zod](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

## 💻 Desarrollo Local

### Prerrequisitos
- Node.js >= 20
- npm o yarn
- Una cuenta en Google Cloud Console para habilitar la API de Sheets y obtener las credenciales de OAuth.

### Configuración inicial

1. Clona este repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configura las variables en `.env`:
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Obtenidos de tu proyecto en GCP.
   - `AUTH_SECRET` (o `NEXTAUTH_SECRET`): Genera uno con `openssl rand -base64 32`.
   - `AUTH_URL` (o `NEXTAUTH_URL`): `http://localhost:3000` en desarrollo local.
   - `MASTER_SHEET_ID`: El ID de tu hoja maestra de Google Sheets (donde se gestionan los usuarios y workspaces).

### Arrancar la aplicación

```bash
npm run dev
```

La aplicación estará corriendo en `http://localhost:3000`.

### Modo local sin OAuth

Para probar en localhost sin depender del callback OAuth de Google:

```bash
LOCAL_DEV_ACCESS=true npm run dev
```

Reglas de seguridad:
- Solo funciona con `NODE_ENV !== "production"`.
- Solo funciona en `localhost` o `127.0.0.1`.
- Aunque la variable exista en Vercel/producción, el acceso local queda bloqueado.

### Verificación local

```bash
npm run test:run
npx tsc --noEmit
npm run lint
npm run build
```

`npm run test:run` usa Vitest en modo no-watch.

## 💵 Reglas de facturación

Ptime calcula costos por usuario y por mes:

- Primeras **20h mensuales**: precio base del proyecto/configuración.
- Después de **20h mensuales**: precio alto.
- En tramo base, cualquier fracción menor a 0.5h se redondea a **0.5h**.
- En tramo alto, cualquier fracción se redondea a la **siguiente hora completa**.
- `horas_trabajadas` conserva lo cargado por el usuario.
- `horas_a_cobrar` conserva lo facturable después del redondeo.

Ejemplos:

| Acumulado mensual | Nueva carga | Tramo | Horas facturables |
|---:|---:|---|---:|
| 0h | 0.1h | Base | 0.5h |
| 0h | 0.5h | Base | 0.5h |
| 19.5h | 0.5h | Base | 0.5h |
| 20h | 0.5h | Alto | 1h |
| 20h | 2.5h | Alto | 3h |

En **Mis Horas**, la vista default muestra el último mes con registros. También hay filtro de mes anterior y ver todo. La acción “Marcar mes como facturado” solo opera sobre el mes seleccionado y no toca registros rechazados ni ya facturados.

## 🚢 Despliegue (Deploy)

El proyecto está preparado para desplegarse fácilmente en **Vercel**.

Asegúrate de:
1. Importar el repositorio en Vercel.
2. Configurar las variables de entorno de producción (incluyendo `MASTER_SHEET_ID`).
3. Actualizar la URI de redirección autorizada en Google Cloud Console con el dominio de tu Vercel (ej: `https://tu-proyecto.vercel.app/api/auth/callback/google` o `https://ptime.tucloud.pro/api/auth/callback/google` si usas el dominio oficial).
4. Configurar variables de Auth en Vercel para producción:
   - `AUTH_SECRET` (recomendado) y opcionalmente `NEXTAUTH_SECRET` por compatibilidad.
   - `AUTH_URL` (o `NEXTAUTH_URL`) exactamente con el dominio productivo canónico (`https://ptime.tucloud.pro`).
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en el environment Production.
5. Asegurarte que los `allowedOrigins` en `next.config.mjs` incluyan tu dominio de producción para Server Actions.

Para más detalles, revisa el [CHANGELOG.md](./CHANGELOG.md).

## 📄 Licencia y Autores

Propiedad intelectual y desarrollo bajo [TuCloud.pro](https://tucloud.pro).

## 📁 Estructura del Proyecto

Esta es la organización principal de los directorios de Ptime (Next.js 14 App Router):

```text
.
├── app/                  # Rutas y páginas de Next.js (App Router)
│   ├── (auth)/           # Rutas de autenticación (login)
│   ├── (dashboard)/      # Vistas protegidas (panel, horas, reportes, admin)
│   ├── actions/          # Server Actions para mutaciones (CRUD)
│   └── api/              # Endpoints API (health, auth, bna-dolar)
├── components/           # Componentes de React (Shadcn/UI reescritos)
│   ├── admin/            # Componentes específicos de administración
│   ├── charts/           # Gráficos con Recharts
│   ├── forms/            # Formularios con react-hook-form + Zod
│   ├── layout/           # Sidebar, Topbar, Shell (migrados a tokens semánticos)
│   ├── pdf/              # Plantillas para exportación PDF (react-pdf)
│   └── shared/           # Componentes reutilizables (DataTables, Botones)
├── hooks/                # Custom hooks (e.g. usePricingPreview)
├── lib/                  # Lógica de negocio y utilidades
│   ├── actions/          # Helpers comunes para Server Actions
│   ├── env/              # Modo local sin OAuth y guards de entorno
│   ├── hours/            # Save-flow, accounting, mensualización y moneda
│   ├── pricing/          # Algoritmo de cálculo de precios y unit tests
│   ├── schemas/          # Esquemas de validación Zod
│   ├── sheets/           # Cliente, queries, mutations y serializers Google Sheets
│   └── utils/            # Utilidades generales y formateo
├── public/               # Archivos estáticos y logos (e.g., logo_tucloud_white.png)
├── types/                # Definiciones de TypeScript e interfaces
├── auth.ts               # Configuración de NextAuth.js (integración con MASTER_SHEET_ID)
└── middleware.ts         # Middleware para protección de rutas y control de RBAC (usa JWT para sheetId)
