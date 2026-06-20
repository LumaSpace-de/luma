"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  CheckSquare,
  Code2,
  ExternalLink,
  FileText,
  GripVertical,
  Heading1,
  Minus,
  Plus,
  Quote,
  Table2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PageBlock, BlockType } from "@/lib/blocks-db"
import { PageTaskTable } from "@/components/page-task-table"
import { PageDataTable } from "@/components/page-data-table"

// ── Block menu definition ──────────────────────────────────────────────────

const BLOCK_TYPES: {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    type: "task_table",
    label: "Aufgabentabelle",
    description: "Tasks mit Status & Priorität",
    icon: <CheckSquare className="h-4 w-4 text-blue-400" />,
  },
  {
    type: "data_table",
    label: "Datenbank",
    description: "Freie Tabelle mit eigenen Spalten",
    icon: <Table2 className="h-4 w-4 text-teal-400" />,
  },
  {
    type: "heading",
    label: "Überschrift",
    description: "H1, H2 oder H3",
    icon: <Heading1 className="h-4 w-4 text-purple-400" />,
  },
  {
    type: "callout",
    label: "Hinweis",
    description: "Info, Warnung oder Erfolg",
    icon: <AlertCircle className="h-4 w-4 text-yellow-400" />,
  },
  {
    type: "quote",
    label: "Zitat",
    description: "Hervorgehobenes Zitat",
    icon: <Quote className="h-4 w-4 text-green-400" />,
  },
  {
    type: "code",
    label: "Code-Block",
    description: "Formatierter Code",
    icon: <Code2 className="h-4 w-4 text-orange-400" />,
  },
  {
    type: "page_link",
    label: "Seitenvorschau",
    description: "Vorschau einer anderen Seite",
    icon: <ExternalLink className="h-4 w-4 text-cyan-400" />,
  },
  {
    type: "divider",
    label: "Trennlinie",
    description: "Horizontaler Trenner",
    icon: <Minus className="h-4 w-4 text-muted-foreground" />,
  },
]

// ── Individual block renderers ─────────────────────────────────────────────

function DividerBlock() {
  return <hr className="border-border/50" />
}

function HeadingBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const level = (data.level as number) ?? 1
  const text  = (data.text as string) ?? ""
  const sizeClass = level === 1 ? "text-2xl font-bold" : level === 2 ? "text-xl font-semibold" : "text-lg font-medium"

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <select value={level} onChange={e => onChange({ ...data, level: Number(e.target.value) })}
          className="shrink-0 rounded border border-border/40 bg-background px-1 py-0.5 text-xs text-muted-foreground">
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      )}
      <input disabled={!canEdit} value={text} onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Überschrift…"
        className={cn("flex-1 bg-transparent outline-none placeholder:text-muted-foreground/30 disabled:cursor-default", sizeClass)} />
    </div>
  )
}

const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  info:    { border: "border-blue-500/40",   bg: "bg-blue-500/8",   icon: "ℹ️" },
  warning: { border: "border-yellow-500/40", bg: "bg-yellow-500/8", icon: "⚠️" },
  success: { border: "border-green-500/40",  bg: "bg-green-500/8",  icon: "✅" },
  error:   { border: "border-red-500/40",    bg: "bg-red-500/8",    icon: "❌" },
}

function CalloutBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const variant = (data.variant as string) ?? "info"
  const text    = (data.text as string) ?? ""
  const s = CALLOUT_STYLES[variant] ?? CALLOUT_STYLES.info

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", s.border, s.bg)}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{s.icon}</span>
      <div className="flex flex-1 flex-col gap-2">
        {canEdit && (
          <select value={variant} onChange={e => onChange({ ...data, variant: e.target.value })}
            className="w-fit rounded border border-border/40 bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
            <option value="info">Info</option>
            <option value="warning">Warnung</option>
            <option value="success">Erfolg</option>
            <option value="error">Fehler</option>
          </select>
        )}
        <textarea disabled={!canEdit} value={text} rows={2}
          onChange={e => onChange({ ...data, text: e.target.value })}
          placeholder="Hinweistext…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 disabled:cursor-default" />
      </div>
    </div>
  )
}

function QuoteBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const text = (data.text as string) ?? ""
  return (
    <div className="border-l-4 border-primary/40 pl-4">
      <textarea disabled={!canEdit} value={text} rows={2}
        onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Zitat…"
        className="w-full resize-none bg-transparent text-base italic leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/40 disabled:cursor-default" />
    </div>
  )
}

function CodeBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const lang = (data.lang as string) ?? ""
  const code = (data.code as string) ?? ""
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/40">
      {canEdit && (
        <div className="flex items-center border-b border-border/30 bg-muted/60 px-3 py-1.5">
          <input value={lang} onChange={e => onChange({ ...data, lang: e.target.value })}
            placeholder="Sprache (z.B. typescript)"
            className="bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
        </div>
      )}
      {!canEdit && lang && (
        <div className="border-b border-border/30 bg-muted/60 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">{lang}</span>
        </div>
      )}
      <textarea disabled={!canEdit} value={code} rows={5}
        onChange={e => onChange({ ...data, code: e.target.value })}
        placeholder="Code eingeben…"
        className="w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 disabled:cursor-default"
        spellCheck={false} />
    </div>
  )
}

function PageLinkBlock({
  data, canEdit, onChange, workspaceId,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
  workspaceId?: string
}) {
  const linkedPageId = (data.pageId as string) ?? ""
  const [pages, setPages] = useState<{ id: string; title: string; icon: string | null }[]>([])
  const [preview, setPreview] = useState<{ title: string; icon: string | null; content: string | null } | null>(null)
  const [loadingPages, setLoadingPages] = useState(false)

  useEffect(() => {
    if (!linkedPageId) { setPreview(null); return }
    fetch(`/api/pages/${linkedPageId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.title) setPreview({ title: d.title, icon: d.icon ?? null, content: d.content ?? null }) })
      .catch(() => {})
  }, [linkedPageId])

  function loadPages() {
    if (!workspaceId || pages.length > 0) return
    setLoadingPages(true)
    fetch(`/api/pages?workspaceId=${workspaceId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setPages(d) })
      .catch(() => {})
      .finally(() => setLoadingPages(false))
  }

  if (!linkedPageId && canEdit) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Seite auswählen:</p>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value=""
          onFocus={loadPages}
          onChange={e => { if (e.target.value) onChange({ ...data, pageId: e.target.value }) }}
        >
          <option value="">{loadingPages ? "Lädt…" : "— Seite wählen —"}</option>
          {pages.map(p => (
            <option key={p.id} value={p.id}>{p.icon ? `${p.icon} ` : ""}{p.title}</option>
          ))}
        </select>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        {linkedPageId ? "Seite wird geladen…" : "Keine Seite verknüpft"}
      </div>
    )
  }

  const snippet = preview.content ? preview.content.slice(0, 120) + (preview.content.length > 120 ? "…" : "") : ""

  return (
    <Link
      href={`/pages/${linkedPageId}`}
      className="group flex items-start gap-3 rounded-xl border bg-card/60 p-4 transition-colors hover:bg-accent/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
        {preview.icon ?? <FileText className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{preview.title}</p>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        {snippet && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{snippet}</p>}
      </div>
    </Link>
  )
}

// ── Block wrapper with drag handle + delete ────────────────────────────────

function BlockWrapper({
  block, canEdit, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd, onDelete, children,
}: {
  block: PageBlock
  canEdit: boolean
  isDragOver: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
  onDelete: () => void
  children: React.ReactNode
}) {
  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn("group relative transition-all", isDragOver && "border-t-2 border-primary pt-2")}
    >
      {canEdit && (
        <div className="absolute -left-7 top-0 flex h-full flex-col items-center justify-start pt-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="cursor-grab rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-muted-foreground active:cursor-grabbing" title="Verschieben">
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-destructive" title="Block löschen">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {children}
    </div>
  )
}

// ── Main PageBlocks component ──────────────────────────────────────────────

interface PageBlocksProps {
  pageId: string
  canEdit: boolean
  workspaceId?: string
}

