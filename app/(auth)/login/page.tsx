// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) {
    redirect(searchParams.callbackUrl ?? "/dashboard");
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full
                   bg-brand-600/20 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full
                   bg-warm-500/10 blur-[100px] pointer-events-none"
      />

      <div className="relative w-full max-w-sm z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-6xl text-white">
            P<span className="text-warm-500 italic">time</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Gestión de horas profesionales
          </p>
        </div>

        <div className="bg-ink-2 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">
            Iniciar sesión
          </h2>

          {searchParams.error === "CredentialsSignin" && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              Email o contraseña incorrectos.
            </div>
          )}

          <LoginForm callbackUrl={searchParams.callbackUrl} />
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} Ptime · Acceso restringido
        </p>
      </div>
    </main>
  );
}
