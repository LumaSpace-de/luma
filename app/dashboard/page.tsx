"use client"

import { Building2, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type WorkspacePlan = "free" | "pro" | "enterprise"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  createdAt: string
}

const plans: {
  value: WorkspacePlan
  label: string
  description: string
  badge: string
}[] = [
  {
    value: "free",
    label: "Free",
    description: "Für den Einstieg. Grundfunktionen, 1 Workspace.",
    badge: "bg-muted text-muted-foreground",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Alle Features, unbegrenzte Mitglieder, Prioritäts-Support.",
    badge: "bg-blue-500/20 text-blue-400",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Alles aus Pro + SSO, eigene Domain, dedizierter Support.",
    badge: "bg-purple-500/20 text-purple-400",
  },
]

const planBadgeClass: Record<WorkspacePlan, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-500/20 text-blue-400",
  enterprise: "bg-purple-500/20 text-purple-400",
}

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<WorkspacePlan>("free")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

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
      body: JSON.stringify({ name, plan: selectedPlan }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Fehler beim Erstellen")
      setCreating(false)
      return
    }

    const workspace = await res.json()
    setWorkspaces((prev) => [...prev, workspace])
    setDialogOpen(false)
    setName("")
    setSelectedPlan("free")
    setCreating(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/workspaces/${id}`, { method: "DELETE" })
    setWorkspaces((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verwalte deine Workspaces
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Workspace erstellen
          </Button>
        </div>

        {/* Workspace grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl border bg-muted/30" />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <Building2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Noch kein Workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Erstelle deinen ersten Workspace um loszulegen.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Workspace erstellen
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-base font-bold">{ws.name[0].toUpperCase()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDelete(ws.id)}
                      title="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <div>
                    <p className="font-semibold">{ws.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Erstellt {new Date(ws.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                      planBadgeClass[ws.plan]
                    )}
                  >
                    {ws.plan.charAt(0).toUpperCase() + ws.plan.slice(1)} Plan
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

            <div className="flex flex-col gap-2">
              <Label>Plan wählen</Label>
              <div className="flex flex-col gap-2">
                {plans.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setSelectedPlan(p.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedPlan === p.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary">
                      {selectedPlan === p.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.label}</span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-medium", p.badge)}>
                          {p.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Wird erstellt…" : "Erstellen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
