import { supabase } from "./supabase"

// Required SQL:
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS community_enabled BOOLEAN NOT NULL DEFAULT false;
//
// CREATE TABLE IF NOT EXISTS community_channels (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
//   name TEXT NOT NULL,
//   type TEXT NOT NULL DEFAULT 'text',
//   created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   UNIQUE (workspace_id, name)
// );
// -- ALTER TABLE community_channels ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text';
//
// CREATE TABLE IF NOT EXISTS community_posts (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
//   author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   body TEXT NOT NULL,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
//
// CREATE TABLE IF NOT EXISTS community_comments (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
//   author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   body TEXT NOT NULL,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

const DEFAULT_CHANNEL_NAME = "generell"

export type ChannelType = "text" | "news" | "voice"

export interface CommunityChannel {
  id: string
  workspaceId: string
  name: string
  type: ChannelType
  createdAt: string
}

export interface CommunityAuthor {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

export interface CommunityPost {
  id: string
  channelId: string
  body: string
  author: CommunityAuthor
  commentCount: number
  createdAt: string
}

export interface CommunityComment {
  id: string
  postId: string
  body: string
  author: CommunityAuthor
  createdAt: string
}

function toAuthor(u: { id: string; name: string | null; username: string | null; avatar_url: string | null } | null | undefined): CommunityAuthor {
  return {
    id: u?.id ?? "",
    name: u?.name ?? "",
    username: u?.username ?? null,
    avatarUrl: u?.avatar_url ?? null,
  }
}

function toChannel(c: { id: string; workspace_id: string; name: string; type?: string; created_at: string }): CommunityChannel {
  return {
    id: c.id,
    workspaceId: c.workspace_id,
    name: c.name,
    type: (c.type as ChannelType) ?? "text",
    createdAt: c.created_at,
  }
}

export async function isCommunityEnabled(workspaceId: string): Promise<boolean> {
  const { data } = await supabase
    .from("workspaces")
    .select("community_enabled")
    .eq("id", workspaceId)
    .maybeSingle()
  return !!data?.community_enabled
}

export async function setCommunityEnabled(workspaceId: string, ownerId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .update({ community_enabled: enabled })
    .eq("id", workspaceId)
    .eq("owner_id", ownerId)

  if (error) throw new Error(error.message)
  if (enabled) await ensureDefaultChannel(workspaceId, ownerId)
}

async function ensureDefaultChannel(workspaceId: string, createdBy: string): Promise<void> {
  const { data: existing } = await supabase
    .from("community_channels")
    .select("id")
    .eq("workspace_id", workspaceId)
    .limit(1)
  if (existing && existing.length > 0) return
  await supabase
    .from("community_channels")
    .insert({ workspace_id: workspaceId, name: DEFAULT_CHANNEL_NAME, created_by: createdBy })
}

export async function getCommunityChannels(workspaceId: string): Promise<CommunityChannel[]> {
  const { data, error } = await supabase
    .from("community_channels")
    .select("id, workspace_id, name, type, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })

  if (error || !data) return []
  return data.map((c) => toChannel(c as { id: string; workspace_id: string; name: string; type?: string; created_at: string }))
}

export async function createCommunityChannel(workspaceId: string, createdBy: string, name: string, type: ChannelType = "text"): Promise<CommunityChannel> {
  const { data, error } = await supabase
    .from("community_channels")
    .insert({ workspace_id: workspaceId, name, type, created_by: createdBy })
    .select("id, workspace_id, name, type, created_at")
    .single()

  if (error) throw new Error(error.code === "23505" ? "Kanalname bereits vergeben" : error.message)
  return toChannel(data as { id: string; workspace_id: string; name: string; type?: string; created_at: string })
}

export async function deleteCommunityChannel(id: string, workspaceId: string): Promise<void> {
  const { error } = await supabase
    .from("community_channels")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId)
  if (error) throw new Error(error.message)
}

export async function getCommunityPosts(channelId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, channel_id, author_id, body, created_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const postIds = data.map((p) => p.id as string)
  const authorIds = Array.from(new Set(data.map((p) => p.author_id as string)))

  const [{ data: authors }, { data: comments }] = await Promise.all([
    supabase.from("users").select("id, name, username, avatar_url").in("id", authorIds),
    supabase.from("community_comments").select("post_id").in("post_id", postIds),
  ])

  const authorMap = new Map((authors ?? []).map((u) => [u.id as string, u]))
  const commentCounts = new Map<string, number>()
  for (const c of comments ?? []) {
    const id = c.post_id as string
    commentCounts.set(id, (commentCounts.get(id) ?? 0) + 1)
  }

  return data.map((p) => ({
    id: p.id as string,
    channelId: p.channel_id as string,
    body: p.body as string,
    author: toAuthor(authorMap.get(p.author_id as string) as any),
    commentCount: commentCounts.get(p.id as string) ?? 0,
    createdAt: p.created_at as string,
  }))
}

export async function createCommunityPost(channelId: string, authorId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .insert({ channel_id: channelId, author_id: authorId, body })
  if (error) throw new Error(error.message)
}

export async function deleteCommunityPost(id: string, authorId: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", id)
    .eq("author_id", authorId)
  if (error) throw new Error(error.message)
}

export async function getCommunityComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from("community_comments")
    .select("id, post_id, author_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error || !data || data.length === 0) return []

  const authorIds = Array.from(new Set(data.map((c) => c.author_id as string)))
  const { data: authors } = await supabase.from("users").select("id, name, username, avatar_url").in("id", authorIds)
  const authorMap = new Map((authors ?? []).map((u) => [u.id as string, u]))

  return data.map((c) => ({
    id: c.id as string,
    postId: c.post_id as string,
    body: c.body as string,
    author: toAuthor(authorMap.get(c.author_id as string) as any),
    createdAt: c.created_at as string,
  }))
}

export async function createCommunityComment(postId: string, authorId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from("community_comments")
    .insert({ post_id: postId, author_id: authorId, body })
  if (error) throw new Error(error.message)
}

export async function deleteCommunityComment(id: string, authorId: string): Promise<void> {
  const { error } = await supabase
    .from("community_comments")
    .delete()
    .eq("id", id)
    .eq("author_id", authorId)
  if (error) throw new Error(error.message)
}
