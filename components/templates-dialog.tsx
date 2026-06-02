"use client"

import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutGrid,
  MessageSquare,
  Users,
} from "lucide-react"

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
    description: "Starte mit einem leeren Dokument.",
    color: "text-muted-foreground",
    bg: "bg-muted/60",
  },
  {
    icon: Calendar,
    label: "Kalender-Planung",
    description: "Wochenplanung mit Terminen.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: LayoutGrid,
    label: "Projekt-Board",
    description: "Aufgaben in Spalten organisieren.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: MessageSquare,
    label: "Meeting-Notizen",
    description: "Agenda, Protokoll und Aufgaben.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: CheckSquare,
    label: "Aufgaben-Liste",
    description: "To-do-Liste mit Prioritäten.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Users,
    label: "Team-Übersicht",
    description: "Mitglieder, Rollen, Zuständigkeiten.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
]

interface TemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplatesDialog({ open, onOpenChange }: TemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vorlage für Seiten</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          {templates.map((tpl) => {
            const Icon = tpl.icon
            return (
              <button
                key={tpl.label}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40 hover:border-border active:scale-[0.99]"
                onClick={() => onOpenChange(false)}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    tpl.bg
                  )}
                >
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
