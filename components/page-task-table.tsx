"use client"

import { useEffect, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { CalendarPlus, Check, ChevronDown, GripVertical, Plus, Settings2, Trash2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  rowData: Record<string, string>
}

interface SelectOption {
  id: string
  label: string
  color: string
}

interface CustomColumn {
  id: string
  label: string
  type: "text" | "number" | "date" | "select"
  options?: SelectOption[]
}

// ── Color palette ──────────────────────────────────────────────────────────

const DOT_COLORS = [
  { id: "gray",   cls: "bg-zinc-500" },
  { id: "blue",   cls: "bg-blue-400" },
  { id: "green",  cls: "bg-green-500" },
  { id: "red",    cls: "bg-red-400" },
  { id: "yellow", cls: "bg-yellow-400" },
  { id: "purple", cls: "bg-purple-400" },
  { id: "orange", cls: "bg-orange-400" },
  { id: "pink",   cls: "bg-pink-400" },
]
const dotCls = (color: string) => DOT_COLORS.find(c => c.id === color)?.cls ?? "bg-zinc-500"

function normalizeOptions(opts: unknown): SelectOption[] {
  if (!Array.isArray(opts)) return []
  return opts.map(o => {
    if (typeof o === "string") return { id: o, label: o, color: "gray" }
    const x = o as Partial<SelectOption>
    return { id: x.id ?? x.label ?? "", label: x.label ?? "", color: x.color ?? "gray" }
  })
}

// ── Option lists ───────────────────────────────────────────────────────────

const STATUS_OPTS = [
  { value: "todo" as const,        label: "Offen",     color: "text-muted-foreground" },
  { value: "in_progress" as const, label: "In Arbeit", color: "text-blue-400" },
  { value: "done" as const,        label: "Erledigt",  color: "text-green-500" },
]

const PRIORITY_OPTS = [
  { value: "low" as const,    label: "Niedrig", dot: "bg-muted-foreground/50" },
  { value: "medium" as const, label: "Mittel",  dot: "bg-yellow-400" },
  { value: "high" as const,   label: "Hoch",    dot: "bg-red-400" },
]

const COL_TYPE_LABELS: Record<CustomColumn["type"], string> = {
  text: "Text", number: "Zahl", date: "Datum", select: "Auswahl",
}

// ── Generic MiniSelect (status / priority) ─────────────────────────────────

function MiniSelect<T extends string>({
  value, options, onChange, disabled, renderTrigger, renderItem,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  disabled: boolean
  renderTrigger: (v: T) => React.ReactNode
  renderItem: (o: { value: T; label: string }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setRect({ top: r.bottom + 4, left: r.left })
    }
    setOpen(o => !o)
  }

  if (disabled) return <>{renderTrigger(value)}</>
  return (
    <div className="relative">
      <button ref={btnRef} onClick={handleOpen} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:bg-accent/60 transition-colors">
        {renderTrigger(value)}
        <ChevronDown className="h-3 w-3 opacity-40" />
      </button>
      {open && rect && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed z-50 min-w-[110px] overflow-hidden rounded-lg border bg-popover shadow-lg" style={{ top: rect.top, left: rect.left }}>
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                {renderItem(o)}
                {o.value === value && <Check className="ml-auto h-3 w-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Colored select cell (custom select columns) ────────────────────────────

function ColoredSelectCell({ options, value, onChange, disabled }: {
  options: SelectOption[]
  value: string
  onChange: (id: string) => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const current = options.find(o => o.id === value)

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setRect({ top: r.bottom + 4, left: r.left })
    }
    setOpen(o => !o)
  }

  if (disabled) return current ? (
    <span className="flex items-center gap-1.5 text-xs">
      <span className={cn("h-2 w-2 rounded-full shrink-0", dotCls(current.color))} />
      {current.label}
    </span>
  ) : <span className="text-xs text-muted-foreground/30">—</span>

  return (
    <div className="relative">
      <button ref={btnRef} onClick={handleOpen} className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs hover:bg-accent/60 transition-colors">
        {current ? (
          <>
            <span className={cn("h-2 w-2 rounded-full shrink-0", dotCls(current.color))} />
            <span>{current.label}</span>
          </>
        ) : <span className="text-muted-foreground/40">—</span>}
        <ChevronDown className="h-3 w-3 opacity-40" />
      </button>
      {open && rect && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed z-50 min-w-[150px] overflow-hidden rounded-lg border bg-popover shadow-lg" style={{ top: rect.top, left: rect.left }}>
            <button onClick={() => { onChange(""); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground/50 hover:bg-accent transition-colors">
              <span className="h-2 w-2 rounded-full bg-transparent border border-border/60" />
              <span>—</span>
              {!current && <Check className="ml-auto h-3 w-3" />}
            </button>
            {options.map(o => (
              <button key={o.id} onClick={() => { onChange(o.id); setOpen(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                <span className={cn("h-2 w-2 rounded-full shrink-0", dotCls(o.color))} />
                <span>{o.label}</span>
                {o.id === value && <Check className="ml-auto h-3 w-3" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Color dot picker ───────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1">
      {DOT_COLORS.map(c => (
        <button key={c.id} onClick={() => onChange(c.id)}
          className={cn("h-4 w-4 rounded-full transition-transform hover:scale-110", c.cls, value === c.id && "ring-2 ring-offset-1 ring-offset-background ring-foreground/40")} />
      ))}
    </div>
  )
}

// ── Editable label ─────────────────────────────────────────────────────────

function EditableLabel({ value, canEdit, onSave, className }: { value: string; canEdit: boolean; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  useEffect(() => { setDraft(value) }, [value])
  function commit() { if (draft.trim()) onSave(draft.trim()); setEditing(false) }
  if (editing) return (
    <input value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
      autoFocus className={cn("bg-transparent outline-none w-full", className)} />
  )
  return (
    <button onClick={() => canEdit && setEditing(true)} className={cn("truncate text-left", canEdit && "hover:text-foreground transition-colors", className)}>
      {value}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface PageTaskTableProps {
  pageId: string
  blockId: string
  canEdit: boolean
  blockData?: Record<string, unknown>
  onBlockDataChange?: (data: Record<string, unknown>) => void
  onRemoveTable?: () => void
}

export function PageTaskTable({ pageId, blockId, canEdit, blockData, onBlockDataChange, onRemoveTable }: PageTaskTableProps) {
  const tableName      = (blockData?.name as string) ?? "Aufgaben"
  const customColumns  = ((blockData?.customColumns as CustomColumn[]) ?? []).map(c => ({
    ...c,
    options: c.type === "select" ? normalizeOptions(c.options) : c.options,
  }))
  const builtinLabels  = (blockData?.builtinLabels as Record<string, string>) ?? {}
  const hiddenBuiltins = (blockData?.hiddenBuiltins as string[]) ?? []

  const defaultOrder = ["title", "status", "priority", ...customColumns.map(c => c.id)]
  const savedOrder   = (blockData?.columnOrder as string[] | undefined) ?? defaultOrder
  const knownIds     = new Set(savedOrder)
  const columnOrder  = [...savedOrder, ...customColumns.map(c => c.id).filter(id => !knownIds.has(id))]
  const visibleColIds = columnOrder.filter(id =>
    ((id === "title" || id === "status" || id === "priority") && !hiddenBuiltins.includes(id)) ||
    customColumns.some(c => c.id === id)
  )

  // ── State ──────────────────────────────────────────────────────────────
  const [tasks, setTasks]           = useState<Task[]>([])
  const [loading, setLoading]       = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)
  const [addingCol, setAddingCol]   = useState(false)
  const [newColLabel, setNewColLabel] = useState("")
  const [newColType, setNewColType]   = useState<CustomColumn["type"]>("text")
  const [newColSelectOpts, setNewColSelectOpts] = useState<SelectOption[]>([])
  const [newOptLabel, setNewOptLabel] = useState("")
  const [newOptColor, setNewOptColor] = useState("gray")
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [importing, setImporting]   = useState(false)
  const [dragColId, setDragColId]   = useState<string | null>(null)
  const [overColId, setOverColId]   = useState<string | null>(null)
  // Manage select options for existing column
  const [managingColId, setManagingColId] = useState<string | null>(null)
  const [manageRect, setManageRect] = useState<{ top: number; left: number } | null>(null)
  const [manageNewLabel, setManageNewLabel] = useState("")
  const [manageNewColor, setManageNewColor] = useState("gray")
  // Calendar popup
  const [calTaskId, setCalTaskId]   = useState<string | null>(null)
  const [calDate, setCalDate]       = useState(new Date().toISOString().slice(0, 10))
  const [calSaving, setCalSaving]   = useState(false)
  const [calRect, setCalRect]       = useState<{ top: number; left: number } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/pages/${pageId}/tasks?blockId=${blockId}`)
      .then(r => r.ok ? r.json() : [])
      .then((d: unknown) => setTasks(Array.isArray(d) ? d as Task[] : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageId, blockId])

  // ── Block data helpers ─────────────────────────────────────────────────

  function bd(updates: Record<string, unknown>) {
    onBlockDataChange?.({ ...blockData, ...updates })
  }

  function resetColForm() {
    setAddingCol(false); setNewColLabel(""); setNewColType("text")
    setNewColSelectOpts([]); setNewOptLabel(""); setNewOptColor("gray")
  }

  function addOptToList() {
    const label = newOptLabel.trim()
    if (!label) return
    setNewColSelectOpts(prev => [...prev, { id: crypto.randomUUID(), label, color: newOptColor }])
    setNewOptLabel(""); setNewOptColor("gray")
  }

  function addColumn() {
    const label = newColLabel.trim()
    if (!label) { resetColForm(); return }
    const col: CustomColumn = {
      id: crypto.randomUUID(), label, type: newColType,
      ...(newColType === "select" ? { options: newColSelectOpts } : {}),
    }
    bd({ customColumns: [...customColumns, col] })
    resetColForm()
  }

  function removeColumn(id: string) {
    bd({ customColumns: customColumns.filter(c => c.id !== id), columnOrder: columnOrder.filter(cid => cid !== id) })
  }

  function renameColumn(id: string, label: string) {
    bd({ customColumns: customColumns.map(c => c.id === id ? { ...c, label } : c) })
  }

  function renameBuiltin(key: string, label: string) {
    bd({ builtinLabels: { ...builtinLabels, [key]: label } })
  }

  function hideBuiltin(key: string) {
    bd({ hiddenBuiltins: [...hiddenBuiltins.filter(k => k !== key), key] })
  }

  function updateColOptions(colId: string, options: SelectOption[]) {
    bd({ customColumns: customColumns.map(c => c.id === colId ? { ...c, options } : c) })
  }

  // ── Column drag ────────────────────────────────────────────────────────

  function handleColDragStart(id: string) { setDragColId(id) }
  function handleColDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setOverColId(id) }
  function handleColDragEnd() { setDragColId(null); setOverColId(null) }
  function handleColDrop(targetId: string) {
    if (!dragColId || dragColId === targetId) { handleColDragEnd(); return }
    const order = [...columnOrder]
    const from = order.indexOf(dragColId), to = order.indexOf(targetId)
    if (from === -1 || to === -1) { handleColDragEnd(); return }
    order.splice(from, 1); order.splice(to, 0, dragColId)
    bd({ columnOrder: order }); handleColDragEnd()
  }

  // ── Task helpers ───────────────────────────────────────────────────────

  async function addTask(init?: { title?: string; rowData?: Record<string, string> }) {
    setCreateError(null)
    const res = await fetch(`/api/pages/${pageId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: init?.title ?? "", rowData: init?.rowData ?? {}, blockId }),
    })
    if (res.ok) {
      const t = await res.json() as Task
      setTasks(prev => [...prev, t])
    } else {
      const err = await res.json().catch(() => ({})) as { error?: string }
      setCreateError(err.error ?? "Zeile konnte nicht erstellt werden – SQL-Tabellen prüfen")
    }
  }

  function opt(id: string, p: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...p } : t))
  }

  async function patch(id: string, updates: Partial<Task>) {
    opt(id, updates)
    await fetch(`/api/pages/${pageId}/tasks/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  async function remove(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/pages/${pageId}/tasks/${id}`, { method: "DELETE" })
  }

  // ── Calendar ───────────────────────────────────────────────────────────

  function openCalendar(e: React.MouseEvent, taskId: string) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setCalRect({ top: r.bottom + 4, left: Math.max(4, r.left - 180) })
    setCalDate(new Date().toISOString().slice(0, 10))
    setCalTaskId(prev => prev === taskId ? null : taskId)
  }

  async function addToCalendar() {
    if (!calTaskId) return
    const task = tasks.find(t => t.id === calTaskId)
    if (!task) return
    setCalSaving(true)
    await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title || "Aufgabe", date: calDate, color: "blue", allDay: true }),
    }).catch(() => {})
    setCalSaving(false)
    setCalTaskId(null)
  }

  // ── Excel / CSV import ─────────────────────────────────────────────────

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImporting(true)
    try {
      const buf = await file.arrayBuffer()
      const wb  = XLSX.read(buf, { type: "array" })
      const ws  = wb.Sheets[wb.SheetNames[0]]
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 })
      if (aoa.length < 2) return
      const headers = (aoa[0] as unknown[]).map(h => String(h ?? "").trim()).filter(Boolean)
      const rows    = aoa.slice(1)
      const existingByLabel = Object.fromEntries(customColumns.map(c => [c.label, c.id]))
      const toAdd: CustomColumn[] = headers.filter(h => !existingByLabel[h]).map(h => ({ id: crypto.randomUUID(), label: h, type: "text" as const }))
      const allCols = [...customColumns, ...toAdd]
      if (toAdd.length > 0) bd({ customColumns: allCols })
      const labelToId: Record<string, string> = {
        ...Object.fromEntries(customColumns.map(c => [c.label, c.id])),
        ...Object.fromEntries(toAdd.map(c => [c.label, c.id])),
      }
      for (const row of rows) {
        const cells = row as unknown[]
        if (cells.every(v => v == null || v === "")) continue
        const rowData: Record<string, string> = {}
        headers.forEach((h, i) => { const cid = labelToId[h]; if (cid) rowData[cid] = String(cells[i] ?? "") })
        await addTask({ title: String(cells[0] ?? ""), rowData })
      }
    } catch { /* silent */ } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  // ── Column header renderer ─────────────────────────────────────────────

  function renderHeader(colId: string) {
    const isDragging = dragColId === colId
    const isOver     = overColId === colId && dragColId !== colId
    const dragProps  = canEdit ? {
      draggable: true,
      onDragStart: () => handleColDragStart(colId),
      onDragOver:  (e: React.DragEvent) => handleColDragOver(e, colId),
      onDrop:      () => handleColDrop(colId),
      onDragEnd:   handleColDragEnd,
    } : {}
    const baseThClass = cn("px-2 py-1.5 select-none", isDragging && "opacity-30", isOver && "bg-primary/10")

    if (colId === "title") return (
      <th key="title" {...dragProps} className={cn("min-w-[180px]", baseThClass)}>
        <div className="group flex items-center gap-1">
          {canEdit && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 active:cursor-grabbing" />}
          <EditableLabel value={builtinLabels.title ?? "Aufgabe"} canEdit={canEdit} onSave={v => renameBuiltin("title", v)} className="text-xs font-medium text-muted-foreground/70" />
          {canEdit && <button onClick={() => hideBuiltin("title")} className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" /></button>}
        </div>
      </th>
    )
    if (colId === "status") return (
      <th key="status" {...dragProps} className={cn("w-28", baseThClass)}>
        <div className="group flex items-center gap-1">
          {canEdit && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 active:cursor-grabbing" />}
          <EditableLabel value={builtinLabels.status ?? "Status"} canEdit={canEdit} onSave={v => renameBuiltin("status", v)} className="text-xs font-medium text-muted-foreground/70" />
          {canEdit && <button onClick={() => hideBuiltin("status")} className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" /></button>}
        </div>
      </th>
    )
    if (colId === "priority") return (
      <th key="priority" {...dragProps} className={cn("w-24", baseThClass)}>
        <div className="group flex items-center gap-1">
          {canEdit && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 active:cursor-grabbing" />}
          <EditableLabel value={builtinLabels.priority ?? "Priorität"} canEdit={canEdit} onSave={v => renameBuiltin("priority", v)} className="text-xs font-medium text-muted-foreground/70" />
          {canEdit && <button onClick={() => hideBuiltin("priority")} className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" /></button>}
        </div>
      </th>
    )

    const col = customColumns.find(c => c.id === colId)
    if (!col) return null
    return (
      <th key={col.id} {...dragProps} className={cn("min-w-[120px]", baseThClass)}>
        <div className="group flex items-center gap-1">
          {canEdit && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 active:cursor-grabbing" />}
          <EditableLabel value={col.label} canEdit={canEdit} onSave={v => renameColumn(col.id, v)} className="text-xs font-medium text-muted-foreground/70" />
          {col.type !== "text" && (
            <span className="ml-1 shrink-0 rounded bg-muted/60 px-1 py-px text-[9px] text-muted-foreground/40">
              {COL_TYPE_LABELS[col.type]}
            </span>
          )}
          {canEdit && col.type === "select" && (
            <button
              onClick={e => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                setManageRect({ top: r.bottom + 4, left: Math.max(4, r.left - 160) })
                setManagingColId(prev => prev === col.id ? null : col.id)
                setManageNewLabel(""); setManageNewColor("gray")
              }}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Settings2 className="h-3 w-3 text-muted-foreground/40 hover:text-foreground" />
            </button>
          )}
          {canEdit && <button onClick={() => removeColumn(col.id)} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" /></button>}
        </div>
      </th>
    )
  }

  // ── Cell renderer ──────────────────────────────────────────────────────

  function renderCell(task: Task, colId: string) {
    if (colId === "title") return (
      <td key="title" className="min-w-[180px] px-3 py-1.5">
        <input disabled={!canEdit} value={task.title}
          onChange={e => opt(task.id, { title: e.target.value })}
          onBlur={e => canEdit && patch(task.id, { title: e.target.value })}
          placeholder="—"
          className={cn("w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/20 disabled:cursor-default", task.status === "done" && "line-through text-muted-foreground/50")}
        />
      </td>
    )
    if (colId === "status") return (
      <td key="status" className="w-28 px-3 py-1.5">
        <MiniSelect value={task.status} options={STATUS_OPTS} onChange={v => patch(task.id, { status: v })} disabled={!canEdit}
          renderTrigger={v => { const o = STATUS_OPTS.find(x => x.value === v)!; return <span className={cn("text-xs", o.color)}>{o.label}</span> }}
          renderItem={o => { const s = STATUS_OPTS.find(x => x.value === o.value)!; return <span className={cn("text-xs", s.color)}>{o.label}</span> }}
        />
      </td>
    )
    if (colId === "priority") return (
      <td key="priority" className="w-24 px-3 py-1.5">
        <MiniSelect value={task.priority} options={PRIORITY_OPTS} onChange={v => patch(task.id, { priority: v })} disabled={!canEdit}
          renderTrigger={v => { const o = PRIORITY_OPTS.find(x => x.value === v)!; return <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />{o.label}</span> }}
          renderItem={o => { const p = PRIORITY_OPTS.find(x => x.value === o.value)!; return <span className="flex items-center gap-1.5 text-xs"><span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />{o.label}</span> }}
        />
      </td>
    )

    const col = customColumns.find(c => c.id === colId)
    if (!col) return null

    if (col.type === "select") {
      const opts = normalizeOptions(col.options)
      return (
        <td key={col.id} className="min-w-[130px] px-3 py-1.5">
          <ColoredSelectCell
            options={opts}
            value={(task.rowData?.[col.id]) ?? ""}
            onChange={v => {
              const rd = { ...(task.rowData ?? {}), [col.id]: v }
              opt(task.id, { rowData: rd })
              patch(task.id, { rowData: rd })
            }}
            disabled={!canEdit}
          />
        </td>
      )
    }

    return (
      <td key={col.id} className="min-w-[120px] px-3 py-1.5">
        <input disabled={!canEdit}
          type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
          value={(task.rowData?.[col.id]) ?? ""}
          onChange={e => opt(task.id, { rowData: { ...(task.rowData ?? {}), [col.id]: e.target.value } })}
          onBlur={e => { if (!canEdit) return; patch(task.id, { rowData: { ...(task.rowData ?? {}), [col.id]: e.target.value } }) }}
          placeholder="—"
          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/20 disabled:cursor-default"
        />
      </td>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <div className="h-16 animate-pulse rounded-xl bg-muted/20" />

  const managingCol = customColumns.find(c => c.id === managingColId)

  return (
    <>
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
        <EditableLabel value={tableName} canEdit={canEdit} onSave={v => bd({ name: v })} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" />
        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
              <button onClick={() => fileRef.current?.click()} disabled={importing} title="Excel / CSV importieren"
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors disabled:opacity-40">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{importing ? "Importiert…" : "Import"}</span>
              </button>
            </>
          )}
          {canEdit && (
            confirmRemove ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Entfernen?</span>
                <button onClick={() => setConfirmRemove(false)} className="rounded px-1.5 py-0.5 text-xs hover:bg-accent">Nein</button>
                <button onClick={onRemoveTable} className="rounded px-1.5 py-0.5 text-xs text-destructive hover:bg-destructive/10">Ja</button>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(true)} className="rounded p-1 hover:bg-accent transition-colors">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-track]:bg-transparent">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/30 bg-muted/10">
              <th className="w-9 px-2 py-1.5" />
              {visibleColIds.map(id => renderHeader(id))}
              {canEdit && (
                <th className="px-2 py-1.5 align-top">
                  {addingCol ? (
                    <div className="flex flex-col gap-2 min-w-[180px] py-0.5">
                      <input value={newColLabel} onChange={e => setNewColLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && newColType !== "select") addColumn(); if (e.key === "Escape") resetColForm() }}
                        autoFocus placeholder="Spaltenname…"
                        className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-0.5" />
                      <select value={newColType} onChange={e => { setNewColType(e.target.value as CustomColumn["type"]); setNewColSelectOpts([]) }}
                        className="rounded border border-border/40 bg-background px-1 py-0.5 text-xs text-muted-foreground">
                        <option value="text">Text</option>
                        <option value="number">Zahl</option>
                        <option value="date">Datum</option>
                        <option value="select">Auswahl (Dropdown)</option>
                      </select>

                      {newColType === "select" && (
                        <div className="flex flex-col gap-1.5">
                          {newColSelectOpts.map((o, i) => (
                            <div key={o.id} className="flex items-center gap-1.5">
                              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotCls(o.color))} />
                              <span className="flex-1 text-xs">{o.label}</span>
                              <button onClick={() => setNewColSelectOpts(prev => prev.filter((_, j) => j !== i))}>
                                <X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" />
                              </button>
                            </div>
                          ))}
                          <div className="flex gap-1">
                            <input value={newOptLabel} onChange={e => setNewOptLabel(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") addOptToList() }}
                              placeholder="Option…"
                              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/30 pb-0.5" />
                            <button onClick={addOptToList} className="text-xs text-primary hover:underline shrink-0">+</button>
                          </div>
                          <ColorPicker value={newOptColor} onChange={setNewOptColor} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={addColumn} className="text-xs text-primary hover:underline">Erstellen</button>
                        <button onClick={resetColForm} className="text-xs text-muted-foreground/50 hover:text-muted-foreground">Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingCol(true)} className="flex items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                      <Plus className="h-3.5 w-3.5" />Spalte
                    </button>
                  )}
                </th>
              )}
              {canEdit && <th className="w-16" />}
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={2 + visibleColIds.length + (canEdit ? 1 : 0)} className="px-3 py-5 text-center text-xs text-muted-foreground/40">
                  Keine Einträge – klicke unten auf + oder importiere eine Excel-Datei
                </td>
              </tr>
            ) : tasks.map(task => (
              <tr key={task.id} className="border-b border-border/20 last:border-0 hover:bg-accent/10 transition-colors">
                <td className="w-9 px-2 py-1.5 text-center">
                  <button disabled={!canEdit}
                    onClick={() => canEdit && patch(task.id, { status: task.status === "done" ? "todo" : "done" })}
                    className={cn("mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors", task.status === "done" ? "border-green-500 bg-green-500/20" : "border-border hover:border-muted-foreground/50")}>
                    {task.status === "done" && <Check className="h-3 w-3 text-green-400" />}
                  </button>
                </td>
                {visibleColIds.map(id => renderCell(task, id))}
                {canEdit && <td />}
                {canEdit && (
                  <td className="w-16 px-1 py-1.5">
                    <div className="flex items-center gap-0.5">
                      <button onClick={e => openCalendar(e, task.id)}
                        className={cn("flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                          calTaskId === task.id ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground/40 hover:bg-blue-500/10 hover:text-blue-400")}
                        title="Zum Kalender hinzufügen">
                        <CalendarPlus className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(task.id)} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error + Add row */}
      {canEdit && (
        <div className="border-t border-border/20">
          {createError && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive/80 bg-destructive/5">
              <span>⚠</span><span>{createError}</span>
              <button onClick={() => setCreateError(null)} className="ml-auto"><X className="h-3 w-3" /></button>
            </div>
          )}
          <button onClick={() => addTask()} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground/40 hover:bg-accent/30 hover:text-muted-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />Zeile hinzufügen
          </button>
        </div>
      )}
    </div>

    {/* Calendar popup */}
    {calTaskId && calRect && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setCalTaskId(null)} />
        <div className="fixed z-50 w-52 rounded-xl border bg-popover p-3 shadow-xl" style={{ top: calRect.top, left: calRect.left }}>
          <p className="mb-2 text-xs font-semibold text-foreground">Zum Kalender hinzufügen</p>
          <p className="mb-1.5 truncate text-xs text-muted-foreground">{tasks.find(t => t.id === calTaskId)?.title || "Aufgabe"}</p>
          <input type="date" value={calDate} onChange={e => setCalDate(e.target.value)}
            className="mb-2 w-full rounded-lg border border-border/60 bg-background px-2 py-1.5 text-xs outline-none" />
          <button onClick={addToCalendar} disabled={calSaving}
            className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {calSaving ? "Speichert…" : "Hinzufügen"}
          </button>
        </div>
      </>
    )}

    {/* Manage select options popup */}
    {managingColId && managingCol && manageRect && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setManagingColId(null)} />
        <div className="fixed z-50 w-56 rounded-xl border bg-popover p-3 shadow-xl" style={{ top: manageRect.top, left: manageRect.left }}>
          <p className="mb-2 text-xs font-semibold text-foreground">Optionen: {managingCol.label}</p>
          <div className="mb-2 flex flex-col gap-1">
            {normalizeOptions(managingCol.options).map(o => (
              <div key={o.id} className="flex items-center gap-2">
                {/* Color picker inline */}
                <div className="relative group/dot">
                  <span className={cn("block h-3 w-3 rounded-full cursor-pointer", dotCls(o.color))} />
                  <div className="absolute left-0 top-full z-50 mt-1 hidden group-hover/dot:flex gap-1 rounded-lg border bg-popover p-1.5 shadow-lg flex-wrap w-24">
                    {DOT_COLORS.map(c => (
                      <button key={c.id} onClick={() => {
                        const updated = normalizeOptions(managingCol.options).map(x => x.id === o.id ? { ...x, color: c.id } : x)
                        updateColOptions(managingColId, updated)
                      }} className={cn("h-3.5 w-3.5 rounded-full", c.cls, o.color === c.id && "ring-1 ring-foreground/40")} />
                    ))}
                  </div>
                </div>
                <span className="flex-1 text-xs truncate">{o.label}</span>
                <button onClick={() => {
                  const updated = normalizeOptions(managingCol.options).filter(x => x.id !== o.id)
                  updateColOptions(managingColId, updated)
                }}><X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" /></button>
              </div>
            ))}
          </div>
          <div className="mb-1.5 flex gap-1">
            <input value={manageNewLabel} onChange={e => setManageNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const label = manageNewLabel.trim()
                  if (!label) return
                  const updated = [...normalizeOptions(managingCol.options), { id: crypto.randomUUID(), label, color: manageNewColor }]
                  updateColOptions(managingColId, updated)
                  setManageNewLabel("")
                }
              }}
              placeholder="Neue Option…"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-0.5" />
            <button onClick={() => {
              const label = manageNewLabel.trim()
              if (!label) return
              const updated = [...normalizeOptions(managingCol.options), { id: crypto.randomUUID(), label, color: manageNewColor }]
              updateColOptions(managingColId, updated)
              setManageNewLabel("")
            }} className="text-xs text-primary hover:underline">+</button>
          </div>
          <ColorPicker value={manageNewColor} onChange={setManageNewColor} />
        </div>
      </>
    )}
    </>
  )
}
