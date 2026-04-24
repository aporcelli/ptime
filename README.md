# Ptime - TuCloud.pro

**Ptime** es una aplicación robusta para el registro y gestión de horas trabajadas y facturación, utilizando Google Sheets como base de datos en tiempo real (BaaS). Optimizado para despliegues rápidos y sin fricción, aprovecha el ecosistema de Vercel y Google Workspace.

## 🚀 Características Clave

- **Persistencia Cross-Device y Workspaces Compartidos**: El Sheet ID del usuario ahora persiste automáticamente vía JWT, eliminando la necesidad de reconfiguración. Los workspaces se pueden compartir, permitiendo a los propietarios invitar colaboradores o espectadores con roles definidos (`OWNER`, `COLABORADOR`, `VIEWER`). La auto-configuración de Workspaces simplifica el onboarding de nuevos miembros.
- **Google Sheets como DB:** Utiliza una hoja de cálculo como backend, permitiendo a los administradores editar datos directamente o visualizar reportes crudos sin salir de Google.
- **Autenticación Segura:** NextAuth.js integrado con Google OAuth 2.0 y control de acceso basado en roles (RBAC) para proteger zonas administrativas. Soporte para JWTs Edge-compatible.
- **Experiencia de Usuario Moderna**: Componentes Shadcn/UI reescritos y optimizados para Tailwind CSS v3 (Combobox, Popover, Card, Button, etc.). Diseño completamente migrado a tokens semánticos, ofreciendo un **Dark/Light Mode unificado, instantáneo y consistente** en toda la aplicación. Nuevos efectos "glass" y animaciones "slide-up" mejoran la interfaz.
- **Tarifas y Facturación Escalonada:** Algoritmo dinámico que calcula los precios de las horas basado en un umbral global mensual.
- **Módulo BI / Reportes:** Dashboard completo y exportación en formato PDF con el branding y gráficos interactivos (`react-pdf` y Recharts).
- **Gestión Administrativa Completa:** CRUD de Clientes, Proyectos, Tareas, Configuraciones y Usuarios, con mejora en el filtrado y reseteo automático de proyectos en la carga de horas. Soporte para edición de registros de horas existentes.
- **Server Actions con Seguridad Mejorada**: Configuración de `allowedOrigins` para `ptime.tucloud.pro` y `*.ptime.tucloud.pro`, garantizando el correcto funcionamiento en producción.

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
   - `NEXTAUTH_SECRET`: Genera uno con `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: `http://localhost:3000` (para desarrollo local).
   - `MASTER_SHEET_ID`: El ID de tu hoja maestra de Google Sheets (donde se gestionan los usuarios y workspaces).

### Arrancar la aplicación

```bash
npm run dev
```

La aplicación estará corriendo en `http://localhost:3000`.

## 🚢 Despliegue (Deploy)

El proyecto está preparado para desplegarse fácilmente en **Vercel**.

Asegúrate de:
1. Importar el repositorio en Vercel.
2. Configurar las variables de entorno de producción (incluyendo `MASTER_SHEET_ID`).
3. Actualizar la URI de redirección autorizada en Google Cloud Console con el dominio de tu Vercel (ej: `https://tu-proyecto.vercel.app/api/auth/callback/google` o `https://ptime.tucloud.pro/api/auth/callback/google` si usas el dominio oficial).
4. Asegurarte que los `allowedOrigins` en `next.config.mjs` incluyan tu dominio de producción para Server Actions.

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
│   └── api/              # Endpoints API (health, auth)
├── components/           # Componentes de React (Shadcn/UI reescritos)
│   ├── admin/            # Componentes específicos de administración
│   ├── charts/           # Gráficos con Recharts
│   ├── forms/            # Formularios con react-hook-form + Zod
│   ├── layout/           # Sidebar, Topbar, Shell (migrados a tokens semánticos)
│   ├── pdf/              # Plantillas para exportación PDF (react-pdf)
│   └── shared/           # Componentes reutilizables (DataTables, Botones)
├── hooks/                # Custom hooks (e.g. usePricingPreview)
├── lib/                  # Lógica de negocio y utilidades
│   ├── pricing/          # Algoritmo de cálculo de precios y unit tests
│   ├── schemas/          # Esquemas de validación Zod
│   ├── sheets/           # Cliente y queries hacia la API de Google Sheets (incluye master-edge.ts)
│   └── utils/            # Utilidades generales
├── public/               # Archivos estáticos y logos (e.g., logo_tucloud_white.png)
├── types/                # Definiciones de TypeScript e interfaces
├── auth.ts               # Configuración de NextAuth.js (integración con MASTER_SHEET_ID)
└── middleware.ts         # Middleware para protección de rutas y control de RBAC (usa JWT para sheetId)
