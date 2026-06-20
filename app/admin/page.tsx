"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  AlertTriangle,
  Bell,
  Bug,
  Check,
  FileText,
  Megaphone,
  PanelLeft,
  Pencil,
  Plus,
  Rocket,
  Shield,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { AnnouncementEmbedCard, EMBED_COLOR_PRESETS } from "@/components/announcement-embed"
import { AnnouncementLabelBadge, LABEL_COLOR_OPTIONS, LABEL_ICON_OPTIONS } from "@/components/announcement-label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface AdminAnnouncement {
  id: string
  title: string
  body: string
  label: string | null
  labelIcon: string | null
  labelColor: string | null
  embedTitle: string | null
  embedDescription: string | null
  embedColor: string | null
  embedFooter: string | null
  createdAt: string
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Megaphone,
  Rocket,
  Wrench,
  FileText,
  Bug,
  Bell,
  AlertTriangle,
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toggle } = useInlineSidebar()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [editing, setEditing] = useState<string | null>(null) // null = new, id = editing
  const [formOpen, setFormOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [label, setLabel] = useState("")
  const [labelIcon, setLabelIcon] = useState("Megaphone")
  const [labelColor, setLabelColor] = useState("blue")
  const [embedTitle, setEmbedTitle] = useState("")
  const [embedDescription, setEmbedDescription] = useState("")
  const [embedColor, setEmbedColor] = useState("#5865F2")
  const [embedFooter, setEmbedFooter] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const checkAdmin = useCallback(async () => {
    const res = await fetch("/api/admin")
    if (res.ok) {
      const data = await res.json()
      setIsAdmin(data.isAdmin)
      if (!data.isAdmin) router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  const loadAnnouncements = useCallback(async () => {
    const res = await fetch("/api/admin/announcements")
    if (res.ok) {
      const data = await res.json()
      setAnnouncements(data.announcements ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      checkAdmin()
      loadAnnouncements()
    }
  }, [status, checkAdmin, loadAnnouncements])

  function resetForm() {
    setEditing(null)
    setFormOpen(false)
    setTitle("")
    setBody("")
    setLabel("")
    setLabelIcon("Megaphone")
    setLabelColor("blue")
    setEmbedTitle("")
    setEmbedDescription("")
    setEmbedColor("#5865F2")
    setEmbedFooter("")
  }

  function openNew() {
    resetForm()
    setFormOpen(true)
  }

  function openEdit(a: AdminAnnouncement) {
    setEditing(a.id)
    setFormOpen(true)
    setTitle(a.title)
    setBody(a.body)
    setLabel(a.label ?? "")
    setLabelIcon(a.labelIcon ?? "Megaphone")
    setLabelColor(a.labelColor ?? "blue")
    setEmbedTitle(a.embedTitle ?? "")
    setEmbedDescription(a.embedDescription ?? "")
    setEmbedColor(a.embedColor ?? "#5865F2")
    setEmbedFooter(a.embedFooter ?? "")
  }

  async function handleSave() {
    if (!title.trim() || !body.trim()) return
    setSaving(true)

    const payload = {
      id: editing,
      title: title.trim(),
      body: body.trim(),
      label: label.trim() || null,
      labelIcon: label.trim() ? labelIcon : null,
      labelColor: label.trim() ? labelColor : null,
      embedTitle: embedTitle.trim() || null,
      embedDescription: embedDescription.trim() || null,
      embedColor: (embedTitle.trim() || embedDescription.trim()) ? embedColor : null,
      embedFooter: embedFooter.trim() || null,
    }

    const url = editing ? "/api/admin/announcements" : "/api/announcements"
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })

    if (res.ok) {
      resetForm()
      await loadAnnouncements()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteConfirm(null)
      await loadAnnouncements()
    }
  }

  if (status === "loading" || isAdmin === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Laden…</div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neue Ankündigung</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Announcements list */}
        <div className={cn("flex-1 overflow-auto p-4", formOpen && "hidden md:block md:flex-1")}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ankündigungen ({announcements.length})
          </h2>

          {loading && <p className="text-sm text-muted-foreground">Laden…</p>}

          {!loading && announcements.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Megaphone className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Noch keine Ankündigungen</p>
              <Button variant="outline" size="sm" onClick={openNew} className="mt-2 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Erstellen
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{a.title}</h3>
                      {a.label && (
                        <AnnouncementLabelBadge
                          text={a.label}
                          icon={a.labelIcon ?? "Megaphone"}
                          color={a.labelColor ?? "blue"}
                        />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
                    {(a.embedTitle || a.embedDescription) && (
                      <AnnouncementEmbedCard
                        title={a.embedTitle}
                        description={a.embedDescription}
                        color={a.embedColor}
                        footer={a.embedFooter}
                      />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground/60">
                      {format(new Date(a.createdAt), "dd. MMMM yyyy, HH:mm", { locale: de })} Uhr
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(a)}
                      title="Bearbeiten"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {deleteConfirm === a.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(a.id)}
                          title="Bestätigen"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setDeleteConfirm(null)}
                          title="Abbrechen"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-400"
                        onClick={() => setDeleteConfirm(a.id)}
                        title="Löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        {formOpen && (
          <div className="flex w-full flex-col border-l bg-background md:w-[420px] md:shrink-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">
                {editing ? "Ankündigung bearbeiten" : "Neue Ankündigung"}
              </h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Titel *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ankündigungstitel…"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Inhalt *</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Ankündigungstext…"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Label */}
                <div className="rounded-lg border p-3">
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground">Label (optional)</label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="z.B. Neu, Update, Wichtig…"
                    className="mb-2"
                  />
                  {label.trim() && (
                    <div className="space-y-2">
                      <div>
                        <span className="mb-1 block text-[11px] text-muted-foreground">Icon</span>
                        <div className="flex flex-wrap gap-1">
                          {LABEL_ICON_OPTIONS.map((icon) => {
                            const Icon = ICON_MAP[icon]
                            return (
                              <button
                                key={icon}
                                onClick={() => setLabelIcon(icon)}
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                                  labelIcon === icon
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-transparent text-muted-foreground hover:bg-accent"
                                )}
                                title={icon}
                              >
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-[11px] text-muted-foreground">Farbe</span>
                        <div className="flex flex-wrap gap-1">
                          {LABEL_COLOR_OPTIONS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setLabelColor(c)}
                              className={cn(
                                "h-6 w-6 rounded-full border-2 transition-colors",
                                labelColor === c ? "border-primary" : "border-transparent"
                              )}
                              style={{
                                backgroundColor:
                                  c === "blue" ? "#3b82f6"
                                    : c === "green" ? "#22c55e"
                                    : c === "purple" ? "#a855f7"
                                    : c === "orange" ? "#f97316"
                                    : c === "red" ? "#ef4444"
                                    : "#eab308",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="text-[11px] text-muted-foreground">Vorschau:</span>
                        <div className="mt-1">
                          <AnnouncementLabelBadge text={label} icon={labelIcon} color={labelColor} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Embed */}
                <div className="rounded-lg border p-3">
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground">Embed (optional)</label>
                  <div className="space-y-2">
                    <Input
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      placeholder="Embed-Titel…"
                    />
                    <textarea
                      value={embedDescription}
                      onChange={(e) => setEmbedDescription(e.target.value)}
                      placeholder="Embed-Beschreibung…"
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <Input
                      value={embedFooter}
                      onChange={(e) => setEmbedFooter(e.target.value)}
                      placeholder="Footer-Text…"
                    />
                    {(embedTitle || embedDescription) && (
                      <>
                        <div>
                          <span className="mb-1 block text-[11px] text-muted-foreground">Akzentfarbe</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {EMBED_COLOR_PRESETS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => setEmbedColor(c)}
                                  className={cn(
                                    "h-5 w-5 rounded-full border-2 transition-colors",
                                    embedColor === c ? "border-primary" : "border-transparent"
                                  )}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                            <input
                              type="color"
                              value={embedColor}
                              onChange={(e) => setEmbedColor(e.target.value)}
                              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                          </div>
                        </div>
                        <div className="pt-1">
                          <span className="text-[11px] text-muted-foreground">Vorschau:</span>
                          <AnnouncementEmbedCard
                            title={embedTitle || null}
                            description={embedDescription || null}
                            color={embedColor}
                            footer={embedFooter || null}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="border-t p-4">
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !body.trim() || saving}
                className="w-full"
              >
                {saving ? "Speichern…" : editing ? "Speichern" : "Veröffentlichen"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
