import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { findUserByEmail, findUserByUsername, updateUserProfile } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const user = await findUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  return NextResponse.json({
    displayName: user.displayName ?? user.name,
    username: user.username ?? "",
    email: user.email,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { displayName, username } = await req.json()

  if (!displayName?.trim()) {
    return NextResponse.json({ error: "Anzeigename ist erforderlich" }, { status: 400 })
  }

  const cleanUsername = username?.trim().replace(/^@/, "").toLowerCase()

  if (cleanUsername) {
    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Benutzername darf nur Buchstaben, Zahlen und _ enthalten (3–30 Zeichen)" },
        { status: 400 }
      )
    }

    const existing = await findUserByUsername(cleanUsername)
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Dieser Benutzername ist bereits vergeben" },
        { status: 400 }
      )
    }
  }

  await updateUserProfile(session.user.id, {
    displayName: displayName.trim(),
    username: cleanUsername ?? "",
  })

  return NextResponse.json({ success: true })
}
