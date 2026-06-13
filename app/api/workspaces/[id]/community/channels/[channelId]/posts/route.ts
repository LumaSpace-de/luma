import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createCommunityPost, getCommunityPosts, isCommunityEnabled } from "@/lib/community-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const role = await getUserRoleInWorkspace(session.user.id, params.id)
  if (!role) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const enabled = await isCommunityEnabled(params.id)
  if (!enabled) {
    return NextResponse.json({ error: "Community ist für diesen Workspace nicht aktiviert" }, { status: 404 })
  }

  const posts = await getCommunityPosts(params.channelId)
  return NextResponse.json({ posts })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const role = await getUserRoleInWorkspace(session.user.id, params.id)
  if (!role || role === "viewer") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const enabled = await isCommunityEnabled(params.id)
  if (!enabled) {
    return NextResponse.json({ error: "Community ist für diesen Workspace nicht aktiviert" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const text = typeof body?.body === "string" ? body.body.trim() : ""
  if (!text) {
    return NextResponse.json({ error: "Beitrag darf nicht leer sein" }, { status: 400 })
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Beitrag darf maximal 2000 Zeichen haben" }, { status: 400 })
  }

  try {
    await createCommunityPost(params.channelId, session.user.id, text)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
