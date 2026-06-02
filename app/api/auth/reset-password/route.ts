import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import {
  deleteResetToken,
  findUserByEmail,
  updateUserPassword,
  verifyResetToken,
} from "@/lib/users-db"

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json()

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 6 Zeichen haben" },
      { status: 400 }
    )
  }

  const valid = await verifyResetToken(email, code)
  if (!valid) {
    return NextResponse.json(
      { error: "Code ungültig oder abgelaufen" },
      { status: 400 }
    )
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await updateUserPassword(user.id, hashed)
  await deleteResetToken(email)

  return NextResponse.json({ success: true })
}
