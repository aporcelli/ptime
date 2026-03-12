Actúa como un Arquitecto de Software Fullstack Senior especializado en aplicaciones SaaS. Tu objetivo es crear un "Plan de Implementación Detallado" para una aplicación llamada 'Ptime', una herramienta de gestión y carga de horas para servicios profesionales.

Stack Tecnológico Requerido:
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion (para transiciones suaves).
- UI: Shadcn/UI (para componentes accesibles y modernos).
- Backend: Next.js Server Actions para seguridad y comunicación segura.
- Integración Datos: Google Sheets API (v4).
- Autenticación/Seguridad: NextAuth.js (o Clerk) con cifrado, validación de Zod para esquemas de datos y sanitización de entradas para prevenir XSS y SQL Injection (aunque sea Sheets, el manejo debe ser riguroso).

Requerimientos del Plan:

1. Arquitectura de Datos:
   - Diseña la estructura necesaria en Google Sheets para manejar: 'Registros_Horas', 'Proyectos', 'Clientes', 'Tareas', 'Configuraciones' (precios).
   - Define el esquema de ID únicos (UUID) para cada entrada.
   - Incluye campos de auditoría ocultos (timestamps de creación/modificación).

2. Lógica de Negocio y Precios:
   - Define la lógica de cálculo: Base $35/hora, escalado a $45/hora tras superar las 20 horas acumuladas por proyecto.
   - El sistema debe manejar decimales (ej. 1.5 horas).
   - La lógica de precios debe ser inyectable desde la sección de administración.

3. Módulos de la Aplicación:
   - Módulo de Usuario: Formulario interactivo con validaciones en tiempo real.
   - Módulo Admin: Gestión de maestros (Clientes, Tareas, Costos).
   - Módulo BI/Reportes: Filtros avanzados, visualización de datos (recomienda librerías como Recharts o Tremor), y función de exportación a PDF profesional (recomienda jsPDF o React-PDF).

4. Seguridad y Buenas Prácticas:
   - Implementar CORS y manejo de variables de entorno (API Keys de Google).
   - Asegurar que la comunicación con Sheets sea por servidor (no exponer credenciales en el cliente).
   - Aplicar principios SOLID y mantener un código limpio/mantenible.

5. UX/UI:
   - Propuesta de diseño moderno (Mobile First). Define paleta de colores y tipografía que denoten profesionalismo y calidez.

Entregable:
- Estructura de carpetas propuesta.
- Diagrama de flujo de datos (descrito en texto).
- Lista de dependencias críticas.
- Guía de seguridad de 5 puntos clave.

Por favor, mantén un tono profesional, técnico y orientado a la eficiencia.