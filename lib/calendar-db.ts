import { supabase } from "./supabase"
import { CalendarEvent, EventColor, RecurrenceFrequency } from "@/types/calendar"

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
//   label_id TEXT,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS label_id TEXT;
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence TEXT;
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS page_title TEXT;
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER;
// ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS end_date TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_ics_token TEXT;

function rowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    endDate: (row.end_date as string | null) ?? undefined,
    time: (row.time as string | null) ?? undefined,
    endTime: (row.end_time as string | null) ?? undefined,
    location: (row.location as string | null) ?? undefined,
    color: (row.color as EventColor) ?? "blue",
    description: (row.description as string | null) ?? undefined,
    allDay: (row.all_day as boolean | null) ?? false,
    labelId: (row.label_id as string | null) ?? undefined,
    recurrence: ((row.recurrence as string | null) ?? "none") as RecurrenceFrequency,
    pageId: (row.page_id as string | null) ?? undefined,
    pageTitle: (row.page_title as string | null) ?? undefined,
    reminderMinutes: (row.reminder_minutes as number | null) ?? undefined,
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
      end_date: event.endDate ?? null,
      time: event.time ?? null,
      end_time: event.endTime ?? null,
      location: event.location ?? null,
      color: event.color,
      description: event.description ?? null,
      all_day: event.allDay ?? false,
      label_id: event.labelId ?? null,
      recurrence: event.recurrence && event.recurrence !== "none" ? event.recurrence : null,
      page_id: event.pageId ?? null,
      page_title: event.pageTitle ?? null,
      reminder_minutes: event.reminderMinutes ?? null,
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
  if ("endDate" in patch) update.end_date = patch.endDate ?? null
  if (patch.time !== undefined) update.time = patch.time ?? null
  if (patch.endTime !== undefined) update.end_time = patch.endTime ?? null
  if (patch.location !== undefined) update.location = patch.location ?? null
  if (patch.color !== undefined) update.color = patch.color
  if (patch.description !== undefined) update.description = patch.description ?? null
  if (patch.allDay !== undefined) update.all_day = patch.allDay
  if ("labelId" in patch) update.label_id = patch.labelId ?? null
  if ("recurrence" in patch) update.recurrence = patch.recurrence && patch.recurrence !== "none" ? patch.recurrence : null
  if ("pageId" in patch) update.page_id = patch.pageId ?? null
  if ("pageTitle" in patch) update.page_title = patch.pageTitle ?? null
  if ("reminderMinutes" in patch) update.reminder_minutes = patch.reminderMinutes ?? null

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

export async function getOrCreateCalendarToken(userId: string): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("calendar_ics_token")
    .eq("id", userId)
    .maybeSingle()

  if (data?.calendar_ics_token) return data.calendar_ics_token as string

  const token = crypto.randomUUID().replace(/-/g, "")
  const { error } = await supabase
    .from("users")
    .update({ calendar_ics_token: token })
    .eq("id", userId)

  if (error) throw new Error(error.message)
  return token
}

export async function getUserIdByCalendarToken(token: string): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("calendar_ics_token", token)
    .maybeSingle()

  return (data?.id as string | undefined) ?? null
}
