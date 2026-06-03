import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { removeWorkspaceMember, updateWorkspaceMemberRole } from "@/lib/workspaces-db"

const VALID_ROLES = ["admin", "member", "viewer"]

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()
  if (!VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Ungültige Berechtigung" }, { status: 400 })
  }

  await updateWorkspaceMemberRole(params.id, params.userId, body.role)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await removeWorkspaceMember(params.id, params.userId)
  return NextResponse.json({ success: true })
}
