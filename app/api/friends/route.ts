import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { countIncomingRequests, getFriends, sendFriendRequest } from "@/lib/friends-db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  if (searchParams.get("count") === "1") {
    const count = await countIncomingRequests(session.user.id)
    return NextResponse.json({ count })
  }

  const friends = await getFriends(session.user.id)
  return NextResponse.json(friends)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const username = typeof body?.username === "string" ? body.username.trim().replace(/^@/, "") : ""
  if (!username) {
    return NextResponse.json({ error: "Benutzername erforderlich" }, { status: 400 })
  }

  try {
    await sendFriendRequest(session.user.id, username)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
