import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deletePage, updatePageTitle } from "@/lib/pages-db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { title } = await req.json()
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

  await deletePage(params.id)
  return NextResponse.json({ success: true })
}
