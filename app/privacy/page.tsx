export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink text-slate-300 p-10 font-sans max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif text-white mb-8">Privacy Policy</h1>
      <section className="space-y-6">
        <p>At Ptime, we take your privacy seriously. This policy outlines how we handle your data.</p>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">1. Data Access</h2>
          <p>Ptime accesses your Google Sheets only to record work hours, manage projects, and generate reports. We only access the specific spreadsheet you configure in the settings.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">2. Data Storage</h2>
          <p>We do not store your spreadsheet data on our servers. All information remains in your Google account. We only store your session identification and basic profile information (email, name, and profile picture) to provide the service.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">3. Third Parties</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
        </div>
      </section>
      <footer className="mt-12 pt-8 border-t border-slate-800 text-sm">
        <p>© 2026 Ptime by TuCloud.pro</p>
      </footer>
    </main>
  );
}
