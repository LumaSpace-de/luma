import { supabase } from "./supabase"

export type WorkspacePlan = "free" | "pro" | "enterprise"

export interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  ownerId: string
  createdAt: string
}

export async function getWorkspacesByUser(userId: string): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, plan, owner_id, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })

  if (error || !data) return []

  return data.map((w) => ({
    id: w.id,
    name: w.name,
    plan: w.plan as WorkspacePlan,
    ownerId: w.owner_id,
    createdAt: w.created_at,
  }))
}

export async function createWorkspace(
  name: string,
  plan: WorkspacePlan,
  ownerId: string
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, plan, owner_id: ownerId })
    .select("id, name, plan, owner_id, created_at")
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    name: data.name,
    plan: data.plan as WorkspacePlan,
    ownerId: data.owner_id,
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