export function PageBlocks({ pageId, canEdit, workspaceId }: PageBlocksProps) {
  const [blocks, setBlocks]             = useState<PageBlock[]>([])
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dragIndex, setDragIndex]       = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const menuRef  = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/pages/${pageId}/blocks`)
      .then(r => r.ok ? r.json() : [])
      .then(setBlocks)
  }, [pageId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function addBlock(type: BlockType) {
    setMenuOpen(false)
    const position = blocks.length
    const defaultData: Record<string, unknown> =
      type === "heading" ? { level: 2, text: "" }
      : type === "callout" ? { variant: "info", text: "" }
      : type === "code"    ? { lang: "", code: "" }
      : type === "quote"   ? { text: "" }
      : type === "page_link" ? { pageId: "" }
      : {}

    const optimistic: PageBlock = { id: crypto.randomUUID(), pageId, type, data: defaultData, position }
    setBlocks(prev => [...prev, optimistic])

    const res = await fetch(`/api/pages/${pageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data: defaultData, position }),
    })
    if (res.ok) {
      const created: PageBlock = await res.json()
      setBlocks(prev => prev.map(b => b.id === optimistic.id ? created : b))
    } else {
      setBlocks(prev => prev.filter(b => b.id !== optimistic.id))
    }
  }

  function updateBlockData(id: string, data: Record<string, unknown>) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/pages/${pageId}/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
    }, 600)
  }

  async function removeBlock(id: string) {
    const block = blocks.find(b => b.id === id)
    if (block?.type === "task_table" || block?.type === "data_table") {
      const tasks: { id: string }[] = await fetch(`/api/pages/${pageId}/tasks?blockId=${id}`).then(r => r.ok ? r.json() : [])
      await Promise.all(tasks.map(t => fetch(`/api/pages/${pageId}/tasks/${t.id}`, { method: "DELETE" })))
    }
    setBlocks(prev => prev.filter(b => b.id !== id))
    await fetch(`/api/pages/${pageId}/blocks/${id}`, { method: "DELETE" })
  }

  function handleDragStart(index: number) { setDragIndex(index) }
  function handleDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOverIndex(index) }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null) }

  async function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) { handleDragEnd(); return }
    const reordered = [...blocks]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    const withPositions = reordered.map((b, i) => ({ ...b, position: i }))
    setBlocks(withPositions)
    handleDragEnd()
    await Promise.all(
      withPositions.map(b =>
        fetch(`/api/pages/${pageId}/blocks/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: b.position }),
        })
      )
    )
  }

  return (
    <div className="mt-2">
      {blocks.length > 0 && (
        <div className="flex flex-col gap-3 pl-7 mb-4">
          {blocks.map((block, i) => (
            <BlockWrapper
              key={block.id}
              block={block}
              canEdit={canEdit}
              isDragOver={dragOverIndex === i && dragIndex !== i}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              onDelete={() => removeBlock(block.id)}
            >
              {block.type === "task_table" && (
                <PageTaskTable
                  pageId={pageId}
                  blockId={block.id}
                  canEdit={canEdit}
                  blockData={block.data}
                  onBlockDataChange={d => updateBlockData(block.id, d)}
                  onRemoveTable={() => removeBlock(block.id)}
                />
              )}
              {block.type === "data_table" && (
                <PageDataTable
                  pageId={pageId}
                  blockId={block.id}
                  canEdit={canEdit}
                  blockData={block.data}
                  onBlockDataChange={d => updateBlockData(block.id, d)}
                  onRemoveTable={() => removeBlock(block.id)}
                />
              )}
              {block.type === "divider" && <DividerBlock />}
              {block.type === "heading" && (
                <HeadingBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "callout" && (
                <CalloutBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "quote" && (
                <QuoteBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "code" && (
                <CodeBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "page_link" && (
                <PageLinkBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} workspaceId={workspaceId} />
              )}
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Centered + pill button */}
      {canEdit && (
        <div ref={menuRef} className="relative flex justify-center">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background shadow-md transition-opacity hover:opacity-80"
          >
            <Plus className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border bg-popover shadow-xl">
              <div className="border-b border-border/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Block einfügen
              </div>
              {BLOCK_TYPES.map(bt => (
                <button key={bt.type} onClick={() => addBlock(bt.type)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted">
                    {bt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{bt.label}</p>
                    <p className="text-xs text-muted-foreground">{bt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
