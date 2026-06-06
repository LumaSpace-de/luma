import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getPageById } from "@/lib/pages-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"
import { deleteBlock, updateBlock } from "@/lib/blocks-db"

export async function PATCH(req: NextRequest, { params }: { params: { id: string; blockId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer") return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  const patch = await req.json()
  await updateBlock(params.blockId, patch)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; blockId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer") return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  await deleteBlock(params.blockId)
  return NextResponse.json({ ok: true })
}
