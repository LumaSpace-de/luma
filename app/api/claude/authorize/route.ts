import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const clientId = process.env.ANTHROPIC_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "Claude OAuth nicht konfiguriert" }, { status: 500 })
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/claude/callback`

  const url = new URL("https://claude.ai/oauth/authorize")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "org:create_api_key user:profile user:inference")
  url.searchParams.set("state", session.user.id)

  return NextResponse.redirect(url.toString())
}
