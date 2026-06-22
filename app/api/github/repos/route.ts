import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getGithubToken } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const gh = await getGithubToken(session.user.id)
  if (!gh) return NextResponse.json({ error: "GitHub nicht verbunden" }, { status: 400 })

  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
    headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github.v3+json" },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "GitHub API Fehler" }, { status: 502 })
  }

  const repos = await res.json()
  const mapped = repos.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    private: r.private,
    language: r.language,
    updatedAt: r.updated_at,
    stargazersCount: r.stargazers_count,
    owner: {
      login: (r.owner as Record<string, unknown>)?.login,
      avatarUrl: (r.owner as Record<string, unknown>)?.avatar_url,
    },
  }))

  return NextResponse.json(mapped)
}
