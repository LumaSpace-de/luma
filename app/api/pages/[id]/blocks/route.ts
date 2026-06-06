import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getPageById } from "@/lib/pages-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"
import { createBlock, getBlocksByPage } from "@/lib/blocks-db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  const blocks = await getBlocksByPage(params.id)
  return NextResponse.json(blocks)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer") return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  const { type, data, position } = await req.json()
  const block = await createBlock(params.id, type, data ?? {}, position ?? 0)
  if (!block) return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 })
  return NextResponse.json(block, { status: 201 })
}
