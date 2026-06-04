import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import {
  createWorkspace,
  getWorkspacesByUser,
  WorkspacePlan,
} from "@/lib/workspaces-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const workspaces = await getWorkspacesByUser(session.user.id)
  return NextResponse.json(workspaces)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { name } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 })
  }

  const workspace = await createWorkspace(name.trim(), "free", session.user.id)
  return NextResponse.json(workspace, { status: 201 })
}
