import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import { createUser, findUserByEmail } from "@/lib/users-db"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email und Passwort erforderlich" },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 6 Zeichen haben" },
      { status: 400 }
    )
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json(
      { error: "Diese E-Mail ist bereits registriert" },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await createUser(email, hashed)

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
