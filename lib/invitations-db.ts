import { supabase } from "./supabase"

// Required SQL:
// CREATE TABLE IF NOT EXISTS workspace_invitations (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
//   invited_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   invited_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   status TEXT NOT NULL DEFAULT 'pending',
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   UNIQUE(workspace_id, invited_user_id)
// );

export interface WorkspaceInvitation {
  id: string
  workspaceId: string
  workspaceName: string
  workspaceImageUrl: string | null
  workspacePlan: string
  invitedByName: string
  invitedByEmail: string
  createdAt: string
}

export async function createInvitation(
  workspaceId: string,
  invitedUserId: string,
  invitedById: string
): Promise<void> {
  const { error } = await supabase
    .from("workspace_invitations")
    .insert({ workspace_id: workspaceId, invited_user_id: invitedUserId, invited_by_id: invitedById })
  if (error) throw new Error(error.message)
}

export async function getPendingInvitations(userId: string): Promise<WorkspaceInvitation[]> {
  const { data, error } = await supabase
    .from("workspace_invitations")
    .select("id, workspace_id, invited_by_id, created_at")
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const workspaceIds = Array.from(new Set(data.map((r) => r.workspace_id as string)))
  const inviterIds = Array.from(new Set(data.map((r) => r.invited_by_id as string)))

  const [{ data: workspaces }, { data: inviters }] = await Promise.all([
    supabase.from("workspaces").select("id, name, image_url, plan").in("id", workspaceIds),
    supabase.from("users").select("id, name, email").in("id", inviterIds),
  ])

  const wsMap = new Map((workspaces ?? []).map((w) => [w.id as string, w]))
  const invMap = new Map((inviters ?? []).map((u) => [u.id as string, u]))

  return data.map((r) => {
    const ws = wsMap.get(r.workspace_id as string)
    const inv = invMap.get(r.invited_by_id as string)
    return {
      id: r.id as string,
      workspaceId: r.workspace_id as string,
      workspaceName: (ws?.name as string) ?? "",
      workspaceImageUrl: (ws?.image_url as string | null) ?? null,
      workspacePlan: (ws?.plan as string) ?? "free",
      invitedByName: (inv?.name as string) ?? "",
      invitedByEmail: (inv?.email as string) ?? "",
      createdAt: r.created_at as string,
    }
  })
}

export async function countPendingInvitations(userId: string): Promise<number> {
  const { count } = await supabase
    .from("workspace_invitations")
    .select("id", { count: "exact", head: true })
    .eq("invited_user_id", userId)
    .eq("status", "pending")
  return count ?? 0
}

export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<{ workspaceId: string }> {
  const { data, error } = await supabase
    .from("workspace_invitations")
    .select("workspace_id")
    .eq("id", invitationId)
    .eq("invited_user_id", userId)
    .eq("status", "pending")
    .single()

  if (error || !data) throw new Error("Einladung nicht gefunden")

  const workspaceId = data.workspace_id as string

  await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspaceId, user_id: userId, role: "member" })

  await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId)

  return { workspaceId }
}

export async function declineInvitation(invitationId: string, userId: string): Promise<void> {
  await supabase
    .from("workspace_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId)
    .eq("invited_user_id", userId)
}
