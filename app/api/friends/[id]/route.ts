import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { removeFriendship, respondToRequest } from "@/lib/friends-db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const action = body?.action
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 })
  }

  try {
    await respondToRequest(params.id, session.user.id, action === "accept")
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await removeFriendship(params.id, session.user.id)
  return NextResponse.json({ success: true })
}
