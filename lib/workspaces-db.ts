import { supabase } from "./supabase"

// Required SQL (run once in Supabase SQL editor):
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS image_url TEXT;
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS community_enabled BOOLEAN NOT NULL DEFAULT false;
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
// ALTER TABLE pages ADD COLUMN IF NOT EXISTS icon TEXT;
// CREATE TABLE IF NOT EXISTS workspace_members (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   role TEXT NOT NULL DEFAULT 'member',
//   added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   UNIQUE(workspace_id, user_id)
// );

export type WorkspacePlan = "free" | "enterprise"

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer"

export interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  ownerId: string
  imageUrl: string | null
  communityEnabled: boolean
  slug: string | null
  createdAt: string
  userRole: WorkspaceRole
}

export interface PublicWorkspace {
  id: string
  name: string
  plan: WorkspacePlan
  imageUrl: string | null
  slug: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: string
  addedAt: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
}

export async function getUserRoleInWorkspace(
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole | null> {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .maybeSingle()
  if (!ws) return null
  if (ws.owner_id === userId) return "owner"

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle()
  if (!member) return null
  return (member.role ?? "member") as WorkspaceRole
}

export async function getWorkspacesByUser(userId: string): Promise<Workspace[]> {
  // 1. Owned workspaces (excluding private)
  const { data: owned } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
    .eq("owner_id", userId)
    .eq("is_private", false)
    .order("created_at", { ascending: true })

  // 2. Workspaces where user is a member (incl. role)
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId)

  const memberIds = (memberships ?? []).map((m) => m.workspace_id as string).filter(Boolean)

  // Build role map: workspaceId → role
  const roleMap = new Map<string, WorkspaceRole>(
    (memberships ?? []).map((m) => [m.workspace_id as string, (m.role ?? "member") as WorkspaceRole])
  )

  let memberWorkspaces: Workspace[] = []
  if (memberIds.length > 0) {
    const { data: mws } = await supabase
      .from("workspaces")
      .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
      .in("id", memberIds)
      .eq("is_private", false)
    memberWorkspaces = (mws ?? []).map((w) =>
      toWorkspace(w as Record<string, unknown>, roleMap.get(w.id as string) ?? "member")
    )
  }

  const ownedList = (owned ?? []).map((w) => toWorkspace(w as Record<string, unknown>, "owner"))
  const seen = new Set(ownedList.map((w) => w.id))
  const combined = [...ownedList]
  for (const w of memberWorkspaces) {
    if (!seen.has(w.id)) combined.push(w)
  }
  return combined
}

function toWorkspace(w: Record<string, unknown>, role: WorkspaceRole = "member"): Workspace {
  return {
    id: w.id as string,
    name: w.name as string,
    plan: w.plan as WorkspacePlan,
    ownerId: w.owner_id as string,
    imageUrl: (w.image_url as string | null) ?? null,
    communityEnabled: !!w.community_enabled,
    slug: null,
    createdAt: w.created_at as string,
    userRole: role,
  }
}

export async function getWorkspaceById(id: string, ownerId: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single()

  if (error || !data) return null
  return toWorkspace(data as Record<string, unknown>)
}

export async function createWorkspace(
  name: string,
  plan: WorkspacePlan,
  ownerId: string
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, plan, owner_id: ownerId })
    .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    name: data.name,
    plan: data.plan as WorkspacePlan,
    ownerId: data.owner_id,
    imageUrl: data.image_url ?? null,
    communityEnabled: !!data.community_enabled,
    slug: null,
    createdAt: data.created_at,
    userRole: "owner" as WorkspaceRole,
  }
}

export async function deleteWorkspace(id: string, ownerId: string): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId)

  if (error) throw new Error(error.message)
}

export async function updateWorkspaceName(id: string, ownerId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", id)
    .eq("owner_id", ownerId)

  if (error) throw new Error(error.message)
}

export async function updateWorkspaceImage(id: string, ownerId: string, imageUrl: string | null): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .update({ image_url: imageUrl })
    .eq("id", id)
    .eq("owner_id", ownerId)

  if (error) throw new Error(error.message)
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, added_at, users(name, email, username, avatar_url)")
    .eq("workspace_id", workspaceId)
    .order("added_at", { ascending: true })

  if (error || !data) return []

  return (data as any[]).map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    userId: r.user_id,
    role: r.role,
    addedAt: r.added_at,
    name: r.users?.name ?? "",
    email: r.users?.email ?? "",
    username: r.users?.username ?? null,
    avatarUrl: r.users?.avatar_url ?? null,
  }))
}

export async function addWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspaceId, user_id: userId, role: "member" })

  if (error) throw new Error(error.message)
}

export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
}

export async function removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
}

export async function getWorkspaceSlug(workspaceId: string, ownerId: string): Promise<string | null> {
  const { data } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspaceId)
    .eq("owner_id", ownerId)
    .maybeSingle()
  return (data?.slug as string | null) ?? null
}

export async function setWorkspaceSlug(workspaceId: string, ownerId: string, slug: string | null): Promise<void> {
  const { error } = await supabase
    .from("workspaces")
    .update({ slug })
    .eq("id", workspaceId)
    .eq("owner_id", ownerId)
    .eq("plan", "enterprise")

  if (error) throw new Error(error.code === "23505" ? "Dieser Slug ist bereits vergeben" : error.message)
}

export async function getWorkspaceBySlug(slug: string): Promise<PublicWorkspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, plan, image_url, slug")
    .eq("slug", slug)
    .eq("plan", "enterprise")
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id as string,
    name: data.name as string,
    plan: data.plan as WorkspacePlan,
    imageUrl: (data.image_url as string | null) ?? null,
    slug: data.slug as string,
  }
}

export async function getOrCreatePrivateWorkspace(userId: string): Promise<Workspace> {
  const { data: existing } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
    .eq("owner_id", userId)
    .eq("is_private", true)
    .maybeSingle()

  if (existing) return toWorkspace(existing as Record<string, unknown>, "owner")

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name: "Privat", plan: "free", owner_id: userId, is_private: true })
    .select("id, name, plan, owner_id, image_url, community_enabled, created_at")
    .single()

  if (error) throw new Error(error.message)
  return toWorkspace(data as Record<string, unknown>, "owner")
}
