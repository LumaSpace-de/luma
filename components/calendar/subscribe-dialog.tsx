"use client"

import { Check, Copy, Link as LinkIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubscribeDialogProps {
  open: boolean
  onClose: () => void
}

export function SubscribeDialog({ open, onClose }: SubscribeDialogProps) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || token || loading) return
    setLoading(true)
    fetch("/api/calendar/subscription")
      .then((r) => r.json())
      .then((d) => setToken(d.token ?? null))
      .finally(() => setLoading(false))
  }, [open, token, loading])

  const httpsUrl = token && typeof window !== "undefined"
    ? `${window.location.origin}/api/calendar/ics/${token}`
    : ""
  const webcalUrl = httpsUrl ? httpsUrl.replace(/^https?:\/\//, "webcal://") : ""

  function copy() {
    if (!httpsUrl) return
    navigator.clipboard.writeText(httpsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mit Apple Kalender verbinden</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            Abonniere deinen LumaSpace-Kalender in Apple Kalender (oder jeder
            anderen App, die ICS-Abos unterstützt). Neue und geänderte Events
            werden automatisch übernommen — die Verbindung ist aktuell einseitig
            (LumaSpace → Apple Kalender).
          </p>

          {loading || !token ? (
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Link wird erstellt…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">{httpsUrl}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>

              <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                <li>Link kopieren (oder direkt öffnen — startet Apple Kalender automatisch)</li>
                <li>Auf dem iPhone/Mac: Einstellungen → Kalender → Account hinzufügen → „Andere&rdquo; → „Kalenderabo hinzufügen&rdquo;</li>
                <li>Den kopierten Link einfügen und bestätigen</li>
              </ol>

              <a
                href={webcalUrl}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                In Apple Kalender öffnen
              </a>
            </>
          )}

          <div className="flex justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Schließen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
