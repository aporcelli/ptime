// app/terms/page.tsx — Terms of Service with Bilingual Toggle (EN / ES)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Locale = "en" | "es";

export default function TermsPage() {
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
          // ── ENGLISH TERMS OF SERVICE ──
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: June 22, 2026
            </p>

            <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
              <section>
                <p>
                  Welcome to <strong>Ptime</strong> (operated by <strong>TuCloud.pro</strong>).
                  By using this service, you agree to the following terms and conditions.
                  If you do not agree, please do not use the application.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Service description
                </h2>
                <p>
                  Ptime is a time-tracking and invoicing tool that uses
                  Google Sheets as its database. Users can log hours worked,
                  manage projects and clients, and generate reports. All information is stored
                  exclusively in the spreadsheet that the user configures or creates.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. Database & Data Sovereignty
                </h2>
                <p>
                  Because Ptime utilizes a &quot;bring-your-own-database&quot; architecture, you retain full ownership and control of your data:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Sovereign Storage</strong>: All hours, tasks, clients, and projects reside entirely in your Google Sheets database in your Google Drive. Ptime does not store your logs on external databases.</li>
                  <li><strong>Google Drive permissions</strong>: Ptime uses the secure `drive.file` scope. It can only read and write to sheets created by Ptime or explicitly chosen by you. We have no visibility over any other documents.</li>
                  <li><strong>Collaborator onboarding</strong>: For collaborators or team members to register hours, you must manually share your Google Sheet with them in Google Drive granting them &apos;Editor&apos; access. This ensures that only you control who accesses your data.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. Accounts and responsibilities
                </h2>
                <p>
                  To use Ptime, you must authenticate via Google OAuth 2.0. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1.5 mt-2">
                  <li>The security of your Google account credentials.</li>
                  <li>The accuracy of the data registered in your spreadsheet.</li>
                  <li>Maintaining correct sharing permissions in Google Drive.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  4. Acceptable use
                </h2>
                <p>
                  You agree to use Ptime only for lawful purposes. You shall not attempt to reverse engineer, disrupt, or bypass the service security controls.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Limitation of liability
                </h2>
                <p>
                  Ptime is provided &quot;as is&quot; without warranties of any kind. Since all data resides in your Google Sheets, TuCloud.pro is not liable for data loss, accidental sheet deletion, or API rate-limit service interruptions caused by Google.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Changes to terms
                </h2>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of Ptime after changes are posted constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  7. Contact
                </h2>
                <p>
                  If you have any questions about these Terms of Service, contact us at{" "}
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
          // ── SPANISH TERMS OF SERVICE ──
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Términos de Servicio
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Última actualización: 22 de junio de 2026
            </p>

            <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
              <section>
                <p>
                  Bienvenido a <strong>Ptime</strong> (operado por <strong>TuCloud.pro</strong>).
                  Al utilizar este servicio, aceptás los siguientes términos y condiciones.
                  Si no estás de acuerdo, por favor no utilices la aplicación.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Descripción del servicio
                </h2>
                <p>
                  Ptime es una herramienta de registro de horas y facturación que utiliza
                  Google Sheets como base de datos. Los usuarios pueden registrar horas,
                  gestionar proyectos y clientes, y generar reportes. Toda la información se almacena
                  exclusivamente en la planilla que el usuario configure o cree.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. Base de datos y Soberanía de Datos
                </h2>
                <p>
                  Dado que Ptime utiliza una arquitectura de &quot;trae tu propia base de datos&quot;, vos conservás el control y la propiedad absoluta de tu información:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Almacenamiento Soberano</strong>: Todas las horas, tareas, clientes y proyectos residen íntegramente en tu Google Sheets dentro de tu Google Drive. Ptime no copia ni almacena tus registros en bases de datos externas.</li>
                  <li><strong>Permisos de Google Drive</strong>: Ptime utiliza el alcance seguro `drive.file`. Solo lee y escribe en planillas creadas por Ptime o explícitamente elegidas por vos. No tenemos visibilidad sobre ningún otro documento.</li>
                  <li><strong>Invitación de colaboradores</strong>: Para que un colaborador o miembro de tu equipo registre horas, tenés que compartirle manualmente la planilla en Google Drive otorgándole acceso de &apos;Editor&apos;. Esto garantiza que solo vos controlás quién accede a tus datos.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. Cuentas y responsabilidades
                </h2>
                <p>
                  Para usar Ptime, debés autenticarte mediante Google OAuth 2.0. Vos sos responsable de:
                </p>
                <ul className="list-disc list-inside space-y-1.5 mt-2">
                  <li>La seguridad de las credenciales de tu cuenta de Google.</li>
                  <li>La veracidad de los datos registrados en tu planilla.</li>
                  <li>Mantener los permisos correctos de compartido en Google Drive.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  4. Uso aceptable
                </h2>
                <p>
                  Aceptás usar Ptime únicamente para fines legales. No intentarás realizar ingeniería inversa, interrumpir o vulnerar los controles de seguridad del servicio.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Limitación de responsabilidad
                </h2>
                <p>
                  Ptime se provee &quot;tal cual está&quot;, sin garantías de ningún tipo. Dado que todos tus datos residen en tu Google Sheets, TuCloud.pro no se responsabiliza por pérdida de datos, eliminación accidental de pestañas o interrupciones del servicio causadas por límites de Google.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Cambios en los términos
                </h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de Ptime tras la publicación de cambios constituye la aceptación de los nuevos términos.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  7. Contacto
                </h2>
                <p>
                  Si tenés alguna pregunta sobre estos Términos de Servicio, escribinos a{" "}
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
