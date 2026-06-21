"use client"

import { Book, Building2, Calendar, CheckSquare, ChevronRight, FileText, LayoutGrid, Link2, Mail, PanelLeft, Plus, Send, Settings, Users, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { de } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { WorkspaceSettingsDialog } from "@/components/workspace-settings-dialog"

type WorkspacePlan = "free" | "enterprise"
type WorkspaceRole = "owner" | "admin" | "member" | "viewer"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  ownerId: string
  imageUrl: string | null
  createdAt: string
  userRole: WorkspaceRole
}

interface QuickLink {
  id: string
  title: string
  icon: string | null
}

const planBadgeClass: Record<WorkspacePlan, string> = {
  free: "bg-muted text-muted-foreground",
  enterprise: "bg-purple-500/20 text-purple-400",
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Guten Morgen"
  if (h < 18) return "Guten Tag"
  return "Guten Abend"
}

function loadQuickLinks(): QuickLink[] {
  try {
    return JSON.parse(localStorage.getItem("luma-quicklinks") ?? "[]")
  } catch { return [] }
}

function saveQuickLinks(links: QuickLink[]) {
  localStorage.setItem("luma-quicklinks", JSON.stringify(links))
}

export default function DashboardPage() {
  const { toggle } = useInlineSidebar()
  const { data: session } = useSession()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  // Greeting
  const userName = (session?.user?.name ?? session?.user?.email ?? "").split(" ")[0]
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })

  // Schnellnotiz
  const [note, setNote] = useState("")
  const [noteLoading, setNoteLoading] = useState(false)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  // Schnelllinks
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([])
  const [linkInput, setLinkInput] = useState("")
  const [linkSearch, setLinkSearch] = useState<QuickLink[]>([])
  const [showLinkSearch, setShowLinkSearch] = useState(false)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Settings dialog
  const [settingsWs, setSettingsWs] = useState<Workspace | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    fetch("/api/workspaces").then(r => r.ok ? r.json() : []).then(setWorkspaces).finally(() => setLoading(false))
    setQuickLinks(loadQuickLinks())
  }, [])

  // Schnellnotiz: create page in private workspace
  async function handleNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setNoteLoading(true)
    // find private workspace (named after user email or first available)
    const privateWs = workspaces[0]
    if (!privateWs) { setNoteLoading(false); return }
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: note.trim(), workspaceId: privateWs.id, parentId: null }),
    })
    if (res.ok) {
      const page = await res.json()
      setNote("")
      router.push(`/pages/${page.id}`)
    }
    setNoteLoading(false)
  }

  // Schnelllinks: search pages
  async function handleLinkSearch(q: string) {
    setLinkInput(q)
    if (q.length < 1) { setLinkSearch([]); return }
    // search from favorites in localStorage
    try {
      const favs: QuickLink[] = JSON.parse(localStorage.getItem("luma-favorites") ?? "[]")
      setLinkSearch(favs.filter(f => f.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5))
    } catch { setLinkSearch([]) }
  }

  function addQuickLink(link: QuickLink) {
    if (quickLinks.some(l => l.id === link.id)) return
    const updated = [...quickLinks, link]
    setQuickLinks(updated)
    saveQuickLinks(updated)
    setLinkInput("")
    setLinkSearch([])
    setShowLinkSearch(false)
  }

  function removeQuickLink(id: string) {
    const updated = quickLinks.filter(l => l.id !== id)
    setQuickLinks(updated)
    saveQuickLinks(updated)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setCreating(true)
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Fehler beim Erstellen")
      setCreating(false)
      return
    }
    const workspace = await res.json()
    setWorkspaces((prev) => [...prev, workspace])
    setCreateOpen(false)
    setName("")
    setCreating(false)
  }

  function openSettings(e: React.MouseEvent, ws: Workspace) {
    e.stopPropagation()
    setSettingsWs(ws)
    setSettingsOpen(true)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Workspace erstellen</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">

        {/* ── Greeting ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            {getGreeting()}{userName ? `, ${userName}` : ""} 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>

        {/* ── Schnellnotiz + Schnelllinks ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">

          {/* Schnellnotiz */}
          <div className="flex flex-col rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schnellnotiz
            </p>
            <form onSubmit={handleNote} className="flex flex-1 flex-col gap-2">
              <textarea
                ref={noteRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNote(e as unknown as React.FormEvent) } }}
                placeholder="Idee, Aufgabe oder Notiz eingeben…"
                rows={3}
                className="flex-1 resize-none rounded-md border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button type="submit" size="sm" className="self-end gap-1.5" disabled={!note.trim() || noteLoading}>
                <Send className="h-3.5 w-3.5" />
                {noteLoading ? "Erstelle…" : "Als Seite speichern"}
              </Button>
            </form>
          </div>

          {/* Schnelllinks */}
          <div className="flex flex-col rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schnelllinks
            </p>

            <div className="flex flex-col gap-1.5 flex-1">
              {quickLinks.length === 0 && (
                <p className="text-xs text-muted-foreground/50">Noch keine Links gepinnt.</p>
              )}
              {quickLinks.map((link) => (
                <div key={link.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
                  {link.icon ? (
                    <span className="h-4 w-4 shrink-0 text-center text-[11px]">{link.icon}</span>
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <Link href={`/pages/${link.id}`} className="flex-1 truncate text-sm hover:underline">
                    {link.title}
                  </Link>
                  <button
                    onClick={() => removeQuickLink(link.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add link */}
            <div className="relative mt-3">
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background px-2 py-1.5">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <input
                  value={linkInput}
                  onChange={(e) => { handleLinkSearch(e.target.value); setShowLinkSearch(true) }}
                  onFocus={() => setShowLinkSearch(true)}
                  onBlur={() => setTimeout(() => setShowLinkSearch(false), 150)}
                  placeholder="Seite suchen und pinnen…"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {showLinkSearch && linkSearch.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border bg-popover shadow-md">
                  {linkSearch.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => addQuickLink(p)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      {p.icon ? (
                        <span className="h-4 w-4 text-center text-[11px]">{p.icon}</span>
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Workspaces ── */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Meine Workspaces
        </h2>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/20" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Building2 className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium">Noch kein Workspace</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Erstelle deinen ersten Workspace um loszulegen.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" size="sm" className="mt-3 gap-2">
              <Plus className="h-3.5 w-3.5" />
              Workspace erstellen
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={(e) => openSettings(e, ws)}
                className="group relative flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                  {ws.imageUrl ? (
                    <img src={ws.imageUrl} alt={ws.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base font-bold text-primary">
                      {ws.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{ws.name}</p>
                  <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", planBadgeClass[ws.plan])}>
                    {ws.plan.charAt(0).toUpperCase() + ws.plan.slice(1)} Plan
                  </span>
                </div>
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
              </button>
            ))}
          </div>
        )}

        {/* ── LumaSpace Docs ── */}
        <DocsSection />

      </div>

      {/* Create workspace dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ws-name">Name</Label>
              <Input id="ws-name" placeholder="z.B. Mein Unternehmen" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Neue Workspaces starten im <span className="font-medium text-foreground">Free Plan</span>. Für Enterprise wende dich an{" "}
              <a href="mailto:support@lumaspace.de" className="text-primary underline-offset-2 hover:underline">support@lumaspace.de</a>.
            </p>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Abbrechen</Button>
              <Button type="submit" disabled={creating}>{creating ? "Wird erstellt…" : "Erstellen"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Workspace settings dialog */}
      <WorkspaceSettingsDialog
        workspace={settingsWs}
        isOwner={!!settingsWs && settingsWs.userRole === "owner"}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdated={(updated) => {
          setWorkspaces((prev) => prev.map((w) => w.id === updated.id ? { ...w, ...updated } : w))
          setSettingsWs((prev) => prev ? { ...prev, ...updated } : prev)
        }}
        onDeleted={(id) => setWorkspaces((prev) => prev.filter((w) => w.id !== id))}
      />
    </div>
  )
}

// ── Docs data ─────────────────────────────────────────────────────────────

interface DocArticle {
  id: string
  icon: React.ReactNode
  title: string
  summary: string
  content: string[]
}

const DOCS: DocArticle[] = [
  {
    id: "erste-schritte",
    icon: <Book className="h-4 w-4" />,
    title: "Erste Schritte",
    summary: "Account erstellen, Workspace einrichten und loslegen.",
    content: [
      "Willkommen bei LumaSpace! Nach der Registrierung landest du auf dem Dashboard. Hier siehst du deine Workspaces, Schnellnotizen und Schnelllinks.",
      "Erstelle deinen ersten Workspace über den Button oben rechts. Ein Workspace ist dein Team- oder Projektbereich — alle Seiten, Aufgaben und Mitglieder gehören zu einem Workspace.",
      "Im Free Plan kannst du unbegrenzt Seiten erstellen und bis zu 5 Mitglieder einladen. Für größere Teams gibt es den Enterprise Plan.",
    ],
  },
  {
    id: "workspaces",
    icon: <LayoutGrid className="h-4 w-4" />,
    title: "Workspaces",
    summary: "Workspace erstellen, Mitglieder einladen und Rollen verwalten.",
    content: [
      "Jeder Workspace hat vier Rollen: Owner (volle Kontrolle), Admin (kann Mitglieder verwalten), Member (kann Inhalte erstellen) und Viewer (nur Lesezugriff).",
      "Klicke auf einen Workspace im Dashboard um die Einstellungen zu öffnen: Name ändern, Bild hochladen, Mitglieder einladen oder den Workspace löschen.",
      "Du kannst per Einladungslink neue Mitglieder hinzufügen. Der Link ist 7 Tage gültig und kann jederzeit neu generiert werden.",
    ],
  },
  {
    id: "seiten-blocks",
    icon: <FileText className="h-4 w-4" />,
    title: "Seiten & Blocks",
    summary: "Seiten erstellen, Blocks einfügen und Inhalte strukturieren.",
    content: [
      "Seiten sind das Herzstück von LumaSpace. Jede Seite hat einen Titel, optionalen Text und beliebig viele Blocks.",
      "Verfügbare Block-Typen: Aufgabentabelle (mit Kanban-Ansicht), Datenbank, Überschrift (H1-H3), Hinweis (Info/Warnung/Erfolg/Fehler), Zitat, Code-Block und Seitenvorschau.",
      "Blocks können per Drag & Drop umsortiert werden. Klicke auf den + Button am Ende der Seite um neue Blocks hinzuzufügen.",
      "Seiten können verschachtelt werden — erstelle Unterseiten für eine hierarchische Struktur wie bei einem Wiki.",
    ],
  },
  {
    id: "aufgaben",
    icon: <CheckSquare className="h-4 w-4" />,
    title: "Aufgaben & Kanban",
    summary: "Tasks erstellen, Status verwalten und Kanban-Board nutzen.",
    content: [
      "Aufgabentabellen sind ein spezieller Block-Typ. Jede Aufgabe hat einen Titel, Status (Offen, In Arbeit, Erledigt) und Priorität (Niedrig, Mittel, Hoch).",
      "Wechsle zwischen Tabellen- und Kanban-Ansicht über die Icons im Tabellen-Header. Im Kanban-Board kannst du Tasks per Drag & Drop zwischen Status-Spalten verschieben.",
      "Füge eigene Spalten hinzu: Text, Zahl, Datum, Auswahl (mit Farben), User-Zuweisung oder Fortschritt (%). Spalten lassen sich umbenennen, umsortieren und ausblenden.",
      "Du kannst Aufgaben direkt zum Kalender hinzufügen und Excel/CSV-Dateien importieren.",
    ],
  },
  {
    id: "kalender",
    icon: <Calendar className="h-4 w-4" />,
    title: "Kalender",
    summary: "Events planen, Ansichten wechseln und Erinnerungen setzen.",
    content: [
      "Der Kalender bietet drei Ansichten: Monat, Woche und Zeitstrahl. Wechsle über die Icons im Header.",
      "Klicke auf einen Tag um ein Event zu erstellen. Jedes Event hat Titel, Farbe, Start-/Endzeit, Standort (mit Adresssuche), Notizen und optionales Label.",
      "Events können wiederholt werden: täglich, wöchentlich, monatlich oder jährlich. Setze Erinnerungen (5 Min bis 1 Tag vorher) für wichtige Termine.",
      "Per Drag & Drop kannst du Events in der Monatsansicht auf andere Tage verschieben. Der Kalender lässt sich auch mit Apple Kalender (CalDAV) abonnieren.",
    ],
  },
  {
    id: "inbox",
    icon: <Mail className="h-4 w-4" />,
    title: "Inbox & Ankündigungen",
    summary: "Nachrichten empfangen und Ankündigungen lesen.",
    content: [
      "Die Inbox sammelt alle wichtigen Benachrichtigungen: Workspace-Einladungen, Ankündigungen und System-Nachrichten.",
      "Ankündigungen werden von Admins erstellt und erscheinen für alle Nutzer. Sie können Labels (z.B. Neu, Update, Wichtig) und Embeds mit Farbakzent enthalten.",
      "Ungelesene Nachrichten werden als Badge in der Sidebar angezeigt. Klicke auf eine Nachricht um sie als gelesen zu markieren.",
    ],
  },
  {
    id: "community",
    icon: <Users className="h-4 w-4" />,
    title: "Community & Freunde",
    summary: "Channels nutzen, Freunde hinzufügen und sich vernetzen.",
    content: [
      "Aktiviere die Community-Funktion in den Workspace-Einstellungen. Erstelle Channels für verschiedene Themen — ähnlich wie bei Discord oder Slack.",
      "Über die Freunde-Funktion kannst du andere LumaSpace-Nutzer als Freunde hinzufügen. Sende eine Anfrage per Benutzername.",
      "In Community-Channels können alle Workspace-Mitglieder Nachrichten austauschen und sich organisieren.",
    ],
  },
]

function DocsSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        LumaSpace Docs
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setOpenId(openId === doc.id ? null : doc.id)}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/30",
              openId === doc.id && "ring-1 ring-primary/40"
            )}
          >
            <div className="flex items-center gap-2 text-primary">
              {doc.icon}
              <span className="text-sm font-semibold">{doc.title}</span>
              <ChevronRight className={cn("ml-auto h-3.5 w-3.5 text-muted-foreground/50 transition-transform", openId === doc.id && "rotate-90")} />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{doc.summary}</p>
          </button>
        ))}
      </div>

      {openId && (() => {
        const doc = DOCS.find(d => d.id === openId)
        if (!doc) return null
        return (
          <div className="mt-3 rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-primary">
              {doc.icon}
              <h3 className="text-base font-bold">{doc.title}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {doc.content.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
