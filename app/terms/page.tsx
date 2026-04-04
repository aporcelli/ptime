export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ink text-slate-300 p-10 font-sans max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif text-white mb-8">Terms of Service</h1>
      <section className="space-y-6">
        <p>Welcome to Ptime. By using our service, you agree to the following terms.</p>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">1. Service Usage</h2>
          <p>Ptime provides a tool for professional time tracking using Google Sheets as a backend. You are responsible for maintaining the security of your Google account.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">2. Google API</h2>
          <p>This service integrates with Google APIs. Your use of Ptime is also subject to Google's Terms of Service.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-warm-500 mb-2">3. Limitation of Liability</h2>
          <p>Ptime is provided "as is". TuCloud.pro shall not be liable for any data loss or service interruptions related to Google's infrastructure.</p>
        </div>
      </section>
      <footer className="mt-12 pt-8 border-t border-slate-800 text-sm">
        <p>© 2026 Ptime by TuCloud.pro</p>
      </footer>
    </main>
  );
}
