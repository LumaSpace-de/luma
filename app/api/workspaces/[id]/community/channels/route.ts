import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createCommunityChannel, getCommunityChannels, isCommunityEnabled } from "@/lib/community-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
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

  const channels = await getCommunityChannels(params.id)
  return NextResponse.json({ channels })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
  const name = typeof body?.name === "string"
    ? body.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40)
    : ""
  if (!name) {
    return NextResponse.json({ error: "Name darf nicht leer sein" }, { status: 400 })
  }

  try {
    const channel = await createCommunityChannel(params.id, session.user.id, name)
    return NextResponse.json({ channel })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
