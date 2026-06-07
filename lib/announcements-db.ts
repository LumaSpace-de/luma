import { supabase } from "./supabase"

// Required SQL:
// CREATE TABLE IF NOT EXISTS announcements (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   title TEXT NOT NULL,
//   body TEXT NOT NULL,
//   created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// CREATE TABLE IF NOT EXISTS announcement_reads (
//   announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   PRIMARY KEY (announcement_id, user_id)
// );

export interface Announcement {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export async function createAnnouncement(createdBy: string, title: string, body: string): Promise<void> {
  const { error } = await supabase
    .from("announcements")
    .insert({ created_by: createdBy, title, body })
  if (error) throw new Error(error.message)
}

export async function getAnnouncementsForUser(userId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId)

  const readSet = new Set((reads ?? []).map((r) => r.announcement_id as string))

  return data.map((a) => ({
    id: a.id as string,
    title: a.title as string,
    body: a.body as string,
    createdAt: a.created_at as string,
    read: readSet.has(a.id as string),
  }))
}

export async function countUnreadAnnouncements(userId: string): Promise<number> {
  const { data: all } = await supabase.from("announcements").select("id")
  if (!all || all.length === 0) return 0

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId)

  const readSet = new Set((reads ?? []).map((r) => r.announcement_id as string))
  return all.filter((a) => !readSet.has(a.id as string)).length
}

export async function markAnnouncementRead(announcementId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("announcement_reads")
    .upsert({ announcement_id: announcementId, user_id: userId }, { onConflict: "announcement_id,user_id" })
  if (error) throw new Error(error.message)
}

export async function deleteAnnouncement(id: string, createdBy: string): Promise<void> {
  await supabase.from("announcements").delete().eq("id", id).eq("created_by", createdBy)
}
