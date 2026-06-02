import { supabase } from "./supabase"

export interface Page {
  id: string
  title: string
  workspaceId: string
  parentId: string | null
  template: string | null
  createdAt: string
}

export async function getPagesByWorkspace(workspaceId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, title, workspace_id, parent_id, template, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })

  if (error || !data) return []

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    workspaceId: p.workspace_id,
    parentId: p.parent_id,
    template: p.template,
    createdAt: p.created_at,
  }))
}

export async function createPage(
  workspaceId: string,
  title: string,
  template: string | null,
  parentId?: string | null
): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .insert({
      workspace_id: workspaceId,
      title,
      template,
      parent_id: parentId ?? null,
    })
    .select("id, title, workspace_id, parent_id, template, created_at")
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    title: data.title,
    workspaceId: data.workspace_id,
    parentId: data.parent_id,
    template: data.template,
    createdAt: data.created_at,
  }
}

export async function updatePageTitle(id: string, title: string): Promise<void> {
  const { error } = await supabase.from("pages").update({ title }).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("pages").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
