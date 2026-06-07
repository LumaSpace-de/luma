import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createCalendarEvent, getCalendarEvents } from "@/lib/calendar-db"
import { CalendarEvent } from "@/types/calendar"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const events = await getCalendarEvents(session.user.id)
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Titel erforderlich" }, { status: 400 })
  }
  if (!body.date) {
    return NextResponse.json({ error: "Datum erforderlich" }, { status: 400 })
  }

  const event: CalendarEvent = {
    id: body.id ?? crypto.randomUUID(),
    title: body.title.trim(),
    date: body.date,
    time: body.time ?? undefined,
    endTime: body.endTime ?? undefined,
    location: body.location ?? undefined,
    color: body.color ?? "blue",
    description: body.description ?? undefined,
    allDay: body.allDay ?? false,
    labelId: body.labelId ?? undefined,
    recurrence: body.recurrence ?? undefined,
    pageId: body.pageId ?? undefined,
    pageTitle: body.pageTitle ?? undefined,
    reminderMinutes: body.reminderMinutes ?? undefined,
  }

  const created = await createCalendarEvent(session.user.id, event)
  return NextResponse.json(created, { status: 201 })
}
