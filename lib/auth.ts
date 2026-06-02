import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { findUserByEmail } from "./users-db"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "luma-space-secret-flux-network-2026",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await findUserByEmail(credentials.email)
          if (!user) return null

          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
          }
        } catch (err) {
          console.error("[authorize]", err)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string | null
      }
      return session
    },
  },
}
