"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { CheckSquare, MoreHorizontal, PanelLeft, Plus, Smile, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { PageTaskTable } from "@/components/page-task-table"
import { cn } from "@/lib/utils"

const EMOJI_OPTIONS = [
  "📄","📝","📌","⭐","🎯","📊","💡","🗂️","📂","🔔",
  "🏠","✅","💼","📅","🚀","🎨","💬","🔗","📋","🔒",
  "💰","🎁","✏️","🌟","❤️","🔍",
]

interface PageData {
  id: string
  title: string
  content: string | null
  icon: string | null
  canEdit: boolean
}

export default function PageView({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toggle } = useInlineSidebar()
  const [page, setPage] = useState<PageData | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [icon, setIcon] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showTaskTable, setShowTaskTable] = useState(false)
  const [blockMenuOpen, setBlockMenuOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/pages/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setPage(data)
          setTitle(data.title ?? "")
          setContent(data.content ?? "")
          setIcon(data.icon ?? null)
          setCanEdit(data.canEdit ?? false)
          setCanDelete(data.canDelete ?? false)
        }
      })
      .catch(() => {})
    // auto-show task table if tasks already exist for this page
    fetch(`/api/pages/${params.id}/tasks`)
      .then(r => r.ok ? r.json() : [])
      .then((tasks: unknown[]) => { if (tasks.length > 0) setShowTaskTable(true) })
      .catch(() => {})
  }, [params.id])

  async function handleIconSelect(emoji: string | null) {
    setIcon(emoji)
    setIconPickerOpen(false)
    await fetch(`/api/pages/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: emoji }),
    })
  }

  const saveTitle = useCallback(async (value: string) => {
    if (!value.trim()) return
    await fetch(`/api/pages/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value.trim() }),
    })
  }, [params.id])

  const saveContent = useCallback((value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaving(true)
    saveTimer.current = setTimeout(async () => {
      await fetch(`/api/pages/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      })
      setSaving(false)
    }, 800)
  }, [params.id])

  async function handleDelete() {
    await fetch(`/api/pages/${params.id}`, { method: "DELETE" })
    router.push("/dashboard")
  }

  if (!page) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center border-b px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                style={{ animation: `luma-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`@keyframes luma-pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {saving && <span className="text-xs text-muted-foreground/60">Speichert…</span>}
          {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Seite löschen
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto" onClick={() => setIconPickerOpen(false)}>
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Icon picker — only for members/admins/owners */}
          {canEdit && <div className="relative mb-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIconPickerOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-accent/60",
                icon ? "text-foreground" : "text-muted-foreground/40"
              )}
              title={icon ? "Icon ändern" : "Icon hinzufügen"}
            >
              {icon ? (
                <span className="text-2xl leading-none">{icon}</span>
              ) : (
                <>
                  <Smile className="h-4 w-4" />
                  <span className="text-xs">Icon hinzufügen</span>
                </>
              )}
            </button>

            {iconPickerOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 rounded-xl border bg-popover p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Icon wählen</span>
                  {icon && (
                    <button
                      onClick={() => handleIconSelect(null)}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent"
                    >
                      <X className="h-3 w-3" />
                      Entfernen
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleIconSelect(e)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent",
                        icon === e && "ring-2 ring-primary"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>}

          {/* Icon display for viewers */}
          {!canEdit && icon && (
            <div className="mb-3 px-2">
              <span className="text-2xl leading-none">{icon}</span>
            </div>
          )}

          {/* Title */}
          <input
            className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 disabled:cursor-default"
            placeholder="Titel…"
            value={title}
            disabled={!canEdit}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => canEdit && saveTitle(title)}
          />

          <div className="mt-1 h-px bg-border/40" />

          {/* Content */}
          <textarea
            className="mt-6 min-h-[40vh] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/90 outline-none placeholder:text-muted-foreground/30 disabled:cursor-default"
            placeholder={canEdit ? "Fange an zu schreiben… Ziele, Notizen, Ideen" : ""}
            value={content}
            disabled={!canEdit}
            onChange={(e) => {
              if (!canEdit) return
              setContent(e.target.value)
              saveContent(e.target.value)
            }}
          />

          {/* + Block menu button */}
          {canEdit && !showTaskTable && (
            <div className="relative mt-4">
              <button
                onClick={() => setBlockMenuOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground/40 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Inhalt hinzufügen</span>
              </button>

              {blockMenuOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border bg-popover shadow-lg"
                  onMouseLeave={() => setBlockMenuOpen(false)}
                >
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Block einfügen
                  </div>
                  <button
                    onClick={() => { setShowTaskTable(true); setBlockMenuOpen(false) }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <CheckSquare className="h-4 w-4 text-blue-400" />
                    </span>
                    <div>
                      <p className="font-medium">Aufgabentabelle</p>
                      <p className="text-xs text-muted-foreground">Tasks mit Status & Priorität</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task table block */}
          {showTaskTable && (
            <PageTaskTable
              pageId={params.id}
              canEdit={canEdit}
              onRemove={() => setShowTaskTable(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
