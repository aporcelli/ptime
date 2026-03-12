// auth.ts — NextAuth v5 (beta) root config
// ─────────────────────────────────────────────────────────────────────────────
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// Extender los tipos de session y token para incluir el rol
declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      name:  string;
      email: string;
      role:  "USER" | "ADMIN";
    };
  }
  interface User {
    role: "USER" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "USER" | "ADMIN";
    id:   string;
  }
}

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 horas
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",       type: "email" },
        password: { label: "Contraseña",  type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // ── En producción: verificar contra tu tabla de usuarios ──────────
        // Por ahora se usa el admin definido en env variables.
        // Reemplazar con bcrypt.compare + consulta a Sheets/DB.
        const { email, password } = parsed.data;

        if (
          email    === process.env.ADMIN_EMAIL &&
          password === "admin123" // TODO: reemplazar con bcrypt en producción
        ) {
          return {
            id:    "admin-001",
            name:  "Administrador",
            email,
            role:  "ADMIN",
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id   = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id   = token.id;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      options: {
        httpOnly:  true,
        sameSite:  "lax",
        secure:    process.env.NODE_ENV === "production",
        path:      "/",
      },
    },
  },
});
