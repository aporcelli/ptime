import NextAuth from "next-auth";
import Google   from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id:           string;
      name:         string;
      email:        string;
      image?:       string;
      role:         "USER" | "ADMIN";
      sheetId?:     string;
      accessToken?: string;
    };
    error?: "RefreshTokenError";
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    role:            "USER" | "ADMIN";
    sheetId?:        string;
    accessToken?:    string;
    refreshToken?:   string;
    accessTokenExpiresAt?: number; // timestamp Unix en segundos
    error?:          "RefreshTokenError";
  }
}

// ── Refresh del access token de Google ────────────────────────────────────────
async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type:    "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[auth] Token refresh failed:", data);
      return null;
    }
    return { access_token: data.access_token, expires_in: data.expires_in };
  } catch (err) {
    console.error("[auth] Token refresh error:", err);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.VERCEL === "1",
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages:   { signIn: "/login", error: "/login" },

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid", "email", "profile",
            "https://www.googleapis.com/auth/spreadsheets",
          ].join(" "),
          access_type: "offline",
          prompt:      "consent",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session: sessionUpdate }) {
      // 1️⃣ Login inicial — guardar tokens + expiración
      if (account && user) {
        token.accessToken          = account.access_token;
        token.refreshToken         = account.refresh_token;
        // Google devuelve expires_in en segundos — convertimos a timestamp absoluto
        token.accessTokenExpiresAt = account.expires_at ??
          Math.floor(Date.now() / 1000) + (account.expires_in as number ?? 3600);

        const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
          .split(",").map((e) => e.trim().toLowerCase());
        token.role  = adminEmails.includes((user.email ?? "").toLowerCase()) ? "ADMIN" : "USER";
        token.error = undefined;

        // 🔑 PERSISTENCIA CROSS-DEVICE: buscar el sheetId del usuario en el MASTER_SHEET
        // así no necesita volver a poner el link en otra sesión / navegador.
        // Usamos la versión Edge-compatible (sin googleapis pesado).
        if (user.email) {
          try {
            const { findSharedSheetForEmailEdge } = await import("@/lib/sheets/master-edge");
            const persisted = await findSharedSheetForEmailEdge(user.email);
            if (persisted) {
              token.sheetId = persisted;
            }
          } catch (e) {
            console.error("[auth] No se pudo recuperar sheetId persistido:", e);
          }
        }
        return token;
      }

      // 1b️⃣ Actualización manual del JWT (ej. después del Setup del Sheet)
      if (trigger === "update" && sessionUpdate?.sheetId) {
        token.sheetId = sessionUpdate.sheetId;
        return token;
      }

      // 2️⃣ Token vigente — devolver sin cambios
      const expiresAt = token.accessTokenExpiresAt ?? 0;
      const nowSecs   = Math.floor(Date.now() / 1000);
      // Refrescar si vence en menos de 5 minutos (300s de margen)
      if (nowSecs < expiresAt - 300) {
        return token;
      }

      // 3️⃣ Token vencido — intentar refresh
      if (!token.refreshToken) {
        console.error("[auth] No refresh token available");
        return { ...token, error: "RefreshTokenError" as const };
      }

      const refreshed = await refreshGoogleToken(token.refreshToken);
      if (!refreshed) {
        return { ...token, error: "RefreshTokenError" as const };
      }

      return {
        ...token,
        accessToken:          refreshed.access_token,
        accessTokenExpiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
        error:                undefined,
      };
    },

    async session({ session, token }) {
      session.user.role        = token.role;
      session.user.id          = token.sub ?? session.user.email;
      session.user.accessToken = token.accessToken as string | undefined;
      session.user.sheetId     = token.sheetId as string | undefined;
      // Propagar el error para que el cliente pueda re-login si es necesario
      if (token.error) session.error = token.error;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    },
  },
});
