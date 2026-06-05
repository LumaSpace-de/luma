"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageTask } from "@/lib/tasks-db"

const STATUS_OPTIONS: { value: PageTask["status"]; label: string; color: string }[] = [
  { value: "todo",        label: "Offen",        color: "text-muted-foreground" },
  { value: "in_progress", label: "In Arbeit",    color: "text-blue-400" },
  { value: "done",        label: "Erledigt",     color: "text-green-500" },
]

const PRIORITY_OPTIONS: { value: PageTask["priority"]; label: string; color: string; dot: string }[] = [
  { value: "low",    label: "Niedrig", color: "text-muted-foreground", dot: "bg-muted-foreground/50" },
  { value: "medium", label: "Mittel",  color: "text-yellow-400",       dot: "bg-yellow-400" },
  { value: "high",   label: "Hoch",    color: "text-red-400",          dot: "bg-red-400" },
]

function StatusBadge({ value, onChange, disabled }: { value: PageTask["status"]; onChange: (v: PageTask["status"]) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const opt = STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0]
  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors hover:bg-accent/60 disabled:pointer-events-none", opt.color)}
      >
        {opt.label}
        {!disabled && <ChevronDown className="h-3 w-3 opacity-50" />}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border bg-popover shadow-lg">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              className={cn("flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent", o.color)}
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              {value === o.value && <Check className="h-3 w-3" />}
              {value !== o.value && <span className="w-3" />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PriorityBadge({ value, onChange, disabled }: { value: PageTask["priority"]; onChange: (v: PageTask["priority"]) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const opt = PRIORITY_OPTIONS.find(o => o.value === value) ?? PRIORITY_OPTIONS[1]
  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent/60 disabled:pointer-events-none"
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", opt.dot)} />
        <span className={opt.color}>{opt.label}</span>
        {!disabled && <ChevronDown className="h-3 w-3 opacity-50" />}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border bg-popover shadow-lg">
          {PRIORITY_OPTIONS.map(o => (
            <button
              key={o.value}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", o.dot)} />
              <span className={o.color}>{o.label}</span>
              {value === o.value && <Check className="ml-auto h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface PageTaskTableProps {
  pageId: string
  canEdit: boolean
  onRemove?: () => void
}

export function PageTaskTable({ pageId, canEdit, onRemove }: PageTaskTableProps) {
  const [tasks, setTasks] = useState<PageTask[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const newInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/pages/${pageId}/tasks`)
      .then(r => r.ok ? r.json() : [])
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [pageId])

  async function addTask() {
    if (!newTitle.trim()) return
    const optimistic: PageTask = {
      id: crypto.randomUUID(),
      pageId,
      title: newTitle.trim(),
      status: "todo",
      priority: "medium",
      dueDate: null,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [...prev, optimistic])
    setNewTitle("")
    const res = await fetch(`/api/pages/${pageId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: optimistic.title }),
    })
    if (res.ok) {
      const created: PageTask = await res.json()
      setTasks(prev => prev.map(t => t.id === optimistic.id ? created : t))
    } else {
      setTasks(prev => prev.filter(t => t.id !== optimistic.id))
    }
  }

  async function patchTask(id: string, patch: Partial<Omit<PageTask, "id" | "pageId" | "createdAt">>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    await fetch(`/api/pages/${pageId}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  }

  async function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/pages/${pageId}/tasks/${id}`, { method: "DELETE" })
  }

  async function handleRemove() {
    // delete all tasks then call onRemove
    await Promise.all(tasks.map(t => fetch(`/api/pages/${pageId}/tasks/${t.id}`, { method: "DELETE" })))
    setTasks([])
    onRemove?.()
  }

  if (loading) return null

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Aufgaben</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/50">
            {tasks.filter(t => t.status === "done").length}/{tasks.length} erledigt
          </span>
          {canEdit && onRemove && (
            confirmRemove ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Tabelle löschen?</span>
                <button onClick={handleRemove} className="text-xs text-destructive hover:underline">Ja</button>
                <button onClick={() => setConfirmRemove(false)} className="text-xs text-muted-foreground hover:underline">Nein</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRemove(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground/40 transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Entfernen
              </button>
            )
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_120px_110px_130px_auto] items-center gap-0 border-b border-border/40 bg-muted/30 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
          <span className="w-6" />
          <span>Aufgabe</span>
          <span>Status</span>
          <span>Priorität</span>
          <span>Fälligkeit</span>
          <span className="w-6" />
        </div>

        {/* Rows */}
        {tasks.length === 0 && !canEdit && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground/50">
            Keine Aufgaben vorhanden
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="group grid grid-cols-[auto_1fr_120px_110px_130px_auto] items-center gap-0 border-b border-border/30 px-3 py-1.5 last:border-0 hover:bg-accent/20"
          >
            {/* Checkbox */}
            <button
              disabled={!canEdit}
              onClick={() => patchTask(task.id, { status: task.status === "done" ? "todo" : "done" })}
              className={cn(
                "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors disabled:pointer-events-none",
                task.status === "done"
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-border/60 hover:border-primary"
              )}
            >
              {task.status === "done" && <Check className="h-2.5 w-2.5" />}
            </button>

            {/* Title */}
            <input
              disabled={!canEdit}
              value={task.title}
              onChange={e => patchTask(task.id, { title: e.target.value })}
              className={cn(
                "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/30 disabled:cursor-default",
                task.status === "done" && "text-muted-foreground line-through"
              )}
            />

            {/* Status */}
            <StatusBadge
              value={task.status}
              onChange={v => patchTask(task.id, { status: v })}
              disabled={!canEdit}
            />

            {/* Priority */}
            <PriorityBadge
              value={task.priority}
              onChange={v => patchTask(task.id, { priority: v })}
              disabled={!canEdit}
            />

            {/* Due date */}
            <input
              type="date"
              disabled={!canEdit}
              value={task.dueDate ?? ""}
              onChange={e => patchTask(task.id, { dueDate: e.target.value || null })}
              className="w-full bg-transparent text-xs text-muted-foreground outline-none disabled:cursor-default [&::-webkit-calendar-picker-indicator]:opacity-30 [&::-webkit-calendar-picker-indicator]:invert"
            />

            {/* Delete */}
            {canEdit && (
              <button
                onClick={() => removeTask(task.id)}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/40 hover:!text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {!canEdit && <span className="w-6" />}
          </div>
        ))}

        {/* Add row */}
        {canEdit && (
          <div className="border-t border-border/30 px-3 py-1.5">
            {adding ? (
              <input
                ref={newInputRef}
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { addTask(); setAdding(false) }
                  if (e.key === "Escape") { setNewTitle(""); setAdding(false) }
                }}
                onBlur={() => { if (newTitle.trim()) addTask(); setAdding(false) }}
                placeholder="Aufgabe eingeben…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
              />
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Aufgabe hinzufügen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
