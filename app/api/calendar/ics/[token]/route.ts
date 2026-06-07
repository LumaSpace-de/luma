import { NextRequest, NextResponse } from "next/server"

import { getCalendarEvents, getUserIdByCalendarToken } from "@/lib/calendar-db"
import { eventsToICS } from "@/lib/ics"

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const userId = await getUserIdByCalendarToken(params.token)
  if (!userId) {
    return NextResponse.json({ error: "Ungültiger Kalender-Link" }, { status: 404 })
  }

  const events = await getCalendarEvents(userId)
  const ics = eventsToICS(events, "LumaSpace Kalender")

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="lumaspace-kalender.ics"',
      "Cache-Control": "private, max-age=300",
    },
  })
}
