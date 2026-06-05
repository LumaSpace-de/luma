"use client"

import { Building2, PanelLeft, Plus, Settings } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

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

const planBadgeClass: Record<WorkspacePlan, string> = {
  free: "bg-muted text-muted-foreground",
  enterprise: "bg-purple-500/20 text-purple-400",
}

export default function DashboardPage() {
  const { toggle } = useInlineSidebar()
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Settings dialog
  const [settingsWs, setSettingsWs] = useState<Workspace | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  async function fetchWorkspaces() {
    const res = await fetch("/api/workspaces")
    if (res.ok) setWorkspaces(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

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
            <Button
              onClick={() => setCreateOpen(true)}
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
            >
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
                {/* Workspace avatar */}
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
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      planBadgeClass[ws.plan]
                    )}
                  >
                    {ws.plan.charAt(0).toUpperCase() + ws.plan.slice(1)} Plan
                  </span>
                </div>

                {/* Settings hint on hover */}
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
              </button>
            ))}
          </div>
        )}

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
              <Input
                id="ws-name"
                placeholder="z.B. Mein Unternehmen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <p className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Neue Workspaces starten im <span className="font-medium text-foreground">Free Plan</span>. Für Enterprise wende dich an{" "}
              <a href="mailto:support@lumaspace.de" className="text-primary underline-offset-2 hover:underline">
                support@lumaspace.de
              </a>
              .
            </p>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Wird erstellt…" : "Erstellen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Workspace settings dialog */}
      <WorkspaceSettingsDialog
        workspace={settingsWs}
        isOwner={!!settingsWs && (settingsWs.userRole === "owner")}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdated={(updated) => {
          setWorkspaces((prev) => prev.map((w) => w.id === updated.id ? { ...w, ...updated } : w))
          setSettingsWs((prev) => prev ? { ...prev, ...updated } : prev)
        }}
        onDeleted={(id) => {
          setWorkspaces((prev) => prev.filter((w) => w.id !== id))
        }}
      />
    </div>
  )
}
