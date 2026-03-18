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
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    role:          "USER" | "ADMIN";
    sheetId?:      string;
    accessToken?:  string;
    refreshToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
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
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken  = account.access_token;
        token.refreshToken = account.refresh_token;
        // El primer email en ADMIN_EMAILS tiene rol ADMIN
        const adminEmails = (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
          .split(",").map((e) => e.trim().toLowerCase());
        token.role = adminEmails.includes((user.email ?? "").toLowerCase()) ? "ADMIN" : "USER";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role        = token.role;
      session.user.id          = token.sub ?? session.user.email;
      session.user.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    },
  },
});
