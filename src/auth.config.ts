import type { NextAuthConfig } from "next-auth";

// Edge-safe config, shared by the full auth.ts (Node runtime) and
// middleware.ts (Edge runtime). Must not import Prisma/bcrypt — those pull
// in Node-only code that would bloat the middleware's Edge Function past
// Vercel's size limit.
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
};
