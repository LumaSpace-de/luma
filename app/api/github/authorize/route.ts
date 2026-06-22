import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "GitHub OAuth nicht konfiguriert" }, { status: 500 })
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/github/callback`

  const url = new URL("https://github.com/login/oauth/authorize")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", "repo read:user")
  url.searchParams.set("state", session.user.id)

  return NextResponse.redirect(url.toString())
}
