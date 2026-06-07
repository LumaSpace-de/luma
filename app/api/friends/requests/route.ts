import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getIncomingRequests, getOutgoingRequests } from "@/lib/friends-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const [incoming, outgoing] = await Promise.all([
    getIncomingRequests(session.user.id),
    getOutgoingRequests(session.user.id),
  ])

  return NextResponse.json({ incoming, outgoing })
}
