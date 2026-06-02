import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { findUserByEmail, updateUserPassword } from "@/lib/users-db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Neues Passwort muss mindestens 6 Zeichen haben" },
      { status: 400 }
    )
  }

  const user = await findUserByEmail(session.user.email)
  if (!user) {
    return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Aktuelles Passwort ist falsch" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await updateUserPassword(user.id, hashed)

  return NextResponse.json({ success: true })
}
