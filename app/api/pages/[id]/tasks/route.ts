import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getPageById } from "@/lib/pages-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"
import { createTask, getTasksByPage } from "@/lib/tasks-db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role) return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  const tasks = await getTasksByPage(params.id)
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const page = await getPageById(params.id)
  if (!page) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const role = await getUserRoleInWorkspace(session.user.id, page.workspaceId)
  if (!role || role === "viewer") return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 })

  const { title, rowData } = await req.json()
  const task = await createTask(params.id, title ?? "", rowData ?? {})
  if (!task) return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 })
  return NextResponse.json(task, { status: 201 })
}
