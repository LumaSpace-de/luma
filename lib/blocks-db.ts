import { supabase } from "./supabase"

export type BlockType = "task_table" | "data_table" | "divider" | "heading" | "callout" | "code" | "quote" | "page_link" | "pnl_calendar" | "mexc_portfolio" | "daily_notes" | "checklist" | "embed" | "image" | "progress" | "bookmark" | "habit_tracker" | "trade_logs"

export interface PageBlock {
  id: string
  pageId: string
  type: BlockType
  data: Record<string, unknown>
  position: number
}

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
  const { data, error } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("position", { ascending: true })
  if (error || !data) return []
  return data.map(rowToBlock)
}

export async function createBlock(
  pageId: string,
  type: BlockType,
  data: Record<string, unknown>,
  position: number
): Promise<PageBlock | null> {
  const { data: d, error } = await supabase
    .from("page_blocks")
    .insert({ page_id: pageId, type, data, position })
    .select()
    .single()
  if (error || !d) return null
  return rowToBlock(d)
}

export async function updateBlock(
  id: string,
  patch: Partial<{ data: Record<string, unknown>; position: number }>
): Promise<void> {
  await supabase.from("page_blocks").update(patch).eq("id", id)
}

export async function deleteBlock(id: string): Promise<void> {
  await supabase.from("page_blocks").delete().eq("id", id)
}
