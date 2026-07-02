// app/privacy/page.tsx — Privacy Policy with Bilingual Toggle (EN / ES)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Locale = "en" | "es";

export default function PrivacyPage() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ptime-locale") as Locale | null;
    if (saved === "en" || saved === "es") {
      setLocale(saved);
    }
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLocale(lang);
    localStorage.setItem("ptime-locale", lang);
    localStorage.setItem("landing-locale", lang);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Header & Toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {locale === "en" ? "← Back to Ptime" : "← Volver a Ptime"}
          </Link>

          <div className="flex items-center gap-1.5 p-1 bg-muted/50 border border-border rounded-xl">
            <button
              onClick={() => changeLanguage("en")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                locale === "en"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("es")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                locale === "es"
                  ? "bg-emerald-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {locale === "en" ? (
          // ── ENGLISH PRIVACY POLICY ──
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: June 22, 2026
            </p>

            <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
              <section>
                <p>
                  At <strong>Ptime</strong> (operated by <strong>TuCloud.pro</strong>) we take your privacy seriously.
                  This policy describes what data we collect, how we use it, and what rights you have over it.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Data we collect
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Google Profile Information:</strong> name, email address, and profile picture
                    (via Google OAuth 2.0).
                  </li>
                  <li>
                    <strong>Google Sheets Data:</strong> we read from and write to exclusively the spreadsheet
                    you configure within the app. We do not access any other documents in your Google Drive.
                  </li>
                  <li>
                    <strong>Access Tokens:</strong> we store a Google access token and refresh token
                    to keep your session active. These tokens are stored in your browser (JWT) and renewed automatically.
                  </li>
                  <li>
                    <strong>Anonymous Usage Data:</strong> we may collect anonymous performance and
                    error metrics to improve the service.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. How we use your data
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Authenticate you in the application.</li>
                  <li>Read and record hours worked, projects, clients, and tasks in your spreadsheet.</li>
                  <li>Generate reports and invoicing based on the data you enter.</li>
                  <li>Persist your configuration across sessions and devices.</li>
                </ul>
                <p className="mt-3">
                  <strong>We do NOT use your data for:</strong> advertising, sale to third parties, AI model training,
                  or any purpose unrelated to the operation of Ptime.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. Storage and retention
                </h2>
                <p>
                  Your hours, projects, clients, and configuration data are stored <strong>exclusively
                  in your Google Sheets</strong>. We do not copy or store this data on TuCloud.pro servers.
                </p>
                <p className="mt-2">
                  We only retain your session information (name, email, token) while your account is active.
                  You can revoke access at any time from your Google account at{" "}
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
                  4. Limited use of Google API data
                </h2>
                <p>
                  Ptime&apos;s use of information received from Google APIs complies with the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Google API Services User Data Policy
                  </a>, including the <strong>Limited Use</strong> requirements.
                  We do not transfer, sell, or use your Google Sheets data for any purpose
                  other than providing the service you requested.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Data protection and security
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Encryption in transit:</strong> all communication between your browser, Ptime, and Google APIs
                    is conducted over HTTPS with TLS 1.2 or higher. No data travels unencrypted.
                  </li>
                  <li>
                    <strong>Secure access tokens:</strong> OAuth authentication tokens (access token and refresh token)
                    are stored as signed JWTs within cookies with <code>httpOnly</code>, <code>secure</code>, and
                    <code>sameSite=lax</code> flags, preventing JavaScript access and CSRF attacks.
                  </li>
                  <li>
                    <strong>Data at rest in Google Sheets:</strong> all hours, project, client, and invoicing data
                    reside exclusively in your Google Sheets, protected by Google Workspace security controls.
                  </li>
                  <li>
                    <strong>Minimal Access & drive.file:</strong> Ptime operates strictly under the Google Drive File (<code>drive.file</code>) scope. We only access the specific spreadsheet you configure during setup or let Ptime create for you. We cannot see, browse, or edit any other documents in your Google Drive.
                  </li>
                  <li>
                    <strong>Collaborator Sharing & Sovereignty:</strong> Ptime uses each user&apos;s personal Google account. For collaborators to read/write, the spreadsheet owner must manually grant them &quot;Editor&quot; access in Google Drive. This enforces total sovereignty over data access.
                  </li>
                  <li>
                    <strong>Immediate revocation:</strong> you can revoke Ptime&apos;s access to your Google account
                    at any time from{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      myaccount.google.com/permissions
                    </a>. Upon revocation, Ptime immediately loses the ability to read from or write to your spreadsheet.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Third parties
                </h2>
                <p>
                  We do not sell, trade, or transfer your personal information to third parties.
                  This does not include trusted providers who assist us in operating the service
                  (e.g., Vercel for hosting), provided they agree to keep your data confidential.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  7. Your rights
                </h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong>Access</strong> the data we hold about you.</li>
                  <li><strong>Request deletion</strong> of your account and associated data.</li>
                  <li><strong>Revoke access</strong> of Ptime to your Google account at any time.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  8. Contact
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, you can contact us at{" "}
                  <a
                    href="mailto:info@tucloud.pro"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    info@tucloud.pro
                  </a>.
                </p>
              </section>
            </div>
          </div>
        ) : (
          // ── SPANISH PRIVACY POLICY ──
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Política de Privacidad
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Última actualización: 22 de junio de 2026
            </p>

            <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
              <section>
                <p>
                  En <strong>Ptime</strong> (operado por <strong>TuCloud.pro</strong>) nos tomamos muy en serio tu privacidad.
                  Esta política describe qué datos recopilamos, cómo los usamos y qué derechos tenés sobre ellos.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Datos que recopilamos
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Información del perfil de Google:</strong> nombre, dirección de correo electrónico y foto de perfil
                    (a través de Google OAuth 2.0).
                  </li>
                  <li>
                    <strong>Datos de Google Sheets:</strong> leemos y escribimos exclusivamente en la planilla
                    que configures dentro de la aplicación. No accedemos a ningún otro documento en tu Google Drive.
                  </li>
                  <li>
                    <strong>Tokens de acceso:</strong> almacenamos un token de acceso y un token de actualización de Google
                    para mantener tu sesión activa de forma segura. Se guardan en cookies seguras (JWT).
                  </li>
                  <li>
                    <strong>Datos de uso anónimos:</strong> podemos recopilar métricas de rendimiento y
                    errores anónimos para mejorar el servicio.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. Cómo usamos tus datos
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Autenticarte en la aplicación de forma segura.</li>
                  <li>Leer y registrar horas trabajadas, proyectos, clientes y tareas en tu planilla.</li>
                  <li>Generar reportes y facturación basados en los datos que ingreses.</li>
                  <li>Persistir tu configuración de forma multidispositivo.</li>
                </ul>
                <p className="mt-3">
                  <strong>NO usamos tus datos para:</strong> publicidad, venta a terceros, entrenamiento de modelos de IA,
                  o cualquier propósito ajeno a la operación de Ptime.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. Almacenamiento y retención
                </h2>
                <p>
                  Tus horas, proyectos, clientes y configuraciones se almacenan <strong>exclusivamente
                  en tu Google Sheets</strong>. No copiamos ni guardamos estos datos en los servidores de TuCloud.pro.
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
                  4. Uso limitado de datos de APIs de Google
                </h2>
                <p>
                  El uso que Ptime hace de la información recibida de las APIs de Google cumple con la{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Política de Datos del Usuario de los Servicios de las APIs de Google
                  </a>, incluidos los requisitos de <strong>Uso Limitado</strong>. No transferimos, vendemos ni usamos tus datos para ningún fin que no sea proveer el servicio solicitado.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Protección de datos y seguridad
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Encriptación en tránsito:</strong> toda comunicación entre tu navegador, Ptime y las APIs de Google
                    se realiza de forma segura mediante HTTPS (TLS 1.2 o superior).
                  </li>
                  <li>
                    <strong>Tokens de acceso seguros:</strong> los tokens de OAuth se almacenan como JWT firmados
                    en cookies con las directivas <code>httpOnly</code>, <code>secure</code> y <code>sameSite=lax</code>.
                  </li>
                  <li>
                    <strong>Datos en reposo en Google Sheets:</strong> todos tus datos residen exclusivamente en tus planillas de Google Sheets, protegidos por los controles de seguridad nativos de Google Workspace.
                  </li>
                  <li>
                    <strong>Acceso Mínimo y drive.file:</strong> Ptime opera bajo el alcance seguro Google Drive File (<code>drive.file</code>). Solo accedemos a la planilla que configures o que Ptime cree por vos. No podemos listar, leer ni editar ningún otro archivo de tu Google Drive.
                  </li>
                  <li>
                    <strong>Compartido de Colaboradores y Soberanía:</strong> Ptime utiliza la cuenta de Google personal de cada colaborador. Para que un colaborador cargue horas, el dueño de la planilla debe compartirle el archivo en Google Drive con rol de &quot;Editor&quot;. Esto garantiza que vos mantengas el control total.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Terceros
                </h2>
                <p>
                  No vendemos, comercializamos ni transferimos tu información personal a terceros.
                  Esto no incluye a proveedores de confianza que nos asisten en operar el servicio
                  (como Vercel para el hosting), siempre que acuerden mantener la confidencialidad.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  7. Tus derechos
                </h2>
                <p>Tenés derecho a:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong>Acceder</strong> a los datos de perfil que tenemos sobre vos.</li>
                  <li><strong>Solicitar la eliminación</strong> de tu cuenta y datos asociados.</li>
                  <li><strong>Revocar el acceso</strong> de Ptime a tu cuenta de Google en cualquier momento.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  8. Contacto
                </h2>
                <p>
                  Si tenés alguna pregunta sobre esta Política de Privacidad, podés escribirnos a{" "}
                  <a
                    href="mailto:info@tucloud.pro"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    info@tucloud.pro
                  </a>.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
