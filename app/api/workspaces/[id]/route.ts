import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deleteWorkspace, updateWorkspaceName } from "@/lib/workspaces-db"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await deleteWorkspace(params.id, session.user.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()
  const name = body.name?.trim()

  if (!name || name.length < 1) {
    return NextResponse.json({ error: "Name darf nicht leer sein" }, { status: 400 })
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "Name darf maximal 80 Zeichen haben" }, { status: 400 })
  }

  await updateWorkspaceName(params.id, session.user.id, name)
  return NextResponse.json({ success: true })
}
