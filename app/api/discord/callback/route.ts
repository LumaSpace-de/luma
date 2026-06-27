import { NextRequest, NextResponse } from "next/server"

import { setDiscordToken } from "@/lib/users-db"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const userId = req.nextUrl.searchParams.get("state")
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/settings?discord=error", baseUrl))
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/settings?discord=error", baseUrl))
  }

  const redirectUri = `${baseUrl}/api/discord/callback`

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/settings?discord=error", baseUrl))
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/settings?discord=error", baseUrl))
  }

  const dcUser = await userRes.json()
  const username = dcUser.global_name ?? dcUser.username ?? ""
  const avatar = dcUser.avatar
    ? `https://cdn.discordapp.com/avatars/${dcUser.id}/${dcUser.avatar}.png`
    : null

  await setDiscordToken(userId, tokenData.access_token, username, dcUser.id, avatar)

  return NextResponse.redirect(new URL("/settings?discord=connected", baseUrl))
}
