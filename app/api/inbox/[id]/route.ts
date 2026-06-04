import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { acceptInvitation, declineInvitation } from "@/lib/invitations-db"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  try {
    const result = await acceptInvitation(params.id, session.user.id)
    return NextResponse.json(result)
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

  await declineInvitation(params.id, session.user.id)
  return NextResponse.json({ success: true })
}
