import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { setGithubToken } from "@/lib/users-db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const { token } = await req.json()
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token fehlt" }, { status: 400 })
  }

  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 })
  }

  const gh = await res.json()
  await setGithubToken(session.user.id, token, gh.login)

  return NextResponse.json({ username: gh.login, avatar: gh.avatar_url })
}
