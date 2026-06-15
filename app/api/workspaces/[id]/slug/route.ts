import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getWorkspaceSlug, setWorkspaceSlug } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const slug = await getWorkspaceSlug(params.id, session.user.id)
  return NextResponse.json({ slug })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const raw = typeof body?.slug === "string" ? body.slug : ""
  const slug = raw.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60)

  if (raw && !slug) {
    return NextResponse.json({ error: "Ungültiger Slug" }, { status: 400 })
  }

  try {
    await setWorkspaceSlug(params.id, session.user.id, slug || null)
    return NextResponse.json({ slug: slug || null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
