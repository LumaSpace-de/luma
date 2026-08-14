"use client"

import { Camera, Globe, Loader2, Mail, Trash2, UserMinus } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type WorkspacePlan = "free" | "enterprise"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  imageUrl: string | null
  slug?: string | null
}

interface Member {
  id: string
  userId: string
  name: string
  email: string
  username: string | null
  avatarUrl: string | null
  role: string
}

interface Props {
  workspace: Workspace | null
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (ws: Workspace) => void
  onDeleted: (id: string) => void
}

const ROLES: { value: string; label: string; description: string; badge: string }[] = [
  {
    value: "owner",
    label: "Inhaber",
    description: "Volle Kontrolle über den Workspace",
    badge: "bg-amber-500/20 text-amber-400",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Kann Mitglieder & Einstellungen verwalten",
    badge: "bg-purple-500/20 text-purple-400",
  },
  {
    value: "member",
    label: "Mitglied",
    description: "Kann Seiten lesen & bearbeiten",
    badge: "bg-blue-500/20 text-blue-400",
  },
  {
    value: "viewer",
    label: "Betrachter",
    description: "Kann nur lesen",
    badge: "bg-muted text-muted-foreground",
  },
]

function RoleBadge({ role }: { role: string }) {
  const r = ROLES.find((x) => x.value === role) ?? ROLES[1]
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", r.badge)}>
      {r.label}
    </span>
  )
}

