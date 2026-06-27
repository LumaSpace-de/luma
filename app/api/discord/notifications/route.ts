import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { updateDiscordNotifications } from "@/lib/users-db"

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const body = await req.json()

  await updateDiscordNotifications(session.user.id, {
    notifyCalendar: body.notifyCalendar,
    notifyPages: body.notifyPages,
    notifyDaily: body.notifyDaily,
  })

  return NextResponse.json({ success: true })
}
