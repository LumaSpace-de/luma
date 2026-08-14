"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { MoreHorizontal, PanelLeft, Smile, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { PageBlocks } from "@/components/page-blocks"
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
  workspaceId: string
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
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = titleRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [title])

  useEffect(() => {
    const ta = contentRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

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
        <div className="flex h-11 shrink-0 items-center border-b px-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                style={{ animation: `lp 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`@keyframes lp{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      onClick={() => setIconPickerOpen(false)}
    >
      {/* Top bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[11px] text-muted-foreground/40">Speichert…</span>
          )}
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

      {/* Page body */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[720px] px-8 pb-32 pt-14">

          {/* Icon */}
          <div className="relative mb-5" onClick={(e) => e.stopPropagation()}>
            {canEdit ? (
              <>
                {icon ? (
                  <button
                    onClick={() => setIconPickerOpen((o) => !o)}
                    className="rounded-xl p-1 transition-colors hover:bg-accent/50"
                    title="Icon ändern"
                  >
                    <span className="text-[56px] leading-none">{icon}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIconPickerOpen((o) => !o)}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground/30 transition-colors hover:bg-accent/40 hover:text-muted-foreground/60"
                  >
                    <Smile className="h-3.5 w-3.5" />
                    Icon hinzufügen
                  </button>
                )}

                {iconPickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[220px] rounded-xl border bg-popover p-3 shadow-2xl">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Icon</span>
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
                            "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-accent",
                            icon === e && "bg-accent ring-2 ring-primary"
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : icon ? (
              <span className="text-[56px] leading-none">{icon}</span>
            ) : null}
          </div>

          {/* Title */}
          <textarea
            ref={titleRef}
            className="mb-3 w-full resize-none bg-transparent text-[2.6rem] font-bold leading-[1.15] tracking-tight outline-none placeholder:text-muted-foreground/20 disabled:cursor-default"
            placeholder="Ohne Titel"
            value={title}
            disabled={!canEdit}
            rows={1}
            onChange={(e) => {
              setTitle(e.target.value)
              if (canEdit) saveTitle(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault()
            }}
          />

          {/* Description / intro */}
          {(canEdit || content) && (
            <textarea
              ref={contentRef}
              className="mb-10 w-full resize-none bg-transparent text-[15px] leading-relaxed text-muted-foreground/60 outline-none placeholder:text-muted-foreground/25 disabled:cursor-default"
              rows={1}
              placeholder={canEdit ? "Beschreibung hinzufügen…" : ""}
              value={content}
              disabled={!canEdit}
              onChange={(e) => {
                if (!canEdit) return
                setContent(e.target.value)
                saveContent(e.target.value)
              }}
            />
          )}

          {/* Blocks */}
          <PageBlocks pageId={params.id} canEdit={canEdit} workspaceId={page.workspaceId} />
        </div>
      </div>
    </div>
  )
}
