import { NextRequest, NextResponse } from "next/server"

import { setAnthropicToken } from "@/lib/users-db"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const userId = req.nextUrl.searchParams.get("state")

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/settings?claude=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const clientId = process.env.ANTHROPIC_CLIENT_ID
  const clientSecret = process.env.ANTHROPIC_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/settings?claude=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/claude/callback`

  const tokenRes = await fetch("https://api.anthropic.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-beta": "oauth-2025-04-20",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/settings?claude=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const expiresAt = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null

  await setAnthropicToken(userId, tokenData.access_token, tokenData.refresh_token ?? null, expiresAt)

  return NextResponse.redirect(new URL("/settings?claude=connected", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
}
