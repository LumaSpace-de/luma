import { supabase } from "./supabase"

// Required SQL:
// CREATE TABLE IF NOT EXISTS workspace_roles (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
//   name TEXT NOT NULL,
//   color TEXT NOT NULL DEFAULT 'gray',
//   permissions JSONB NOT NULL DEFAULT '{}',
//   position INTEGER NOT NULL DEFAULT 0,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   UNIQUE (workspace_id, name)
// );

export interface RolePermissions {
  manageChannels?: boolean
  managePosts?: boolean
  manageMembers?: boolean
  manageRoles?: boolean
  sendMessages?: boolean
  createPosts?: boolean
}

export const DEFAULT_PERMISSIONS: RolePermissions = {
  manageChannels: false,
  managePosts: false,
  manageMembers: false,
  manageRoles: false,
  sendMessages: true,
  createPosts: true,
}

export interface WorkspaceCustomRole {
  id: string
  workspaceId: string
  name: string
  color: string
  permissions: RolePermissions
  position: number
  createdAt: string
}

function toRole(r: Record<string, unknown>): WorkspaceCustomRole {
  return {
    id: r.id as string,
    workspaceId: r.workspace_id as string,
    name: r.name as string,
    color: (r.color as string) ?? "gray",
    permissions: { ...DEFAULT_PERMISSIONS, ...(r.permissions as RolePermissions ?? {}) },
    position: (r.position as number) ?? 0,
    createdAt: r.created_at as string,
  }
}

export async function getWorkspaceRoles(workspaceId: string): Promise<WorkspaceCustomRole[]> {
  const { data, error } = await supabase
    .from("workspace_roles")
    .select("id, workspace_id, name, color, permissions, position, created_at")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true })

  if (error || !data) return []
  return data.map((r) => toRole(r as Record<string, unknown>))
}

export async function createWorkspaceRole(
  workspaceId: string,
  name: string,
  color: string,
  permissions: RolePermissions
): Promise<WorkspaceCustomRole> {
  const { data: maxPos } = await supabase
    .from("workspace_roles")
    .select("position")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = ((maxPos?.position as number) ?? -1) + 1

  const { data, error } = await supabase
    .from("workspace_roles")
    .insert({ workspace_id: workspaceId, name, color, permissions, position })
    .select("id, workspace_id, name, color, permissions, position, created_at")
    .single()

  if (error) throw new Error(error.code === "23505" ? "Rollenname bereits vergeben" : error.message)
  return toRole(data as Record<string, unknown>)
}

export async function updateWorkspaceRole(
  id: string,
  workspaceId: string,
  updates: { name?: string; color?: string; permissions?: RolePermissions }
): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.permissions !== undefined) updateData.permissions = updates.permissions

  const { error } = await supabase
    .from("workspace_roles")
    .update(updateData)
    .eq("id", id)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.code === "23505" ? "Rollenname bereits vergeben" : error.message)
}

export async function deleteWorkspaceRole(id: string, workspaceId: string): Promise<void> {
  const { error } = await supabase
    .from("workspace_roles")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId)
  if (error) throw new Error(error.message)
}
