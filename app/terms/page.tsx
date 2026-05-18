import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio | Ptime",
  description: "Términos de servicio de Ptime — condiciones de uso, responsabilidades, y política de uso aceptable.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
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
          Términos de Servicio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 18 de mayo de 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <p>
              Bienvenido a <strong>Ptime</strong> (operado por <strong>TuCloud.pro</strong>).
              Al usar este servicio, aceptás los siguientes términos y condiciones.
              Si no estás de acuerdo, por favor no uses la aplicación.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              1. Descripción del servicio
            </h2>
            <p>
              Ptime es una herramienta de registro de horas y facturación que utiliza
              Google Sheets como base de datos. Los usuarios pueden cargar horas trabajadas,
              gestionar proyectos y clientes, y generar reportes. Toda la información se almacena
              en la hoja de cálculo que el usuario configura.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              2. Cuentas y responsabilidades
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Autenticación:</strong> usamos Google OAuth 2.0 para identificar a los usuarios.
                Sos responsable de mantener la seguridad de tu cuenta de Google.
              </li>
              <li>
                <strong>Edad mínima:</strong> debés tener al menos 13 años (o la edad mínima requerida
                en tu país) para usar este servicio.
              </li>
              <li>
                <strong>Precisión de datos:</strong> los datos que cargás en Ptime (horas, proyectos,
                clientes) son tu responsabilidad. No verificamos la exactitud de la información ingresada.
              </li>
              <li>
                <strong>Uso aceptable:</strong> aceptás no usar Ptime para actividades ilegales,
                fraudulentas, o que violen los términos de Google Workspace/Google APIs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              3. Privacidad y datos
            </h2>
            <p>
              El manejo de tus datos personales se rige por nuestra{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Política de Privacidad
              </Link>.
              Al usar Ptime, también aceptás los{" "}
              <a
                href="https://developers.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Términos de Servicio de Google APIs
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              4. Propiedad intelectual
            </h2>
            <p>
              Ptime y su código, diseño, marca y contenido son propiedad de TuCloud.pro.
              Los datos que cargás en la aplicación (horas, proyectos, clientes) siguen siendo
              de tu propiedad.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              5. Limitación de responsabilidad
            </h2>
            <p>
              Ptime se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
              TuCloud.pro no garantiza que el servicio sea ininterrumpido, libre de errores,
              o que cumpla con requisitos específicos de cada usuario.
            </p>
            <p className="mt-2">
              En ningún caso TuCloud.pro será responsable por:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Pérdida de datos (tus datos están en tu Google Sheets).</li>
              <li>Interrupciones del servicio causadas por Google, Vercel, o terceros.</li>
              <li>Daños directos o indirectos derivados del uso o la imposibilidad de usar el servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              6. Cancelación y suspensión
            </h2>
            <p>
              Podés dejar de usar Ptime en cualquier momento. Para revocar el acceso de Ptime
              a tu cuenta de Google, visitá{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                myaccount.google.com/permissions
              </a>.
            </p>
            <p className="mt-2">
              Nos reservamos el derecho de suspender o cancelar el acceso a usuarios que violen
              estos términos, sin previo aviso y sin responsabilidad.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              7. Modificaciones de los términos
            </h2>
            <p>
              Podemos modificar estos términos en cualquier momento. Los cambios se publicarán
              en esta página y, si son sustanciales, se notificarán a los usuarios por correo
              electrónico o mediante un aviso en la aplicación. El uso continuado del servicio
              después de los cambios constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              8. Legislación aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina.
              Cualquier disputa relacionada con estos términos será resuelta en los tribunales
              de la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              9. Contacto
            </h2>
            <p>
              Para consultas sobre estos términos, contactanos a:{" "}
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
