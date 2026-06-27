import { NextRequest, NextResponse } from "next/server"

import { supabase } from "@/lib/supabase"
import { sendDiscordDMEmbed } from "@/lib/discord"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const currentHour = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, date, time, description, reminder_minutes, user_id")
    .eq("date", todayStr)
    .not("reminder_minutes", "is", null)
    .not("time", "is", null)

  if (!events || events.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const event of events) {
    const [eventHour, eventMinute] = (event.time as string).split(":").map(Number)
    const eventMinutesFromMidnight = eventHour * 60 + eventMinute
    const nowMinutesFromMidnight = currentHour * 60 + currentMinute
    const diff = eventMinutesFromMidnight - nowMinutesFromMidnight

    if (diff < 0 || diff > (event.reminder_minutes as number)) continue

    const tolerance = 5
    const targetDiff = event.reminder_minutes as number
    if (Math.abs(diff - targetDiff) > tolerance) continue

    const { data: user } = await supabase
      .from("users")
      .select("discord_user_id, name, dc_notify_calendar")
      .eq("id", event.user_id)
      .maybeSingle()

    if (!user?.discord_user_id || !user.dc_notify_calendar) continue

    const timeStr = event.time as string
    const minutesLabel = event.reminder_minutes === 1 ? "Minute" : "Minuten"

    const success = await sendDiscordDMEmbed(user.discord_user_id, {
      title: `📅 ${event.title}`,
      description: `In **${event.reminder_minutes} ${minutesLabel}** um **${timeStr} Uhr**${event.description ? `\n\n${event.description}` : ""}`,
      color: 0x7c3aed,
    })

    if (success) sent++
  }

  return NextResponse.json({ sent, checked: events.length })
}
