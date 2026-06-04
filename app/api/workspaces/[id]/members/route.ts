import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createInvitation } from "@/lib/invitations-db"
import { findUserByEmail, findUserByUsername } from "@/lib/users-db"
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
  const query = (body.query ?? body.email ?? "").trim()

  if (!query) {
    return NextResponse.json({ error: "E-Mail oder @Benutzername erforderlich" }, { status: 400 })
  }

  let user = null
  if (query.startsWith("@")) {
    user = await findUserByUsername(query.slice(1).toLowerCase())
  } else {
    user = await findUserByEmail(query.toLowerCase())
  }

  if (!user) {
    return NextResponse.json(
      { error: query.startsWith("@") ? "Kein Nutzer mit diesem Benutzernamen gefunden" : "Kein Nutzer mit dieser E-Mail gefunden" },
      { status: 404 }
    )
  }

  if (user.id === session.user.id) {
    return NextResponse.json({ error: "Du kannst dich nicht selbst einladen" }, { status: 400 })
  }

  try {
    await createInvitation(params.id, user.id, session.user.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ error: "Einladung bereits gesendet oder Nutzer ist bereits Mitglied" }, { status: 400 })
    }
    return NextResponse.json({ error: "Fehler beim Einladen" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
