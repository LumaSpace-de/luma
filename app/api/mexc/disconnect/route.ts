import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { removeMexcKeys } from "@/lib/users-db"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  await removeMexcKeys(session.user.id)
  return NextResponse.json({ disconnected: true })
}
