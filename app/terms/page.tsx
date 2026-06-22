import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Ptime",
  description: "Ptime Terms of Service — conditions of use, responsibilities, and acceptable use policy.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
        >
          ← Back to Ptime
        </Link>
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
              in the spreadsheet that the user configures.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              2. Accounts and responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Authentication:</strong> we use Google OAuth 2.0 to identify users.
                You are responsible for maintaining the security of your Google account.
              </li>
              <li>
                <strong>Minimum age:</strong> you must be at least 13 years old (or the minimum age required
                in your country) to use this service.
              </li>
              <li>
                <strong>Data accuracy:</strong> the data you enter in Ptime (hours, projects,
                clients) is your responsibility. We do not verify the accuracy of the entered information.
              </li>
              <li>
                <strong>Acceptable use:</strong> you agree not to use Ptime for illegal,
                fraudulent activities, or activities that violate Google Workspace/Google APIs terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              3. Privacy and data
            </h2>
            <p>
              The handling of your personal data is governed by our{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Privacy Policy
              </Link>.
              By using Ptime, you also agree to the{" "}
              <a
                href="https://developers.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Google APIs Terms of Service
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              4. Intellectual property
            </h2>
            <p>
              Ptime and its code, design, brand, and content are the property of TuCloud.pro.
              The data you enter into the application (hours, projects, clients) remains
              your property.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              5. Limitation of liability
            </h2>
            <p>
              Ptime is provided &quot;as is&quot; and &quot;as available&quot;.
              TuCloud.pro does not guarantee that the service will be uninterrupted, error-free,
              or that it will meet specific user requirements.
            </p>
            <p className="mt-2">
              Under no circumstances shall TuCloud.pro be liable for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Loss of data (your data is in your Google Sheets).</li>
              <li>Service interruptions caused by Google, Vercel, or third parties.</li>
              <li>Direct or indirect damages arising from the use or inability to use the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              6. Cancellation and suspension
            </h2>
            <p>
              You may stop using Ptime at any time. To revoke Ptime&apos;s access
              to your Google account, visit{" "}
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
              We reserve the right to suspend or cancel access for users who violate
              these terms, without prior notice and without liability.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              7. Modifications to the terms
            </h2>
            <p>
              We may modify these terms at any time. Changes will be posted
              on this page and, if substantial, will be notified to users via email
              or through an in-app notice. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              8. Governing law
            </h2>
            <p>
              These terms are governed by the laws of the Argentine Republic.
              Any dispute related to these terms shall be resolved in the courts
              of the Autonomous City of Buenos Aires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              9. Contact
            </h2>
            <p>
              For inquiries about these terms, contact us at:{" "}
              <a
                href="mailto:info@tucloud.pro"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                info@tucloud.pro
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
