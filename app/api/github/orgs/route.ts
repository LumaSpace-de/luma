import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getGithubToken } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const gh = await getGithubToken(session.user.id)
  if (!gh) return NextResponse.json({ error: "GitHub nicht verbunden" }, { status: 400 })

  const res = await fetch("https://api.github.com/user/orgs?per_page=100", {
    headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github.v3+json" },
  })

  if (!res.ok) return NextResponse.json({ error: "GitHub API Fehler" }, { status: 502 })

  const orgs = await res.json()
  const mapped = orgs.map((o: Record<string, unknown>) => ({
    login: o.login,
    avatarUrl: o.avatar_url,
    description: o.description,
  }))

  return NextResponse.json(mapped)
}
