import { supabase } from "./supabase"

export type BlockType = "task_table" | "divider" | "heading" | "callout" | "code" | "quote"

export interface PageBlock {
  id: string
  pageId: string
  type: BlockType
  data: Record<string, unknown>
  position: number
}

// SQL (run once in Supabase):
// CREATE TABLE IF NOT EXISTS page_blocks (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
//   type TEXT NOT NULL,
//   data JSONB NOT NULL DEFAULT '{}',
//   position INTEGER NOT NULL DEFAULT 0,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

function rowToBlock(r: Record<string, unknown>): PageBlock {
  return {
    id: r.id as string,
    pageId: r.page_id as string,
    type: r.type as BlockType,
    data: (r.data as Record<string, unknown>) ?? {},
    position: r.position as number,
  }
}

export async function getBlocksByPage(pageId: string): Promise<PageBlock[]> {
  const { data } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("position", { ascending: true })
  return (data ?? []).map(rowToBlock)
}

export async function createBlock(pageId: string, type: BlockType, data: Record<string, unknown>, position: number): Promise<PageBlock | null> {
  const { data: row } = await supabase
    .from("page_blocks")
    .insert({ page_id: pageId, type, data, position })
    .select()
    .single()
  return row ? rowToBlock(row) : null
}

export async function updateBlock(id: string, patch: { data?: Record<string, unknown>; position?: number }): Promise<void> {
  await supabase.from("page_blocks").update(patch).eq("id", id)
}

export async function deleteBlock(id: string): Promise<void> {
  await supabase.from("page_blocks").delete().eq("id", id)
}
