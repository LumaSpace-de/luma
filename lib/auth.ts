import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import DiscordProvider from "next-auth/providers/discord"

import { supabase } from "./supabase"
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
            avatarUrl: user.avatarUrl,
          }
        } catch (err) {
          console.error("[authorize]", err)
          return null
        }
      },
    }),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: { params: { scope: "identify email" } },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        const email = user.email
        if (!email) return false

        const { data: existing } = await supabase
          .from("users")
          .select("id, name, username, avatar_url")
          .ilike("email", email)
          .maybeSingle()

        if (existing) {
          user.id = existing.id
          user.name = existing.name ?? user.name
          user.username = existing.username ?? null
          user.avatarUrl = existing.avatar_url ?? null

          await supabase
            .from("users")
            .update({
              discord_token: account.access_token,
              discord_username: user.name,
              discord_user_id: account.providerAccountId,
              discord_avatar: user.image ?? null,
            })
            .eq("id", existing.id)

          return true
        }

        const randomPw = crypto.randomUUID()
        const hashed = await bcrypt.hash(randomPw, 10)
        const name = user.name ?? email.split("@")[0]

        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: email.toLowerCase(),
            password: hashed,
            name,
            avatar_url: user.image ?? null,
            discord_token: account.access_token,
            discord_username: user.name,
            discord_user_id: account.providerAccountId,
            discord_avatar: user.image ?? null,
          })
          .select("id, name, username, avatar_url")
          .single()

        if (error || !newUser) return false

        user.id = newUser.id
        user.username = newUser.username ?? null
        user.avatarUrl = newUser.avatar_url ?? null
        return true
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.avatarUrl = user.avatarUrl
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string | null
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
  },
}
