"use client"

import { Building2, Check, Megaphone, PanelLeft, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  AnnouncementLabelBadge,
  LABEL_COLOR_OPTIONS,
  LABEL_COLORS,
  LABEL_ICON_OPTIONS,
  LABEL_ICONS,
} from "@/components/announcement-label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface Invitation {
  id: string
  workspaceId: string
  workspaceName: string
  workspaceImageUrl: string | null
  workspacePlan: string
  invitedByName: string
  invitedByEmail: string
  createdAt: string
}

interface AnnouncementLabel {
  text: string
  icon: string
  color: string
}

interface Announcement {
  id: string
  title: string
  body: string
  label: AnnouncementLabel | null
  createdAt: string
  read: boolean
}

const planLabel: Record<string, string> = {
  free: "Free Plan",
  pro: "Pro Plan",
  enterprise: "Enterprise Plan",
}

const planBadge: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-500/20 text-blue-400",
  enterprise: "bg-purple-500/20 text-purple-400",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
}

export default function InboxPage() {
  const { toggle } = useInlineSidebar()
  const router = useRouter()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const [composerOpen, setComposerOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [labelText, setLabelText] = useState("")
  const [labelIcon, setLabelIcon] = useState<string>(LABEL_ICON_OPTIONS[0])
  const [labelColor, setLabelColor] = useState<string>(LABEL_COLOR_OPTIONS[0])
  const [composeError, setComposeError] = useState("")
  const [composing, setComposing] = useState(false)

  function load() {
    Promise.all([
      fetch("/api/inbox").then((r) => r.json()),
      fetch("/api/announcements").then((r) => r.json()),
    ])
      .then(([invData, annData]) => {
        if (Array.isArray(invData)) setInvitations(invData)
        if (Array.isArray(annData?.announcements)) setAnnouncements(annData.announcements)
        setIsAdmin(!!annData?.isAdmin)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAccept(inv: Invitation) {
    setProcessing(inv.id)
    const res = await fetch(`/api/inbox/${inv.id}`, { method: "PATCH" })
    if (res.ok) {
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
      // Trigger workspace reload by navigating to dashboard
      router.push("/dashboard")
    }
    setProcessing(null)
  }

  async function handleDecline(inv: Invitation) {
    setProcessing(inv.id)
    await fetch(`/api/inbox/${inv.id}`, { method: "DELETE" })
    setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
    setProcessing(null)
  }

  async function handleMarkRead(ann: Announcement) {
    if (ann.read) return
    setAnnouncements((prev) => prev.map((a) => (a.id === ann.id ? { ...a, read: true } : a)))
    await fetch(`/api/announcements/${ann.id}`, { method: "PATCH" })
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    setComposeError("")
    if (!title.trim() || !body.trim()) {
      setComposeError("Titel und Inhalt erforderlich")
      return
    }

    setComposing(true)
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        label: labelText.trim(),
        labelIcon,
        labelColor,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setComposeError(data.error || "Fehler beim Erstellen")
    } else {
      setTitle("")
      setBody("")
      setLabelText("")
      setLabelIcon(LABEL_ICON_OPTIONS[0])
      setLabelColor(LABEL_COLOR_OPTIONS[0])
      setComposerOpen(false)
      load()
    }
    setComposing(false)
  }

  const hasContent = invitations.length > 0 || announcements.length > 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
        {invitations.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
            {invitations.length}
          </span>
        )}
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-1.5"
            onClick={() => setComposerOpen((o) => !o)}
          >
            <Plus className="h-3.5 w-3.5" />
            Ankündigung
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          {isAdmin && composerOpen && (
            <section className="rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Neue Ankündigung erstellen</h2>
              <form onSubmit={handleCreateAnnouncement} className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ann-title">Titel</Label>
                  <Input
                    id="ann-title"
                    placeholder="z. B. Neues Update verfügbar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ann-body">Inhalt</Label>
                  <textarea
                    id="ann-body"
                    placeholder="Beschreibe, was sich geändert hat…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ann-label">Label (optional)</Label>
                  <Input
                    id="ann-label"
                    placeholder="z. B. Update, Changelog, Wartung…"
                    value={labelText}
                    onChange={(e) => setLabelText(e.target.value)}
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eigener Text – wähle dazu Icon und Farbe für das Label-Badge.
                  </p>
                </div>

                {labelText.trim() && (
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Icon</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {LABEL_ICON_OPTIONS.map((iconKey) => {
                          const Icon = LABEL_ICONS[iconKey]
                          const selected = labelIcon === iconKey
                          return (
                            <button
                              key={iconKey}
                              type="button"
                              onClick={() => setLabelIcon(iconKey)}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                                selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Farbe</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {LABEL_COLOR_OPTIONS.map((colorKey) => {
                          const selected = labelColor === colorKey
                          return (
                            <button
                              key={colorKey}
                              type="button"
                              onClick={() => setLabelColor(colorKey)}
                              title={colorKey}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                                LABEL_COLORS[colorKey],
                                selected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "opacity-60 hover:opacity-100"
                              )}
                            >
                              <span className="h-3 w-3 rounded-full bg-current" />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Vorschau</Label>
                      <div>
                        <AnnouncementLabelBadge text={labelText.trim()} icon={labelIcon} color={labelColor} />
                      </div>
                    </div>
                  </div>
                )}

                {composeError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{composeError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setComposerOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={composing}>
                    {composing ? "Wird gesendet…" : "Veröffentlichen"}
                  </Button>
                </div>
              </form>
            </section>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/20" />
              ))}
            </div>
          ) : !hasContent ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Building2 className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium">Keine Benachrichtigungen</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Einladungen und Ankündigungen erscheinen hier.
              </p>
            </div>
          ) : (
            <>
              {announcements.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Ankündigungen
                  </h2>
                  <div className="flex flex-col gap-3">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => handleMarkRead(ann)}
                        className={cn(
                          "flex gap-4 rounded-xl border bg-card p-4 transition-colors",
                          !ann.read && "cursor-pointer border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06]"
                        )}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{ann.title}</p>
                            {ann.label && (
                              <AnnouncementLabelBadge text={ann.label.text} icon={ann.label.icon} color={ann.label.color} />
                            )}
                            {!ann.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" title="Ungelesen" />
                            )}
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{ann.body}</p>
                          <p className="mt-2 text-xs text-muted-foreground/60">{formatDate(ann.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {invitations.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspace-Einladungen
                  </h2>
                  <div className="flex flex-col gap-3">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center gap-4 rounded-xl border bg-card p-4"
                      >
                        {/* Workspace avatar */}
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                          {inv.workspaceImageUrl ? (
                            <img
                              src={inv.workspaceImageUrl}
                              alt={inv.workspaceName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-base font-bold text-primary">
                              {inv.workspaceName[0]?.toUpperCase() ?? "?"}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{inv.workspaceName}</p>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                planBadge[inv.workspacePlan] ?? planBadge.free
                              )}
                            >
                              {planLabel[inv.workspacePlan] ?? inv.workspacePlan}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Eingeladen von{" "}
                            <span className="font-medium text-foreground">
                              {inv.invitedByName || inv.invitedByEmail}
                            </span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={processing === inv.id}
                            onClick={() => handleDecline(inv)}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ablehnen</span>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5"
                            disabled={processing === inv.id}
                            onClick={() => handleAccept(inv)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Annehmen</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
