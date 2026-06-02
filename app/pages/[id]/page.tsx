"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { MoreHorizontal, PanelLeft, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

interface PageData {
  id: string
  title: string
  content: string | null
}

export default function PageView({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toggle } = useInlineSidebar()
  const [page, setPage] = useState<PageData | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/pages/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setPage(data)
          setTitle(data.title ?? "")
          setContent(data.content ?? "")
        }
      })
      .catch(() => {})
  }, [params.id])

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
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Title */}
          <input
            className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30"
            placeholder="Titel…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => saveTitle(title)}
          />

          <div className="mt-1 h-px bg-border/40" />

          {/* Content */}
          <textarea
            className="mt-6 min-h-[60vh] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/90 outline-none placeholder:text-muted-foreground/30"
            placeholder="Fange an zu schreiben… Ziele, Notizen, Ideen"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              saveContent(e.target.value)
            }}
          />
        </div>
      </div>
    </div>
  )
}
