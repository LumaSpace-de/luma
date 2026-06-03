import { supabase } from "./supabase"

// Required SQL (run once in Supabase SQL editor):
// ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS image_url TEXT;
// CREATE TABLE IF NOT EXISTS workspace_members (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   role TEXT NOT NULL DEFAULT 'member',
//   added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   UNIQUE(workspace_id, user_id)
// );

export type WorkspacePlan = "free" | "pro" | "enterprise"

export interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  ownerId: string
  imageUrl: string | null
  createdAt: string
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

export async function getWorkspacesByUser(userId: string): Promise<Workspace[]> {
  // Owned workspaces
  const { data: owned } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, image_url, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })

  // Member workspaces (joined via workspace_members)
  const { data: memberRows } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name, plan, owner_id, image_url, created_at)")
    .eq("user_id", userId)

  const memberWorkspaces = (memberRows ?? [])
    .map((r) => (r.workspaces as unknown as Record<string, unknown> | null))
    .filter(Boolean) as Record<string, unknown>[]

  const toWorkspace = (w: Record<string, unknown>): Workspace => ({
    id: w.id as string,
    name: w.name as string,
    plan: w.plan as WorkspacePlan,
    ownerId: w.owner_id as string,
    imageUrl: (w.image_url as string | null) ?? null,
    createdAt: w.created_at as string,
  })

  const ownedList = (owned ?? []).map(toWorkspace)
  const memberList = memberWorkspaces.map(toWorkspace)

  // Merge, deduplicate by id
  const seen = new Set(ownedList.map((w) => w.id))
  const combined = [...ownedList]
  for (const w of memberList) {
    if (!seen.has(w.id)) combined.push(w)
  }

  return combined
}

export async function getWorkspaceById(id: string, ownerId: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, image_url, created_at")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    plan: data.plan as WorkspacePlan,
    ownerId: data.owner_id,
    imageUrl: data.image_url ?? null,
    createdAt: data.created_at,
  }
}

export async function createWorkspace(
  name: string,
  plan: WorkspacePlan,
  ownerId: string
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, plan, owner_id: ownerId })
    .select("id, name, plan, owner_id, image_url, created_at")
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    name: data.name,
    plan: data.plan as WorkspacePlan,
    ownerId: data.owner_id,
    imageUrl: data.image_url ?? null,
    createdAt: data.created_at,
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

export async function updateWorkspaceImage(id: string, ownerId: string, imageUrl: string): Promise<void> {
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
