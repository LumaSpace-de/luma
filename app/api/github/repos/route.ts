import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getGithubToken } from "@/lib/users-db"

function mapRepo(r: Record<string, unknown>) {
  return {
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
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const gh = await getGithubToken(session.user.id)
  if (!gh) return NextResponse.json({ error: "GitHub nicht verbunden" }, { status: 400 })

  const headers = { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github.v3+json" }
  const org = req.nextUrl.searchParams.get("org")

  if (org) {
    const res = await fetch(`https://api.github.com/orgs/${encodeURIComponent(org)}/repos?sort=updated&per_page=100`, { headers })
    if (!res.ok) return NextResponse.json({ error: "GitHub API Fehler" }, { status: 502 })
    const repos = await res.json()
    return NextResponse.json(repos.map(mapRepo))
  }

  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=all", { headers })
  if (!res.ok) return NextResponse.json({ error: "GitHub API Fehler" }, { status: 502 })
  const repos = await res.json()
  return NextResponse.json(repos.map(mapRepo))
}
