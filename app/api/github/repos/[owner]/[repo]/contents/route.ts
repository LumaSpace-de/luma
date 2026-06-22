import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getGithubToken } from "@/lib/users-db"

export async function GET(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const gh = await getGithubToken(session.user.id)
  if (!gh) return NextResponse.json({ error: "GitHub nicht verbunden" }, { status: 400 })

  const path = req.nextUrl.searchParams.get("path") ?? ""
  const url = `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${path}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github.v3+json" },
  })

  if (!res.ok) {
    const status = res.status === 404 ? 404 : 502
    return NextResponse.json({ error: "Nicht gefunden" }, { status })
  }

  const data = await res.json()

  if (Array.isArray(data)) {
    const items = data.map((item: Record<string, unknown>) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
    }))
    return NextResponse.json({ type: "dir", items })
  }

  return NextResponse.json({
    type: "file",
    name: data.name,
    path: data.path,
    size: data.size,
    content: data.content,
    encoding: data.encoding,
    sha: data.sha,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const gh = await getGithubToken(session.user.id)
  if (!gh) return NextResponse.json({ error: "GitHub nicht verbunden" }, { status: 400 })

  const { path, content, message, sha } = await req.json()
  if (!path || content === undefined || !message) {
    return NextResponse.json({ error: "path, content und message sind erforderlich" }, { status: 400 })
  }

  const encoded = Buffer.from(content, "utf-8").toString("base64")
  const url = `https://api.github.com/repos/${params.owner}/${params.repo}/contents/${path}`

  const body: Record<string, string> = { message, content: encoded }
  if (sha) body.sha = sha

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${gh.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: (err as Record<string, unknown>).message ?? "Commit fehlgeschlagen" },
      { status: res.status === 409 ? 409 : 502 }
    )
  }

  const data = await res.json()
  return NextResponse.json({
    sha: data.content?.sha,
    commit: data.commit?.sha,
    message: data.commit?.message,
  })
}
