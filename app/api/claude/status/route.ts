import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getAnthropicToken } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const token = await getAnthropicToken(session.user.id)
  return NextResponse.json({ connected: !!token })
}
