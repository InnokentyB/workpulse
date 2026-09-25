import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { upsertGoogleUser } from "@/lib/auth/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/account" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;
      return Boolean(
        profile?.sub &&
          profile.email &&
          profile.email_verified === true,
      );
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub && profile.email) {
        const user = await upsertGoogleUser({
          googleSubject: profile.sub,
          email: profile.email,
          name: typeof profile.name === "string" ? profile.name : null,
        });
        token.workpulseUserId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.workpulseUserId === "string") {
        session.user.id = token.workpulseUserId;
      }
      return session;
    },
  },
});
