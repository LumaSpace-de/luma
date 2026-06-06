import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const userId = session.user.id

  // Get all workspace IDs for user (owner or member)
  const { data: ownedWs } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)

  const { data: memberWs } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)

  const wsIds = [
    ...(ownedWs ?? []).map((w: { id: string }) => w.id),
    ...(memberWs ?? []).map((w: { workspace_id: string }) => w.workspace_id),
  ]

  // Get all pages across workspaces
  const { data: pages } = wsIds.length
    ? await supabase.from("pages").select("id, created_at").in("workspace_id", wsIds)
    : { data: [] }

  // Get all calendar events for user
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, date, created_at")
    .eq("user_id", userId)

  const totalPages = pages?.length ?? 0
  const totalEvents = events?.length ?? 0
  const totalWorkspaces = wsIds.length

  // Build activityByDay map: date string -> count
  const activityByDay: Record<string, number> = {}

  for (const p of pages ?? []) {
    const day = p.created_at.slice(0, 10)
    activityByDay[day] = (activityByDay[day] ?? 0) + 1
  }
  for (const e of events ?? []) {
    // use created_at if available, otherwise the event date
    const raw = (e as { created_at?: string; date: string }).created_at ?? (e as { date: string }).date
    const day = raw.slice(0, 10)
    activityByDay[day] = (activityByDay[day] ?? 0) + 1
  }

  // Streak: walk backward from today
  const todayDate = new Date()
  todayDate.setHours(0,0,0,0)

  let currentStreak = 0
  // current streak: count backwards from today
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayDate)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if ((activityByDay[key] ?? 0) > 0) {
      currentStreak++
    } else {
      break
    }
  }

  // longest streak: scan all days with activity
  let longestStreak = 0
  let tempStreak2 = 0
  for (let i = 364; i >= 0; i--) {
    const d = new Date(todayDate)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if ((activityByDay[key] ?? 0) > 0) {
      tempStreak2++
      longestStreak = Math.max(longestStreak, tempStreak2)
    } else {
      tempStreak2 = 0
    }
  }

  return NextResponse.json({
    totalPages,
    totalEvents,
    totalWorkspaces,
    activityByDay,
    currentStreak,
    longestStreak,
  })
}
