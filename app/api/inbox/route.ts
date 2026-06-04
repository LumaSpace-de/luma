import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { countPendingInvitations, getPendingInvitations } from "@/lib/invitations-db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  if (searchParams.get("count") === "1") {
    const count = await countPendingInvitations(session.user.id)
    return NextResponse.json({ count })
  }

  const invitations = await getPendingInvitations(session.user.id)
  return NextResponse.json(invitations)
}
