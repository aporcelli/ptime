import NextAuth from "next-auth";
import Google   from "next-auth/providers/google";
import { findSharedSheetForEmailEdge, appendAuditLogEdge } from "@/lib/sheets/master-edge";
import { headers, cookies } from "next/headers";

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

async function fetchGoogleProfilePicture(accessToken?: string): Promise<string | undefined> {
  if (!accessToken) return undefined;
  try {
    const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { picture?: string };
    return data.picture || undefined;
  } catch {
    return undefined;
  }
}


// ── Registrar usuario en la pestaña Usuarios del sheet ─────────────────────────
async function registerUserInSheet(
  sheetId: string,
  accessToken: string,
  user: { id: string; nombre: string; email: string }
): Promise<void> {
  try {
    const range = "Usuarios!A:G";
    const now = new Date().toISOString();
    
    // Leer filas existentes para ver si el usuario ya está registrado
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!readRes.ok) return;
    const data = await readRes.json();
    const rows: string[][] = data.values ?? [];
    const existingIdx = rows.findIndex((r) => r[2] === user.email);
    
    if (existingIdx === -1) {
      // Usuario nuevo — append
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [[user.id, user.nombre, user.email, "USER", "true", now, sheetId]] }),
        }
      );
    } else {
      // Usuario existente — actualizar último acceso
      const rowNum = existingIdx + 1;
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent("Usuarios!F" + rowNum)}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [[now]] }),
        }
      );
    }
  } catch (err) {
    console.error("[auth] registerUserInSheet error:", err);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.VERCEL === "1",
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages:   { signIn: "/login", error: "/login" },

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid", "email", "profile",
            process.env.NEXT_PUBLIC_OAUTH_SCOPE || "https://www.googleapis.com/auth/spreadsheets",
          ].join(" "),
          access_type: "offline",
          prompt:      "select_account",
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
        token.name                 = user.name ?? token.name;
        token.email                = user.email ?? token.email;
        token.picture              = (user as { image?: string | null }).image ?? token.picture;
        if (!token.picture) {
          token.picture = await fetchGoogleProfilePicture(token.accessToken as string | undefined) ?? token.picture;
        }
        // Google devuelve expires_in en segundos — convertimos a timestamp absoluto
        token.accessTokenExpiresAt = account.expires_at ??
          Math.floor(Date.now() / 1000) + (account.expires_in as number ?? 3600);

        const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
          .split(",").map((e) => e.trim().toLowerCase());
        token.role  = adminEmails.includes((user.email ?? "").toLowerCase()) ? "ADMIN" : "USER";
            token.error = undefined;

            // ── LOGIN AUDIT LOG ──
            let userAgent = "Desconocido";
            let ip = "127.0.0.1";
            let location = "Local/Desconocido";
            try {
              const reqHeaders = headers();
              userAgent = reqHeaders.get("user-agent") || "Desconocido";
              ip = reqHeaders.get("x-real-ip") || reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
              const country = reqHeaders.get("x-vercel-ip-country") || "";
              const region = reqHeaders.get("x-vercel-ip-country-region") || "";
              const city = reqHeaders.get("x-vercel-ip-city") || "";
              location = [city, region, country].filter(Boolean).join(", ") || "Local/Desconocido";
            } catch (err) {
              console.error("[audit] Try-catch header error:", err);
            }

            // Append row to master Audit_Log sheet (asynchronous, non-blocking)
            appendAuditLogEdge(
              user.email ?? "",
              user.name ?? "",
              userAgent,
              ip,
              location
            ).catch((err) => console.error("[audit] Failed to write login log:", err));

        // 🔑 PERSISTENCIA CROSS-DEVICE: buscar el sheetId del usuario en el MASTER_SHEET
        // así no necesita volver a poner el link en otra sesión / navegador.
        // Usamos la versión Edge-compatible (sin googleapis pesado).
        if (user.email) {
          // Admin: usar MASTER_SHEET_ID directamente
          if (token.role === "ADMIN") {
            const masterId = process.env.MASTER_SHEET_ID?.replace(/"/g, "");
            if (masterId) token.sheetId = masterId;
          }

          if (!token.sheetId) {
            try {
              const persisted = await findSharedSheetForEmailEdge(user.email);
              if (persisted) token.sheetId = persisted;
            } catch (e) {
              console.error("[auth] No se pudo recuperar sheetId persistido:", e);
            }
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
        if (!token.picture) {
          token.picture = await fetchGoogleProfilePicture(token.accessToken as string | undefined) ?? token.picture;
        }
        return token;
      }

      // 3️⃣ Token vencido — intentar refresh con retry (post-sleep resilience)
      if (!token.refreshToken) {
        console.error("[auth] No refresh token available");
        return { ...token, error: "RefreshTokenError" as const };
      }

      // Retry up to 3 times with 2s delay (handles post-sleep network recovery)
      let refreshed = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        refreshed = await refreshGoogleToken(token.refreshToken);
        if (refreshed) break;
        if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
      }

      if (!refreshed) {
        return { ...token, error: "RefreshTokenError" as const };
      }

      const refreshedPicture = token.picture ?? (await fetchGoogleProfilePicture(refreshed.access_token));
      return {
        ...token,
        accessToken:          refreshed.access_token,
        accessTokenExpiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
        picture:              refreshedPicture,
        error:                undefined,
      };
    },

    async session({ session, token }) {
      session.user.name        = (token.name as string | undefined) ?? session.user.name;
      session.user.email       = (token.email as string | undefined) ?? session.user.email;
      session.user.image       = (token.picture as string | undefined) ?? session.user.image;
      session.user.id          = token.sub ?? session.user.email;
      session.user.accessToken = token.accessToken as string | undefined;
      session.user.sheetId     = token.sheetId as string | undefined;

      // Calcular rol de forma dinámica:
      // Si el email está en ADMIN_EMAIL, es ADMIN global.
      // Si la planilla conectada es la del Master Sheet, los no-administradores son USER (colaboradores).
      // Si la planilla es cualquier otra (el usuario conectó la suya), es el dueño y es ADMIN.
      const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
        .split(",").map((e) => e.trim().toLowerCase());
      const globalMasterId = process.env.MASTER_SHEET_ID?.replace(/"/g, "");
      const userEmail = (session.user.email as string | undefined)?.toLowerCase();

      if (userEmail && adminEmails.includes(userEmail)) {
        session.user.role = "ADMIN";
      } else {
        const currentSheetId = session.user.sheetId || "";
            try {
              const cookieStore = cookies();
              if (cookieStore.get("ptime-is-shared-workspace")?.value === "true") {
                session.user.role = "USER";
              } else if (currentSheetId && currentSheetId === globalMasterId) {
                session.user.role = "USER";
              } else {
                session.user.role = "ADMIN";
              }
            } catch {
              if (currentSheetId && currentSheetId === globalMasterId) {
                session.user.role = "USER";
              } else {
                session.user.role = "ADMIN";
              }
            }
      }

      // Propagar el error para que el cliente pueda re-login si es necesario
      if (token.error) session.error = token.error;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 24 * 60 * 60 },
    },
  },
});
