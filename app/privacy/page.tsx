import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Ptime",
  description: "Ptime Privacy Policy — how we handle your personal data, Google Sheets access, and more.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
                reside exclusively in your Google Sheets, protected by Google Workspace security controls
                (encryption at rest, access control based on your Google account, and audit logging).
                Ptime does not maintain a separate copy of this data on its own servers.
              </li>
              <li>
                <strong>Minimal access:</strong> Ptime only accesses the specific spreadsheet you configure
                during setup. We do not list, browse, or access other documents in your Google Drive.
                The access token is used exclusively against the spreadsheet ID you provided.
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
              <li>
                <strong>We do not store your Sheets data:</strong> the only data Ptime retains on its
                servers is your profile information (name, email, photo) during the active session.
                We do not store, copy, or back up the contents of your spreadsheets.
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
              <li><strong>Export</strong> your data (it lives in your Google Sheets — you can download it directly).</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:info@tucloud.pro"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                info@tucloud.pro
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              8. Changes to this policy
            </h2>
            <p>
              We may update this policy periodically. Significant changes will be notified
              through the app or via email. Continued use of Ptime after
              changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              9. Contact
            </h2>
            <p>
              If you have questions about this policy, write to us at:{" "}
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
