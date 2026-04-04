// types/auth.d.ts
// ─────────────────────────────────────────────────────────────────────────────
// Augmentación de tipos de NextAuth para incluir campos personalizados
// como `role` y `accessToken` en la sesión y JWT.
// ─────────────────────────────────────────────────────────────────────────────

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { UserRole } from "./entities";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            accessToken?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: UserRole;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: UserRole;
        accessToken?: string;
    }
}
