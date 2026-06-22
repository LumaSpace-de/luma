import { NextRequest, NextResponse } from "next/server"

import { setGithubToken } from "@/lib/users-db"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const userId = req.nextUrl.searchParams.get("state")

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/settings?github=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/settings?github=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/settings?github=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/settings?github=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  const ghUser = await userRes.json()
  await setGithubToken(userId, tokenData.access_token, ghUser.login)

  return NextResponse.redirect(new URL("/settings?github=connected", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
}
