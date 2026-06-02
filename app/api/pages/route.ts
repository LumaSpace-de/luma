import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createPage, getPagesByWorkspace } from "@/lib/pages-db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const workspaceId = req.nextUrl.searchParams.get("workspaceId")
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId fehlt" }, { status: 400 })
  }

  const pages = await getPagesByWorkspace(workspaceId)
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { workspaceId, title, template, parentId } = await req.json()

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId fehlt" }, { status: 400 })
  }

  const page = await createPage(
    workspaceId,
    title ?? "Neue Seite",
    template ?? null,
    parentId ?? null
  )

  return NextResponse.json(page, { status: 201 })
}
