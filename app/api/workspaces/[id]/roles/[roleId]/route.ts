import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deleteWorkspaceRole, updateWorkspaceRole } from "@/lib/roles-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const userRole = await getUserRoleInWorkspace(session.user.id, params.id)
  if (userRole !== "owner" && userRole !== "admin") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 })
  }

  try {
    await updateWorkspaceRole(params.roleId, params.id, {
      name: typeof body.name === "string" ? body.name.trim().slice(0, 30) : undefined,
      color: body.color,
      permissions: typeof body.permissions === "object" ? body.permissions : undefined,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const userRole = await getUserRoleInWorkspace(session.user.id, params.id)
  if (userRole !== "owner" && userRole !== "admin") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  await deleteWorkspaceRole(params.roleId, params.id)
  return NextResponse.json({ success: true })
}
