// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? "/dashboard");

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "Esta cuenta ya está vinculada con otro método de login.",
    AccessDenied:          "Acceso denegado.",
    TokenExpired:          "Tu sesión con Google expiró. Volvé a iniciar sesión para renovar el acceso.",
    Default:               "Ocurrió un error al iniciar sesión.",
  };
  const errorMsg = searchParams.error ? (errorMessages[searchParams.error] ?? errorMessages.Default) : null;

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-4">
      {/* Blobs decorativos */}
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-warm-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-6xl text-white">
            P<span className="text-warm-500 italic">time</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Gestión de horas profesionales</p>
        </div>

        <div className="bg-ink-2 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-2">Iniciar sesión</h2>
          <p className="text-slate-400 text-sm mb-6">
            Usá tu cuenta de Google para acceder. Se solicitará permiso para leer y escribir en tus Google Sheets.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Google OAuth button — usa Server Action */}
          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: searchParams.callbackUrl ?? "/dashboard" });
          }}>
            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-3
                bg-white hover:bg-slate-50 text-slate-800
                font-semibold rounded-xl py-3 px-4 text-sm
                transition-colors shadow-sm border border-slate-200
              "
            >
              <GoogleIcon />
              Continuar con Google
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} Ptime · Acceso restringido
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
