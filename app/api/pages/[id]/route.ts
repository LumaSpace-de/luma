import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deletePage, getPageById, updatePageContent, updatePageIcon, updatePageTitle } from "@/lib/pages-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  const canEdit = role !== null && role !== "viewer"

  return NextResponse.json({ ...page, canEdit })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  const body = await req.json()

  if ("content" in body) {
    await updatePageContent(params.id, body.content ?? "")
    return NextResponse.json({ success: true })
  }

  if ("icon" in body) {
    await updatePageIcon(params.id, body.icon ?? null)
    return NextResponse.json({ success: true })
  }

  const { title } = body
  if (!title?.trim()) {
    return NextResponse.json({ error: "Titel erforderlich" }, { status: 400 })
  }

  await updatePageTitle(params.id, title.trim())
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer" || role === "member") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  await deletePage(params.id)
  return NextResponse.json({ success: true })
}
