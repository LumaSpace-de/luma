import { supabase } from "./supabase"
import { CalendarEvent, EventColor } from "@/types/calendar"

// Required SQL (run once in Supabase SQL editor):
// CREATE TABLE IF NOT EXISTS calendar_events (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   title TEXT NOT NULL,
//   date TEXT NOT NULL,
//   time TEXT,
//   end_time TEXT,
//   location TEXT,
//   color TEXT NOT NULL DEFAULT 'blue',
//   description TEXT,
//   all_day BOOLEAN NOT NULL DEFAULT false,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

function rowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    time: (row.time as string | null) ?? undefined,
    endTime: (row.end_time as string | null) ?? undefined,
    location: (row.location as string | null) ?? undefined,
    color: (row.color as EventColor) ?? "blue",
    description: (row.description as string | null) ?? undefined,
    allDay: (row.all_day as boolean | null) ?? false,
  }
}

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  if (error || !data) return []
  return data.map(rowToEvent)
}

export async function createCalendarEvent(
  userId: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("calendar_events")
    .upsert({
      id: event.id,
      user_id: userId,
      title: event.title,
      date: event.date,
      time: event.time ?? null,
      end_time: event.endTime ?? null,
      location: event.location ?? null,
      color: event.color,
      description: event.description ?? null,
      all_day: event.allDay ?? false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToEvent(data)
}

export async function updateCalendarEvent(
  id: string,
  userId: string,
  patch: Partial<Omit<CalendarEvent, "id">>
): Promise<void> {
  const update: Record<string, unknown> = {}
  if (patch.title !== undefined) update.title = patch.title
  if (patch.date !== undefined) update.date = patch.date
  if (patch.time !== undefined) update.time = patch.time ?? null
  if (patch.endTime !== undefined) update.end_time = patch.endTime ?? null
  if (patch.location !== undefined) update.location = patch.location ?? null
  if (patch.color !== undefined) update.color = patch.color
  if (patch.description !== undefined) update.description = patch.description ?? null
  if (patch.allDay !== undefined) update.all_day = patch.allDay

  const { error } = await supabase
    .from("calendar_events")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
}

export async function deleteCalendarEvent(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
}
