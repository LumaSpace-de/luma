import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getDiscordToken } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const dc = await getDiscordToken(session.user.id)
  if (!dc) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: true,
    username: dc.username,
    discordUserId: dc.discordUserId,
    avatar: dc.avatar,
  })
}
