import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | Ptime",
  description: "Política de privacidad de Ptime — cómo manejamos tus datos personales, acceso a Google Sheets, y más.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Header */}
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Volver a Ptime
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 22 de junio de 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <p>
              En <strong>Ptime</strong> (operado por <strong>TuCloud.pro</strong>) nos tomamos tu privacidad en serio.
              Esta política describe qué datos recopilamos, cómo los usamos, y qué derechos tenés sobre ellos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              1. Datos que recopilamos
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Información de perfil de Google:</strong> nombre, correo electrónico y foto de perfil
                (a través de Google OAuth 2.0).
              </li>
              <li>
                <strong>Datos de Google Sheets:</strong> leemos y escribimos exclusivamente en la hoja de cálculo
                que vos configurás dentro de la app. No accedemos a ningún otro documento de tu Google Drive.
              </li>
              <li>
                <strong>Tokens de acceso:</strong> almacenamos un token de acceso y un refresh token de Google
                para mantener tu sesión activa. Estos tokens se guardan en tu navegador (JWT) y se renuevan automáticamente.
              </li>
              <li>
                <strong>Datos de uso anónimos:</strong> podemos recopilar métricas anónimas de rendimiento y
                errores para mejorar el servicio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              2. Cómo usamos tus datos
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Autenticarte en la aplicación.</li>
              <li>Leer y registrar horas trabajadas, proyectos, clientes y tareas en tu hoja de cálculo.</li>
              <li>Generar reportes y facturación basados en los datos que cargás.</li>
              <li>Persistir tu configuración entre sesiones y dispositivos.</li>
            </ul>
            <p className="mt-3">
              <strong>No usamos tus datos para:</strong> publicidad, venta a terceros, entrenamiento de modelos
              de IA, ni ningún propósito no relacionado con el funcionamiento de Ptime.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              3. Almacenamiento y retención
            </h2>
            <p>
              Tus datos de horas, proyectos, clientes y configuración se almacenan <strong>exclusivamente
              en tu Google Sheets</strong>. No copiamos ni almacenamos esos datos en servidores de TuCloud.pro.
            </p>
            <p className="mt-2">
              Solo retenemos tu información de sesión (nombre, email, token) mientras tu cuenta esté activa.
              Podés revocar el acceso en cualquier momento desde tu cuenta de Google en{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                myaccount.google.com/permissions
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              4. Uso limitado de datos de Google APIs
            </h2>
            <p>
              El uso que Ptime hace de la información recibida de Google APIs cumple con la{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Google API Services User Data Policy
              </a>, incluyendo los requisitos de <strong>Limited Use</strong>.
              No transferimos, vendemos ni usamos tus datos de Google Sheets para ningún propósito
              que no sea proveer el servicio que solicitaste.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              5. Protección de datos y seguridad
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Cifrado en tránsito:</strong> toda la comunicación entre tu navegador, Ptime y las APIs de Google
                se realiza mediante HTTPS con TLS 1.2 o superior. Ningún dato viaja sin cifrar.
              </li>
              <li>
                <strong>Tokens de acceso seguros:</strong> los tokens de autenticación OAuth (access token y refresh token)
                se almacenan como JWT firmados dentro de cookies con flags <code>httpOnly</code>, <code>secure</code> y
                <code>sameSite=lax</code>, lo que previene acceso desde JavaScript y ataques CSRF.
              </li>
              <li>
                <strong>Datos en Google Sheets:</strong> todos los datos de horas, proyectos, clientes y facturación
                residen exclusivamente en tu Google Sheets, protegidos por los controles de seguridad de Google Workspace
                (cifrado en reposo, control de acceso basado en tu cuenta de Google, y registro de auditoría).
                Ptime no mantiene una copia separada de estos datos en servidores propios.
              </li>
              <li>
                <strong>Acceso mínimo:</strong> Ptime solo accede a la hoja de cálculo específica que vos configurás
                durante el setup. No listamos, exploramos ni accedemos a otros documentos de tu Google Drive.
                El token de acceso se usa exclusivamente contra el spreadsheet ID que vos proveíste.
              </li>
              <li>
                <strong>Revocación inmediata:</strong> podés revocar el acceso de Ptime a tu cuenta de Google
                en cualquier momento desde{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  myaccount.google.com/permissions
                </a>. Al revocar, Ptime deja de poder leer o escribir en tu hoja de cálculo de inmediato.
              </li>
              <li>
                <strong>No almacenamos tus datos de Sheets:</strong> los únicos datos que Ptime retiene en sus
                servidores son tu información de perfil (nombre, email, foto) durante la sesión activa.
                No almacenamos, copiamos ni respaldamos el contenido de tus hojas de cálculo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              6. Terceros
            </h2>
            <p>
              No vendemos, intercambiamos ni transferimos tu información personal a terceros.
              Esto no incluye a proveedores de confianza que nos ayudan a operar el servicio
              (por ejemplo, Vercel para hosting), siempre que acepten mantener la confidencialidad
              de tus datos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              7. Tus derechos
            </h2>
            <p>Tenés derecho a:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Acceder</strong> a los datos que tenemos sobre vos.</li>
              <li><strong>Solicitar la eliminación</strong> de tu cuenta y datos asociados.</li>
              <li><strong>Revocar el acceso</strong> de Ptime a tu cuenta de Google en cualquier momento.</li>
              <li><strong>Exportar</strong> tus datos (están en tu Google Sheets — podés descargarlos directamente).</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, contactanos a{" "}
              <a
                href="mailto:adrian.porcelli@tucloud.pro"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                adrian.porcelli@tucloud.pro
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              8. Cambios en esta política
            </h2>
            <p>
              Podemos actualizar esta política periódicamente. Los cambios importantes se notificarán
              a través de la aplicación o por correo electrónico. El uso continuado de Ptime después
              de los cambios constituye aceptación de la nueva política.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              9. Contacto
            </h2>
            <p>
              Si tenés preguntas sobre esta política, escribinos a:{" "}
              <a
                href="mailto:adrian.porcelli@tucloud.pro"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                adrian.porcelli@tucloud.pro
              </a>
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ptime by TuCloud.pro</p>
        </footer>
      </div>
    </main>
  );
}