export function WorkspaceSettingsDialog({ workspace, isOwner, open, onOpenChange, onUpdated, onDeleted }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [nameSuccess, setNameSuccess] = useState(false)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState("")

  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const [addEmail, setAddEmail] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState(false)

  // Which member's role dropdown is open
  const [roleMenuFor, setRoleMenuFor] = useState<string | null>(null)

  const [slug, setSlug] = useState("")
  const [slugLoading, setSlugLoading] = useState(false)
  const [slugError, setSlugError] = useState("")
  const [slugSuccess, setSlugSuccess] = useState(false)

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!workspace || !open) return
    setName(workspace.name)
    setImageUrl(workspace.imageUrl)
    setSlugError("")
    setSlugSuccess(false)
    if (workspace.plan === "enterprise" && isOwner) {
      fetch(`/api/workspaces/${workspace.id}/slug`)
        .then((r) => r.json())
        .then((d) => { if (typeof d.slug === "string" || d.slug === null) setSlug(d.slug ?? "") })
        .catch(() => {})
    }
    setNameError("")
    setNameSuccess(false)
    setAddEmail("")
    setAddError("")
    setAddSuccess(false)
    setImageError("")
    setRoleMenuFor(null)
    fetchMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id, open])

  async function fetchMembers() {
    if (!workspace) return
    setMembersLoading(true)
    const res = await fetch(`/api/workspaces/${workspace.id}/members`)
    if (res.ok) setMembers(await res.json())
    setMembersLoading(false)
  }

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setNameError("")
    setNameSuccess(false)
    setNameLoading(true)
    const res = await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const d = await res.json()
      setNameError(d.error || "Fehler beim Speichern")
    } else {
      setNameSuccess(true)
      onUpdated({ ...workspace, name })
    }
    setNameLoading(false)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !workspace) return
    setImageError("")
    setImageLoading(true)
    const form = new FormData()
    form.append("image", file)
    const res = await fetch(`/api/workspaces/${workspace.id}/image`, { method: "POST", body: form })
    const data = await res.json()
    if (!res.ok) {
      setImageError(data.error || "Upload fehlgeschlagen")
    } else {
      setImageUrl(data.imageUrl)
      onUpdated({ ...workspace, imageUrl: data.imageUrl, name })
    }
    setImageLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleImageRemove() {
    if (!workspace) return
    setImageError("")
    setImageLoading(true)
    const res = await fetch(`/api/workspaces/${workspace.id}/image`, { method: "DELETE" })
    if (!res.ok) {
      const d = await res.json()
      setImageError(d.error || "Fehler beim Entfernen")
    } else {
      setImageUrl(null)
      onUpdated({ ...workspace, imageUrl: null, name })
    }
    setImageLoading(false)
  }

  async function handleSlugSave(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setSlugError("")
    setSlugSuccess(false)
    setSlugLoading(true)
    const res = await fetch(`/api/workspaces/${workspace.id}/slug`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
    const data = await res.json()
    if (!res.ok) {
      setSlugError(data.error || "Fehler beim Speichern")
    } else {
      setSlugSuccess(true)
      setSlug(data.slug ?? "")
      onUpdated({ ...workspace, slug: data.slug ?? null })
    }
    setSlugLoading(false)
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setAddError("")
    setAddSuccess(false)
    setAddLoading(true)
    const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: addEmail }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddError(data.error || "Fehler beim Hinzufügen")
    } else {
      setAddEmail("")
      setAddSuccess(true)
      fetchMembers()
    }
    setAddLoading(false)
  }

  async function handleRoleChange(userId: string, role: string) {
    if (!workspace) return
    setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role } : m))
    setRoleMenuFor(null)
    await fetch(`/api/workspaces/${workspace.id}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
  }

  async function handleRemoveMember(userId: string) {
    if (!workspace) return
    setMembers((prev) => prev.filter((m) => m.userId !== userId))
    await fetch(`/api/workspaces/${workspace.id}/members/${userId}`, { method: "DELETE" })
  }

  async function handleDelete() {
    if (!workspace) return
    setDeleting(true)
    await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" })
    onDeleted(workspace.id)
    onOpenChange(false)
    setDeleting(false)
  }

  const initials = (workspace?.name ?? "?").slice(0, 2).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={(v) => { setRoleMenuFor(null); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Einstellungen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">

          {/* ── Mitglieds-Hinweis ── */}
          {!isOwner && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              Du bist Mitglied dieses Workspaces. Nur der Inhaber kann Einstellungen ändern.
            </div>
          )}

          {/* ── Bild + Name ── */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => isOwner && fileInputRef.current?.click()}
                disabled={!isOwner || imageLoading}
                className={cn(
                  "group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !isOwner && "cursor-default"
                )}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Workspace" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                    {initials}
                  </span>
                )}
                {isOwner && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {imageLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Camera className="h-4 w-4 text-white" />}
                  </span>
                )}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium">Workspace-Bild</p>
                <p className="text-xs text-muted-foreground">{isOwner ? "JPG, PNG, WebP · max. 2 MB" : "Nur der Inhaber kann das Bild ändern"}</p>
                {isOwner && imageUrl && (
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    disabled={imageLoading}
                    className="mt-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                  >
                    Bild entfernen
                  </button>
                )}
                {imageError && <p className="mt-1 text-xs text-destructive">{imageError}</p>}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageChange} />

            <form onSubmit={handleNameSave} className="flex flex-col gap-2">
              <Label htmlFor="ws-name">Name</Label>
              <div className="flex gap-2">
                <Input id="ws-name" value={name} readOnly={!isOwner} onChange={(e) => { if (isOwner) { setName(e.target.value); setNameSuccess(false) } }} maxLength={80} placeholder="Workspace-Name" className={!isOwner ? "opacity-60" : ""} />
                {isOwner && (
                  <Button type="submit" disabled={nameLoading || !name.trim()} className="shrink-0">
                    {nameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                  </Button>
                )}
              </div>
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              {nameSuccess && <p className="text-xs text-green-500">Name gespeichert</p>}
            </form>
          </section>

          <Separator />

          {/* ── Mitglieder & Berechtigungen ── */}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-semibold">Mitglieder & Berechtigungen</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lege fest was jedes Mitglied in diesem Workspace darf.
              </p>
            </div>

            {/* Role legend */}
            <div className="mb-3 flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <div key={r.value} className="flex items-center gap-1.5">
                  <RoleBadge role={r.value} />
                  <span className="text-xs text-muted-foreground">{r.description}</span>
                </div>
              ))}
            </div>

            {membersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Lädt…
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine weiteren Mitglieder.</p>
            ) : (
              <ul className="mb-4 flex flex-col gap-1">
                {members.map((m) => (
                  <li key={m.userId} className="relative flex items-center gap-3 rounded-lg border px-3 py-2">
                    {/* Avatar */}
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {(m.name || m.email).slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.name || m.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>

                    {/* Role: dropdown for non-owner members, badge-only for the owner entry */}
                    {m.role === "owner" ? (
                      <RoleBadge role="owner" />
                    ) : isOwner ? (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setRoleMenuFor(roleMenuFor === m.userId ? null : m.userId)}
                          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent/50 transition-colors"
                        >
                          <RoleBadge role={m.role} />
                          <span className="text-muted-foreground">▾</span>
                        </button>
                        {roleMenuFor === m.userId && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border bg-popover shadow-lg">
                            {ROLES.filter((r) => r.value !== "owner").map((r) => (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => handleRoleChange(m.userId, r.value)}
                                className={cn(
                                  "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors",
                                  m.role === r.value && "bg-accent/30"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <RoleBadge role={r.value} />
                                  {m.role === r.value && <span className="text-xs text-muted-foreground ml-auto">✓</span>}
                                </div>
                                <span className="text-xs text-muted-foreground">{r.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <RoleBadge role={m.role} />
                    )}

                    {/* Remove — only for owner, and not for the owner entry itself */}
                    {isOwner && m.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveMember(m.userId)}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isOwner && (
              <form onSubmit={handleAddMember} className="flex flex-col gap-2">
                <Label htmlFor="add-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Mitglied einladen
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="add-email"
                    type="text"
                    placeholder="E-Mail oder @Benutzername"
                    value={addEmail}
                    onChange={(e) => { setAddEmail(e.target.value); setAddError(""); setAddSuccess(false) }}
                  />
                  <Button type="submit" variant="secondary" disabled={addLoading || !addEmail.trim()} className="shrink-0">
                    {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hinzufügen"}
                  </Button>
                </div>
                {addError && <p className="text-xs text-destructive">{addError}</p>}
                {addSuccess && <p className="text-xs text-green-500">Einladung gesendet ✓</p>}
              </form>
            )}
          </section>

          {/* ── Enterprise: Workspace-Link ── */}
          {isOwner && workspace?.plan === "enterprise" && (
            <>
              <Separator />
              <section>
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Globe className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Öffentliche Workspace-URL</h3>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">Enterprise</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Erstelle eine öffentliche Landing Page für deinen Workspace mit Login für Mitglieder.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSlugSave} className="flex flex-col gap-2">
                  <Label htmlFor="ws-slug">Workspace-Slug</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">
                        lumaspace.de/workspace/
                      </span>
                      <Input
                        id="ws-slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                          setSlugSuccess(false)
                          setSlugError("")
                        }}
                        maxLength={60}
                        placeholder="mein-workspace"
                        className="pl-[calc(0.75rem+178px)]"
                      />
                    </div>
                    <Button type="submit" disabled={slugLoading} className="shrink-0">
                      {slugLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                    </Button>
                  </div>
                  {slugError && <p className="text-xs text-destructive">{slugError}</p>}
                  {slugSuccess && (
                    <p className="text-xs text-green-500">
                      Gespeichert ✓ — {slug ? `lumaspace.de/workspace/${slug}` : "Link entfernt"}
                    </p>
                  )}
                  {slug && !slugSuccess && (
                    <p className="text-xs text-muted-foreground">
                      Vorschau: <span className="font-mono">lumaspace.de/workspace/{slug}</span>
                    </p>
                  )}
                </form>
              </section>
            </>
          )}

          {/* ── Gefahrenzone — nur für Inhaber ── */}
          {isOwner && (
            <>
              <Separator />
              <section>
                <h3 className="mb-1 text-sm font-semibold text-destructive">Gefahrenzone</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Löscht den Workspace und alle darin enthaltenen Seiten unwiderruflich.
                </p>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-2">
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Workspace löschen
                </Button>
              </section>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
