"use client"

import { useEffect, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { Check, ChevronDown, Plus, Trash2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  rowData: Record<string, string>
}

interface CustomColumn {
  id: string
  label: string
  type: "text" | "number" | "date"
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

function MiniSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
  renderTrigger,
  renderItem,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  disabled: boolean
  renderTrigger: (v: T) => React.ReactNode
  renderItem: (o: { value: T; label: string }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  if (disabled) return <>{renderTrigger(value)}</>
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:bg-accent/60 transition-colors"
      >
        {renderTrigger(value)}
        <ChevronDown className="h-3 w-3 opacity-40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-0.5 min-w-[110px] overflow-hidden rounded-lg border bg-popover shadow-lg">
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors"
              >
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

function EditableLabel({
  value,
  canEdit,
  onSave,
  className,
}: {
  value: string
  canEdit: boolean
  onSave: (v: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => { setDraft(value) }, [value])

  function commit() {
    if (draft.trim()) onSave(draft.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
        autoFocus
        className={cn("bg-transparent outline-none w-full", className)}
      />
    )
  }
  return (
    <button
      onClick={() => canEdit && setEditing(true)}
      className={cn("truncate text-left", canEdit && "hover:text-foreground transition-colors", className)}
    >
      {value}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface PageTaskTableProps {
  pageId: string
  canEdit: boolean
  blockData?: Record<string, unknown>
  onBlockDataChange?: (data: Record<string, unknown>) => void
  onRemoveTable?: () => void
}

export function PageTaskTable({
  pageId,
  canEdit,
  blockData,
  onBlockDataChange,
  onRemoveTable,
}: PageTaskTableProps) {
  const tableName = (blockData?.name as string) ?? "Aufgaben"
  const customColumns = (blockData?.customColumns as CustomColumn[]) ?? []

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [addingCol, setAddingCol] = useState(false)
  const [newColLabel, setNewColLabel] = useState("")
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/pages/${pageId}/tasks`)
      .then(r => r.ok ? r.json() : [])
      .then((d: unknown) => setTasks(Array.isArray(d) ? d as Task[] : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageId])

  // ── Block data helpers ─────────────────────────────────────────────────

  function bd(updates: Record<string, unknown>) {
    onBlockDataChange?.({ ...blockData, ...updates })
  }

  function addColumn() {
    const label = newColLabel.trim()
    if (!label) { setAddingCol(false); return }
    const col: CustomColumn = { id: crypto.randomUUID(), label, type: "text" }
    bd({ customColumns: [...customColumns, col] })
    setNewColLabel("")
    setAddingCol(false)
  }

  function removeColumn(id: string) {
    bd({ customColumns: customColumns.filter(c => c.id !== id) })
  }

  function renameColumn(id: string, label: string) {
    bd({ customColumns: customColumns.map(c => c.id === id ? { ...c, label } : c) })
  }

  // ── Task helpers ───────────────────────────────────────────────────────

  async function addTask(init?: { title?: string; rowData?: Record<string, string> }) {
    const res = await fetch(`/api/pages/${pageId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: init?.title ?? "", rowData: init?.rowData ?? {} }),
    })
    if (res.ok) {
      const t = await res.json() as Task
      setTasks(prev => [...prev, t])
    }
  }

  function opt(id: string, p: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...p } : t))
  }

  async function patch(id: string, updates: Partial<Task>) {
    opt(id, updates)
    await fetch(`/api/pages/${pageId}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  async function remove(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/pages/${pageId}/tasks/${id}`, { method: "DELETE" })
  }

  // ── Excel / CSV import ─────────────────────────────────────────────────

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 })
      if (aoa.length < 2) return

      const headers = (aoa[0] as unknown[]).map(h => String(h ?? "").trim()).filter(Boolean)
      const rows = aoa.slice(1)

      // Build / merge columns
      const existingByLabel = Object.fromEntries(customColumns.map(c => [c.label, c.id]))
      const toAdd: CustomColumn[] = headers
        .filter(h => !existingByLabel[h])
        .map(h => ({ id: crypto.randomUUID(), label: h, type: "text" as const }))
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
        headers.forEach((h, i) => {
          const cid = labelToId[h]
          if (cid) rowData[cid] = String(cells[i] ?? "")
        })
        await addTask({ title: String(cells[0] ?? ""), rowData })
      }
    } catch {
      // silent — parse errors shouldn't crash the page
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <div className="h-16 animate-pulse rounded-xl bg-muted/20" />

  const colCount = 4 + customColumns.length + (canEdit ? 2 : 0)

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
        <EditableLabel
          value={tableName}
          canEdit={canEdit}
          onSave={v => bd({ name: v })}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        />
        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                title="Excel / CSV importieren"
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors disabled:opacity-40"
              >
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
              <th className="min-w-[180px] px-3 py-1.5 text-left text-xs font-medium text-muted-foreground/70">Aufgabe</th>
              <th className="w-28 px-3 py-1.5 text-left text-xs font-medium text-muted-foreground/70">Status</th>
              <th className="w-24 px-3 py-1.5 text-left text-xs font-medium text-muted-foreground/70">Priorität</th>

              {customColumns.map(col => (
                <th key={col.id} className="min-w-[120px] px-3 py-1.5">
                  <div className="group flex items-center gap-1">
                    <EditableLabel
                      value={col.label}
                      canEdit={canEdit}
                      onSave={v => renameColumn(col.id, v)}
                      className="text-xs font-medium text-muted-foreground/70"
                    />
                    {canEdit && (
                      <button
                        onClick={() => removeColumn(col.id)}
                        className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </th>
              ))}

              {canEdit && (
                <th className="px-2 py-1.5">
                  {addingCol ? (
                    <input
                      value={newColLabel}
                      onChange={e => setNewColLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") addColumn()
                        if (e.key === "Escape") { setAddingCol(false); setNewColLabel("") }
                      }}
                      onBlur={addColumn}
                      autoFocus
                      placeholder="Spaltenname…"
                      className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30"
                    />
                  ) : (
                    <button
                      onClick={() => setAddingCol(true)}
                      className="flex items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Spalte
                    </button>
                  )}
                </th>
              )}

              {canEdit && <th className="w-8" />}
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-3 py-5 text-center text-xs text-muted-foreground/40">
                  Keine Einträge — klicke + oder importiere eine Excel-/CSV-Datei
                </td>
              </tr>
            ) : tasks.map(task => (
              <tr key={task.id} className="group border-b border-border/20 last:border-0 hover:bg-accent/10 transition-colors">

                {/* Done toggle */}
                <td className="w-9 px-2 py-1.5 text-center">
                  <button
                    disabled={!canEdit}
                    onClick={() => canEdit && patch(task.id, { status: task.status === "done" ? "todo" : "done" })}
                    className={cn(
                      "mx-auto flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      task.status === "done" ? "border-green-500 bg-green-500/20" : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    {task.status === "done" && <Check className="h-3 w-3 text-green-400" />}
                  </button>
                </td>

                {/* Title */}
                <td className="min-w-[180px] px-3 py-1.5">
                  <input
                    disabled={!canEdit}
                    value={task.title}
                    onChange={e => opt(task.id, { title: e.target.value })}
                    onBlur={e => canEdit && patch(task.id, { title: e.target.value })}
                    placeholder="—"
                    className={cn(
                      "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/20 disabled:cursor-default",
                      task.status === "done" && "line-through text-muted-foreground/50"
                    )}
                  />
                </td>

                {/* Status */}
                <td className="w-28 px-3 py-1.5">
                  <MiniSelect
                    value={task.status}
                    options={STATUS_OPTS}
                    onChange={v => patch(task.id, { status: v })}
                    disabled={!canEdit}
                    renderTrigger={v => {
                      const o = STATUS_OPTS.find(x => x.value === v)!
                      return <span className={cn("text-xs", o.color)}>{o.label}</span>
                    }}
                    renderItem={o => { const s = STATUS_OPTS.find(x => x.value === o.value)!; return <span className={cn("text-xs", s.color)}>{o.label}</span> }}
                  />
                </td>

                {/* Priority */}
                <td className="w-24 px-3 py-1.5">
                  <MiniSelect
                    value={task.priority}
                    options={PRIORITY_OPTS}
                    onChange={v => patch(task.id, { priority: v })}
                    disabled={!canEdit}
                    renderTrigger={v => {
                      const o = PRIORITY_OPTS.find(x => x.value === v)!
                      return (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />
                          {o.label}
                        </span>
                      )
                    }}
                    renderItem={o => { const p = PRIORITY_OPTS.find(x => x.value === o.value)!; return (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
                        {o.label}
                      </span>
                    )}}
                  />
                </td>

                {/* Custom column cells */}
                {customColumns.map(col => (
                  <td key={col.id} className="min-w-[120px] px-3 py-1.5">
                    <input
                      disabled={!canEdit}
                      type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                      value={(task.rowData?.[col.id]) ?? ""}
                      onChange={e => opt(task.id, { rowData: { ...(task.rowData ?? {}), [col.id]: e.target.value } })}
                      onBlur={e => {
                        if (!canEdit) return
                        patch(task.id, { rowData: { ...(task.rowData ?? {}), [col.id]: e.target.value } })
                      }}
                      placeholder="—"
                      className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/20 disabled:cursor-default"
                    />
                  </td>
                ))}

                {canEdit && <td />}

                {/* Delete row */}
                {canEdit && (
                  <td className="w-8 px-1 py-1.5">
                    <button
                      onClick={() => remove(task.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground/30 hover:text-destructive" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      {canEdit && (
        <button
          onClick={() => addTask()}
          className="flex w-full items-center gap-2 border-t border-border/20 px-3 py-2 text-xs text-muted-foreground/40 hover:bg-accent/30 hover:text-muted-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Zeile hinzufügen
        </button>
      )}
    </div>
  )
}
