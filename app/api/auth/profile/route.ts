import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { findUserByEmail, findUserByUsername, updateName, updateUsername } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const user = await findUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  return NextResponse.json({
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()

  if ("name" in body) {
    const name = body.name?.trim()
    if (!name || name.length < 1) {
      return NextResponse.json({ error: "Name darf nicht leer sein" }, { status: 400 })
    }
    if (name.length > 60) {
      return NextResponse.json({ error: "Name darf maximal 60 Zeichen haben" }, { status: 400 })
    }
    await updateName(session.user.id, name)
    return NextResponse.json({ success: true })
  }

  const { username } = body
  const clean = username?.trim().replace(/^@/, "").toLowerCase()

  if (!clean || clean.length < 3) {
    return NextResponse.json(
      { error: "Benutzername muss mindestens 3 Zeichen haben" },
      { status: 400 }
    )
  }

  if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
    return NextResponse.json(
      { error: "Nur Buchstaben, Zahlen und _ erlaubt (3–30 Zeichen)" },
      { status: 400 }
    )
  }

  const existing = await findUserByUsername(clean)
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: "Dieser Benutzername ist bereits vergeben" },
      { status: 400 }
    )
  }

  await updateUsername(session.user.id, clean)
  return NextResponse.json({ success: true })
}
