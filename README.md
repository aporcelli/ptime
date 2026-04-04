# Ptime - TuCloud.pro

**Ptime** es una aplicación para el registro y gestión de horas trabajadas y facturación, con Google Sheets como base de datos en tiempo real (BaaS). Optimizado para despliegues rápidos y sin fricción usando el ecosistema de Vercel y Google Workspace.

## 🚀 Características

- **Google Sheets como DB:** Usa una hoja de cálculo como backend, permitiendo a los administradores editar datos directamente o visualizar reportes crudos sin salir de Google.
- **Autenticación Segura:** NextAuth.js integrado con Google OAuth 2.0 y control de acceso basado en roles (RBAC) para proteger zonas administrativas.
- **Tarifas y Facturación Escalonada:** Algoritmo dinámico que calcula los precios de las horas basado en un umbral global mensual.
- **Módulo BI / Reportes:** Dashboard completo y exportación en formato PDF con el branding y gráficos interactivos (`react-pdf` y Recharts).
- **Gestión Administrativa Completa:** CRUD de Clientes, Proyectos, Tareas, Configuraciones y Usuarios.
- **Diseño Tonal:** Creado bajo el lenguaje visual "Meridian", un Dark/Light Mode estricto.

## 📦 Tecnologías

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/) (Radix Primitives)
- [NextAuth.js v5 (beta)](https://nextjs.authjs.dev/)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

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
   - `NEXTAUTH_URL`: `http://localhost:3000`.

### Arrancar la aplicación

```bash
npm run dev
```

La aplicación estará corriendo en `http://localhost:3000`.

## 🚢 Despliegue (Deploy)

El proyecto está preparado para desplegarse fácilmente en **Vercel**. 

Asegúrate de:
1. Importar el repositorio en Vercel.
2. Configurar las variables de entorno de producción.
3. Actualizar la URI de redirección autorizada en Google Cloud Console con el dominio de tu Vercel (ej: `https://tu-proyecto.vercel.app/api/auth/callback/google`).

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
├── components/           # Componentes de React
│   ├── admin/            # Componentes específicos de administración
│   ├── charts/           # Gráficos con Recharts
│   ├── forms/            # Formularios con react-hook-form + Zod
│   ├── layout/           # Sidebar, Topbar, Shell
│   ├── pdf/              # Plantillas para exportación PDF (react-pdf)
│   └── shared/           # Componentes reutilizables (DataTables, Botones)
├── hooks/                # Custom hooks (e.g. usePricingPreview)
├── lib/                  # Lógica de negocio y utilidades
│   ├── pricing/          # Algoritmo de cálculo de precios y unit tests
│   ├── schemas/          # Esquemas de validación Zod
│   └── sheets/           # Cliente y queries hacia la API de Google Sheets
├── public/               # Archivos estáticos y logos (e.g., logo_tucloud_white.png)
├── types/                # Definiciones de TypeScript e interfaces
├── auth.ts               # Configuración de NextAuth.js
└── middleware.ts         # Middleware para protección de rutas y control de RBAC
```
