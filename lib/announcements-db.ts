import { supabase } from "./supabase"

// Required SQL:
// CREATE TABLE IF NOT EXISTS announcements (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   title TEXT NOT NULL,
//   body TEXT NOT NULL,
//   label TEXT,
//   label_icon TEXT,
//   label_color TEXT,
//   embed_title TEXT,
//   embed_description TEXT,
//   embed_color TEXT,
//   embed_footer TEXT,
//   created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS label TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS label_icon TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS label_color TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS embed_title TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS embed_description TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS embed_color TEXT;
// ALTER TABLE announcements ADD COLUMN IF NOT EXISTS embed_footer TEXT;
// CREATE TABLE IF NOT EXISTS announcement_reads (
//   announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   PRIMARY KEY (announcement_id, user_id)
// );

export interface AnnouncementLabel {
  text: string
  icon: string
  color: string
}

export interface AnnouncementEmbed {
  title: string | null
  description: string | null
  color: string | null
  footer: string | null
}

export interface Announcement {
  id: string
  title: string
  body: string
  label: AnnouncementLabel | null
  embed: AnnouncementEmbed | null
  createdAt: string
  read: boolean
}

export interface CreateAnnouncementInput {
  title: string
  body: string
  label?: string | null
  labelIcon?: string | null
  labelColor?: string | null
  embedTitle?: string | null
  embedDescription?: string | null
  embedColor?: string | null
  embedFooter?: string | null
}

export async function createAnnouncement(createdBy: string, input: CreateAnnouncementInput): Promise<void> {
  const { error } = await supabase.from("announcements").insert({
    created_by: createdBy,
    title: input.title,
    body: input.body,
    label: input.label ?? null,
    label_icon: input.labelIcon ?? null,
    label_color: input.labelColor ?? null,
    embed_title: input.embedTitle ?? null,
    embed_description: input.embedDescription ?? null,
    embed_color: input.embedColor ?? null,
    embed_footer: input.embedFooter ?? null,
  })
  if (error) throw new Error(error.message)
}

function toLabel(row: { label: string | null; label_icon: string | null; label_color: string | null }): AnnouncementLabel | null {
  if (!row.label) return null
  return { text: row.label, icon: row.label_icon ?? "Megaphone", color: row.label_color ?? "blue" }
}

function toEmbed(row: {
  embed_title: string | null
  embed_description: string | null
  embed_color: string | null
  embed_footer: string | null
}): AnnouncementEmbed | null {
  if (!row.embed_title && !row.embed_description) return null
  return {
    title: row.embed_title ?? null,
    description: row.embed_description ?? null,
    color: row.embed_color ?? null,
    footer: row.embed_footer ?? null,
  }
}

export async function getAnnouncementsForUser(userId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, label, label_icon, label_color, embed_title, embed_description, embed_color, embed_footer, created_at")
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
    label: toLabel(a as { label: string | null; label_icon: string | null; label_color: string | null }),
    embed: toEmbed(a as { embed_title: string | null; embed_description: string | null; embed_color: string | null; embed_footer: string | null }),
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
