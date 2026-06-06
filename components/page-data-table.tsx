"use client"

import { useEffect, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { ChevronDown, Check, GripVertical, Plus, Trash2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

interface DataRow {
  id: string
  data: Record<string, string>
}

interface Column {
  id: string
  label: string
  type: "text" | "number" | "date" | "select"
  options?: string[]
  width?: number
}

const COL_TYPE_LABELS: Record<Column["type"], string> = {
  text: "Text",
  number: "Zahl",
  date: "Datum",
  select: "Auswahl",
}

// ── MiniSelect ─────────────────────────────────────────────────────────────

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
  if (disabled) return <>{renderTrigger(value)}</>
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:bg-accent/60 transition-colors">
        {renderTrigger(value)}
        <ChevronDown className="h-3 w-3 opacity-40" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-0.5 min-w-[120px] overflow-hidden rounded-lg border bg-popover shadow-lg">
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors">
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

function EditableLabel({ value, canEdit, onSave, className }: {
  value: string; canEdit: boolean; onSave: (v: string) => void; className?: string
}) {
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

interface PageDataTableProps {
  pageId: string
  blockId: string
  canEdit: boolean
  blockData?: Record<string, unknown>
  onBlockDataChange?: (data: Record<string, unknown>) => void
  onRemoveTable?: () => void
}

export function PageDataTable({ pageId, blockId, canEdit, blockData, onBlockDataChange, onRemoveTable }: PageDataTableProps) {
  const tableName = (blockData?.name as string) ?? "Tabelle"
  const columns   = (blockData?.columns as Column[]) ?? []

  const savedOrder = (blockData?.columnOrder as string[] | undefined) ?? columns.map(c => c.id)
  const knownIds   = new Set(savedOrder)
  const columnOrder = [...savedOrder, ...columns.map(c => c.id).filter(id => !knownIds.has(id))]
  const visibleCols = columnOrder.map(id => columns.find(c => c.id === id)).filter(Boolean) as Column[]

  const [rows, setRows]             = useState<DataRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)
  const [addingCol, setAddingCol]   = useState(false)
  const [newColLabel, setNewColLabel] = useState("")
  const [newColType, setNewColType]   = useState<Column["type"]>("text")
  const [newColOptions, setNewColOptions] = useState("")
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [importing, setImporting]   = useState(false)
  const [dragColId, setDragColId]   = useState<string | null>(null)
  const [overColId, setOverColId]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Rows are stored as tasks with title="" and all data in rowData, keyed by column id
  useEffect(() => {
    setLoading(true)
    fetch(`/api/pages/${pageId}/tasks?blockId=${blockId}`)
      .then(r => r.ok ? r.json() : [])
      .then((d: unknown) => {
        if (!Array.isArray(d)) { setRows([]); return }
        setRows((d as { id: string; rowData: Record<string, string> }[]).map(t => ({
          id: t.id,
          data: t.rowData ?? {},
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pageId, blockId])

  function bd(updates: Record<string, unknown>) {
    onBlockDataChange?.({ ...blockData, ...updates })
  }

  function resetColForm() {
    setAddingCol(false); setNewColLabel(""); setNewColType("text"); setNewColOptions("")
  }

  function addColumn() {
    const label = newColLabel.trim()
    if (!label) { resetColForm(); return }
    const options = newColType === "select"
      ? newColOptions.split(",").map(o => o.trim()).filter(Boolean)
      : undefined
    const col: Column = { id: crypto.randomUUID(), label, type: newColType, ...(options ? { options } : {}) }
    bd({ columns: [...columns, col] })
    resetColForm()
  }

  function removeColumn(id: string) {
    bd({ columns: columns.filter(c => c.id !== id), columnOrder: columnOrder.filter(cid => cid !== id) })
  }

  function renameColumn(id: string, label: string) {
    bd({ columns: columns.map(c => c.id === id ? { ...c, label } : c) })
  }

  // Column drag
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

  // Row CRUD — rows stored as tasks; "title" field unused (stored empty)
  async function addRow() {
    setCreateError(null)
    const res = await fetch(`/api/pages/${pageId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", rowData: {}, blockId }),
    })
    if (res.ok) {
      const t = await res.json() as { id: string; rowData: Record<string, string> }
      setRows(prev => [...prev, { id: t.id, data: t.rowData ?? {} }])
    } else {
      const err = await res.json().catch(() => ({})) as { error?: string }
      setCreateError(err.error ?? "Zeile konnte nicht erstellt werden – SQL-Tabellen prüfen")
    }
  }

  function optRow(id: string, data: Record<string, string>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, data: { ...r.data, ...data } } : r))
  }

  async function patchRow(id: string, colId: string, value: string) {
    const row = rows.find(r => r.id === id)
    if (!row) return
    const rowData = { ...row.data, [colId]: value }
    optRow(id, { [colId]: value })
    await fetch(`/api/pages/${pageId}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowData }),
    })
  }

  async function removeRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id))
    await fetch(`/api/pages/${pageId}/tasks/${id}`, { method: "DELETE" })
  }

  // Excel / CSV import
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
      const dataRows = aoa.slice(1)
      const existingByLabel = Object.fromEntries(columns.map(c => [c.label, c.id]))
      const toAdd: Column[] = headers.filter(h => !existingByLabel[h]).map(h => ({ id: crypto.randomUUID(), label: h, type: "text" as const }))
      const allCols = [...columns, ...toAdd]
      if (toAdd.length > 0) bd({ columns: allCols })
      const labelToId: Record<string, string> = {
        ...Object.fromEntries(columns.map(c => [c.label, c.id])),
        ...Object.fromEntries(toAdd.map(c => [c.label, c.id])),
      }
      for (const row of dataRows) {
        const cells = row as unknown[]
        if (cells.every(v => v == null || v === "")) continue
        const rowData: Record<string, string> = {}
        headers.forEach((h, i) => { const cid = labelToId[h]; if (cid) rowData[cid] = String(cells[i] ?? "") })
        const res = await fetch(`/api/pages/${pageId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "", rowData, blockId }),
        })
        if (res.ok) {
          const t = await res.json() as { id: string; rowData: Record<string, string> }
          setRows(prev => [...prev, { id: t.id, data: t.rowData ?? {} }])
        }
      }
    } catch { /* silent */ } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <div className="h-16 animate-pulse rounded-xl bg-muted/20" />

  return (
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

      {/* Empty state for new table */}
      {columns.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground/60">Noch keine Spalten – füge deine erste Spalte hinzu</p>
          {canEdit && (
            <button onClick={() => setAddingCol(true)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-4 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" /> Spalte hinzufügen
            </button>
          )}
          {addingCol && (
            <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 text-left min-w-[200px]">
              <input value={newColLabel} onChange={e => setNewColLabel(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") resetColForm() }}
                autoFocus placeholder="Spaltenname…"
                className="bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-1" />
              <select value={newColType} onChange={e => setNewColType(e.target.value as Column["type"])}
                className="rounded border border-border/40 bg-background px-1 py-0.5 text-xs text-muted-foreground">
                <option value="text">Text</option>
                <option value="number">Zahl</option>
                <option value="date">Datum</option>
                <option value="select">Auswahl (Dropdown)</option>
              </select>
              {newColType === "select" && (
                <input value={newColOptions} onChange={e => setNewColOptions(e.target.value)}
                  placeholder="Opt1, Opt2, Opt3"
                  className="bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-1" />
              )}
              <div className="flex gap-2">
                <button onClick={addColumn} className="text-xs text-primary hover:underline">Erstellen</button>
                <button onClick={resetColForm} className="text-xs text-muted-foreground/50 hover:text-muted-foreground">Abbrechen</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {columns.length > 0 && (
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-track]:bg-transparent">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/10">
                {/* Row number */}
                <th className="w-8 px-2 py-1.5 text-right text-[10px] text-muted-foreground/30">#</th>

                {visibleCols.map(col => {
                  const isDragging = dragColId === col.id
                  const isOver     = overColId === col.id && dragColId !== col.id
                  const dragProps  = canEdit ? {
                    draggable: true,
                    onDragStart: () => handleColDragStart(col.id),
                    onDragOver:  (e: React.DragEvent) => handleColDragOver(e, col.id),
                    onDrop:      () => handleColDrop(col.id),
                    onDragEnd:   handleColDragEnd,
                  } : {}
                  return (
                    <th key={col.id} {...dragProps}
                      className={cn("min-w-[120px] px-2 py-1.5 select-none", isDragging && "opacity-30", isOver && "bg-primary/10")}>
                      <div className="group flex items-center gap-1">
                        {canEdit && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30 active:cursor-grabbing" />}
                        <EditableLabel value={col.label} canEdit={canEdit} onSave={v => renameColumn(col.id, v)} className="text-xs font-medium text-muted-foreground/70" />
                        {col.type !== "text" && (
                          <span className="ml-1 shrink-0 rounded bg-muted/60 px-1 py-px text-[9px] text-muted-foreground/40">
                            {COL_TYPE_LABELS[col.type]}
                          </span>
                        )}
                        {canEdit && <button onClick={() => removeColumn(col.id)} className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" />
                        </button>}
                      </div>
                    </th>
                  )
                })}

                {/* Add column */}
                {canEdit && (
                  <th className="px-2 py-1.5 align-top">
                    {addingCol ? (
                      <div className="flex flex-col gap-1.5 min-w-[160px] py-0.5">
                        <input value={newColLabel} onChange={e => setNewColLabel(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") resetColForm() }}
                          autoFocus placeholder="Spaltenname…"
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-0.5" />
                        <select value={newColType} onChange={e => setNewColType(e.target.value as Column["type"])}
                          className="rounded border border-border/40 bg-background px-1 py-0.5 text-xs text-muted-foreground">
                          <option value="text">Text</option>
                          <option value="number">Zahl</option>
                          <option value="date">Datum</option>
                          <option value="select">Auswahl (Dropdown)</option>
                        </select>
                        {newColType === "select" && (
                          <input value={newColOptions} onChange={e => setNewColOptions(e.target.value)}
                            placeholder="Opt1, Opt2, Opt3"
                            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 border-b border-border/40 pb-0.5" />
                        )}
                        <div className="flex gap-2">
                          <button onClick={addColumn} className="text-xs text-primary hover:underline">Erstellen</button>
                          <button onClick={resetColForm} className="text-xs text-muted-foreground/50 hover:text-muted-foreground">Abbrechen</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingCol(true)}
                        className="flex items-center gap-0.5 whitespace-nowrap text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                        <Plus className="h-3.5 w-3.5" />Spalte
                      </button>
                    )}
                  </th>
                )}

                {canEdit && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 2 + (canEdit ? 1 : 0)}
                    className="px-3 py-5 text-center text-xs text-muted-foreground/40">
                    Keine Zeilen – klicke + unten oder importiere eine Excel-Datei
                  </td>
                </tr>
              ) : rows.map((row, rowIdx) => (
                <tr key={row.id} className="border-b border-border/20 last:border-0 hover:bg-accent/10 transition-colors">
                  {/* Row number */}
                  <td className="w-8 px-2 py-1.5 text-right text-[10px] text-muted-foreground/30">{rowIdx + 1}</td>

                  {visibleCols.map(col => {
                    const val = row.data[col.id] ?? ""

                    if (col.type === "select") {
                      const opts = [
                        { value: "", label: "—" },
                        ...(col.options ?? []).map(o => ({ value: o, label: o })),
                      ]
                      return (
                        <td key={col.id} className="min-w-[120px] px-3 py-1.5">
                          <MiniSelect
                            value={val}
                            options={opts}
                            onChange={v => patchRow(row.id, col.id, v)}
                            disabled={!canEdit}
                            renderTrigger={v => <span className="text-xs text-muted-foreground">{v || "—"}</span>}
                            renderItem={o => <span className="text-xs">{o.label}</span>}
                          />
                        </td>
                      )
                    }

                    return (
                      <td key={col.id} className="min-w-[120px] px-3 py-1.5">
                        <input
                          disabled={!canEdit}
                          type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                          value={val}
                          onChange={e => optRow(row.id, { [col.id]: e.target.value })}
                          onBlur={e => { if (!canEdit) return; patchRow(row.id, col.id, e.target.value) }}
                          placeholder="—"
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/20 disabled:cursor-default"
                        />
                      </td>
                    )
                  })}

                  {canEdit && <td />}
                  {canEdit && (
                    <td className="w-10 px-2 py-1.5">
                      <button onClick={() => removeRow(row.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error + Add row */}
      {canEdit && columns.length > 0 && (
        <div className="border-t border-border/20">
          {createError && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive/80 bg-destructive/5">
              <span>⚠</span><span>{createError}</span>
              <button onClick={() => setCreateError(null)} className="ml-auto text-destructive/60 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <button onClick={addRow}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground/40 hover:bg-accent/30 hover:text-muted-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />Zeile hinzufügen
          </button>
        </div>
      )}
    </div>
  )
}
