// app/(auth)/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  callbackUrl?: string;
}

export default function LoginForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd    = new FormData(e.currentTarget);
    const email    = fd.get("email")    as string;
    const password = fd.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email o contraseña incorrectos. Intenta de nuevo.");
      return;
    }

    router.push(callbackUrl ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-slate-300 text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@empresa.com"
          className="
            bg-ink border border-slate-700 rounded-lg px-3.5 py-2.5
            text-white text-sm placeholder-slate-600
            focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent
            transition-all
          "
        />
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-slate-300 text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="
              w-full bg-ink border border-slate-700 rounded-lg px-3.5 py-2.5 pr-10
              text-white text-sm placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent
              transition-all
            "
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="
          mt-2 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60
          text-white font-semibold rounded-lg py-2.5 text-sm
          flex items-center justify-center gap-2
          transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 focus:ring-offset-ink-2
        "
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Ingresando…
          </>
        ) : (
          "Ingresar"
        )}
      </motion.button>
    </form>
  );
}
