import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ connected: false })

  return NextResponse.json({ connected: true })
}
