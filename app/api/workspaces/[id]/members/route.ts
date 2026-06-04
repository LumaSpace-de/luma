import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createInvitation } from "@/lib/invitations-db"
import { findUserByEmail } from "@/lib/users-db"
import { getWorkspaceMembers } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const members = await getWorkspaceMembers(params.id)
  return NextResponse.json(members)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: "Kein Nutzer mit dieser E-Mail gefunden" }, { status: 404 })
  }

  if (user.id === session.user.id) {
    return NextResponse.json({ error: "Du bist bereits Inhaber dieses Workspaces" }, { status: 400 })
  }

  try {
    await createInvitation(params.id, user.id, session.user.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ error: "Einladung wurde bereits gesendet oder Nutzer ist bereits Mitglied" }, { status: 400 })
    }
    return NextResponse.json({ error: "Fehler beim Einladen" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
