import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createCommunityComment, getCommunityComments } from "@/lib/community-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; channelId: string; postId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const role = await getUserRoleInWorkspace(session.user.id, params.id)
  if (!role) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const comments = await getCommunityComments(params.postId)
  return NextResponse.json({ comments })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string; postId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const role = await getUserRoleInWorkspace(session.user.id, params.id)
  if (!role || role === "viewer") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const text = typeof body?.body === "string" ? body.body.trim() : ""
  if (!text) {
    return NextResponse.json({ error: "Kommentar darf nicht leer sein" }, { status: 400 })
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Kommentar darf maximal 1000 Zeichen haben" }, { status: 400 })
  }

  try {
    await createCommunityComment(params.postId, session.user.id, text)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
