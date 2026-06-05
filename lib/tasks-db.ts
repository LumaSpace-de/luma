import { supabase } from "./supabase"

export interface PageTask {
  id: string
  pageId: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate: string | null
  createdAt: string
}

// Required SQL (run once in Supabase):
// CREATE TABLE IF NOT EXISTS page_tasks (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
//   title TEXT NOT NULL DEFAULT '',
//   status TEXT NOT NULL DEFAULT 'todo',
//   priority TEXT NOT NULL DEFAULT 'medium',
//   due_date TEXT,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

function rowToTask(r: Record<string, unknown>): PageTask {
  return {
    id: r.id as string,
    pageId: r.page_id as string,
    title: r.title as string,
    status: (r.status as PageTask["status"]) ?? "todo",
    priority: (r.priority as PageTask["priority"]) ?? "medium",
    dueDate: (r.due_date as string | null) ?? null,
    createdAt: r.created_at as string,
  }
}

export async function getTasksByPage(pageId: string): Promise<PageTask[]> {
  const { data, error } = await supabase
    .from("page_tasks")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return data.map(rowToTask)
}

export async function createTask(pageId: string, title: string): Promise<PageTask | null> {
  const { data, error } = await supabase
    .from("page_tasks")
    .insert({ page_id: pageId, title })
    .select()
    .single()
  if (error || !data) return null
  return rowToTask(data)
}

export async function updateTask(id: string, patch: Partial<Omit<PageTask, "id" | "pageId" | "createdAt">>): Promise<void> {
  const dbPatch: Record<string, unknown> = {}
  if ("title" in patch) dbPatch.title = patch.title
  if ("status" in patch) dbPatch.status = patch.status
  if ("priority" in patch) dbPatch.priority = patch.priority
  if ("dueDate" in patch) dbPatch.due_date = patch.dueDate
  await supabase.from("page_tasks").update(dbPatch).eq("id", id)
}

export async function deleteTask(id: string): Promise<void> {
  await supabase.from("page_tasks").delete().eq("id", id)
}
