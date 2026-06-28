import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createWorkspaceRole, getWorkspaceRoles } from "@/lib/roles-db"
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

  const roles = await getWorkspaceRoles(params.id)
  return NextResponse.json({ roles })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 30) : ""
  if (!name) {
    return NextResponse.json({ error: "Name darf nicht leer sein" }, { status: 400 })
  }

  const validColors = ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink", "indigo"]
  const color = validColors.includes(body?.color) ? body.color : "gray"
  const permissions = typeof body?.permissions === "object" ? body.permissions : {}

  try {
    const role = await createWorkspaceRole(params.id, name, color, permissions)
    return NextResponse.json({ role })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
