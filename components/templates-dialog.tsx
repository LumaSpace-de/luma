"use client"

import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutGrid,
  MessageSquare,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const templates = [
  {
    icon: FileText,
    label: "Leere Seite",
    template: "blank",
    description: "Starte mit einem leeren Dokument.",
    color: "text-muted-foreground",
    bg: "bg-muted/60",
  },
  {
    icon: Calendar,
    label: "Kalender-Planung",
    template: "calendar",
    description: "Wochenplanung mit Terminen.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: LayoutGrid,
    label: "Projekt-Board",
    template: "project",
    description: "Aufgaben in Spalten organisieren.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: MessageSquare,
    label: "Meeting-Notizen",
    template: "meeting",
    description: "Agenda, Protokoll und Aufgaben.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: CheckSquare,
    label: "Aufgaben-Liste",
    template: "tasks",
    description: "To-do-Liste mit Prioritäten.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Users,
    label: "Team-Übersicht",
    template: "team",
    description: "Mitglieder, Rollen, Zuständigkeiten.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: MessageSquare,
    label: "Community",
    template: "community",
    description: "Kanäle, Beiträge & Mitglieder für den Workspace.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
]

interface TemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string | null
  parentId?: string | null
  allowCommunity?: boolean
  onCreated?: (page: { id: string; title: string }) => void
  onCommunityEnabled?: (workspaceId: string) => void
}

export function TemplatesDialog({
  open,
  onOpenChange,
  workspaceId,
  parentId,
  allowCommunity = true,
  onCreated,
  onCommunityEnabled,
}: TemplatesDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const visibleTemplates = templates.filter((tpl) => {
    if (tpl.template === "community") return allowCommunity && !parentId
    return true
  })

  async function handleSelect(tpl: (typeof templates)[number]) {
    if (!workspaceId) return
    setLoading(tpl.template)

    if (tpl.template === "community") {
      const res = await fetch(`/api/workspaces/${workspaceId}/community`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      })
      if (res.ok) {
        onCommunityEnabled?.(workspaceId)
        onOpenChange(false)
        router.push(`/community/${workspaceId}`)
      }
      setLoading(null)
      return
    }

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        title: tpl.label,
        template: tpl.template,
        parentId: parentId ?? null,
      }),
    })

    if (res.ok) {
      const page = await res.json()
      onCreated?.(page)
      onOpenChange(false)
      router.push(`/pages/${page.id}`)
    }

    setLoading(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vorlage wählen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          {visibleTemplates.map((tpl) => {
            const Icon = tpl.icon
            return (
              <button
                key={tpl.template}
                disabled={loading !== null}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40 active:scale-[0.99]",
                  loading === tpl.template && "opacity-60"
                )}
                onClick={() => handleSelect(tpl)}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tpl.bg)}>
                  <Icon className={cn("h-4 w-4", tpl.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{tpl.label}</p>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
