"use client"

import { Camera, Loader2, Mail, Trash2, UserMinus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type WorkspacePlan = "free" | "pro" | "enterprise"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  imageUrl: string | null
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (ws: Workspace) => void
  onDeleted: (id: string) => void
}

export function WorkspaceSettingsDialog({ workspace, open, onOpenChange, onUpdated, onDeleted }: Props) {
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

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!workspace || !open) return
    setName(workspace.name)
    setImageUrl(workspace.imageUrl)
    setNameError("")
    setNameSuccess(false)
    setAddEmail("")
    setAddError("")
    setAddSuccess(false)
    setImageError("")
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

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setAddError("")
    setAddSuccess(false)
    setAddLoading(true)

    const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addEmail }),
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

  async function handleRemoveMember(userId: string) {
    if (!workspace) return
    await fetch(`/api/workspaces/${workspace.id}/members/${userId}`, { method: "DELETE" })
    setMembers((prev) => prev.filter((m) => m.userId !== userId))
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Einstellungen</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* ── Image + Name ── */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Workspace" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                    {initials}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {imageLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                </span>
              </button>

              <div className="flex-1">
                <p className="text-sm font-medium">Workspace-Bild</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max. 2 MB</p>
                {imageError && <p className="mt-1 text-xs text-destructive">{imageError}</p>}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />

            <form onSubmit={handleNameSave} className="flex flex-col gap-2">
              <Label htmlFor="ws-name">Name</Label>
              <div className="flex gap-2">
                <Input
                  id="ws-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameSuccess(false) }}
                  maxLength={80}
                  placeholder="Workspace-Name"
                />
                <Button type="submit" disabled={nameLoading || !name.trim()} className="shrink-0">
                  {nameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                </Button>
              </div>
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              {nameSuccess && <p className="text-xs text-green-500">Name gespeichert</p>}
            </form>
          </section>

          <Separator />

          {/* ── Members ── */}
          <section>
            <h3 className="mb-3 text-sm font-semibold">Mitglieder</h3>

            {membersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Lädt…
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine weiteren Mitglieder.</p>
            ) : (
              <ul className="mb-3 flex flex-col gap-1">
                {members.map((m) => (
                  <li
                    key={m.userId}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {(m.name || m.email).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.name || m.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(m.userId)}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddMember} className="flex flex-col gap-2">
              <Label htmlFor="add-email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Mitglied hinzufügen
              </Label>
              <div className="flex gap-2">
                <Input
                  id="add-email"
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={addEmail}
                  onChange={(e) => { setAddEmail(e.target.value); setAddError(""); setAddSuccess(false) }}
                />
                <Button type="submit" variant="secondary" disabled={addLoading || !addEmail.trim()} className="shrink-0">
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hinzufügen"}
                </Button>
              </div>
              {addError && <p className="text-xs text-destructive">{addError}</p>}
              {addSuccess && <p className="text-xs text-green-500">Mitglied hinzugefügt</p>}
            </form>
          </section>

          <Separator />

          {/* ── Danger zone ── */}
          <section>
            <h3 className="mb-1 text-sm font-semibold text-destructive">Gefahrenzone</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Löscht den Workspace und alle darin enthaltenen Seiten unwiderruflich.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Workspace löschen
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
