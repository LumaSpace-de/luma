"use client"

import { Loader2, Palette, Plus, Shield, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RolePermissions {
  manageChannels?: boolean
  managePosts?: boolean
  manageMembers?: boolean
  manageRoles?: boolean
  sendMessages?: boolean
  createPosts?: boolean
}

interface CustomRole {
  id: string
  name: string
  color: string
  permissions: RolePermissions
  position: number
}

const ROLE_COLORS = [
  { id: "gray", label: "Grau", tw: "bg-gray-500" },
  { id: "red", label: "Rot", tw: "bg-red-500" },
  { id: "orange", label: "Orange", tw: "bg-orange-500" },
  { id: "yellow", label: "Gelb", tw: "bg-yellow-500" },
  { id: "green", label: "Grün", tw: "bg-green-500" },
  { id: "blue", label: "Blau", tw: "bg-blue-500" },
  { id: "purple", label: "Lila", tw: "bg-purple-500" },
  { id: "pink", label: "Pink", tw: "bg-pink-500" },
  { id: "indigo", label: "Indigo", tw: "bg-indigo-500" },
]

const PERMISSION_LABELS: { key: keyof RolePermissions; label: string }[] = [
  { key: "manageChannels", label: "Kanäle verwalten" },
  { key: "managePosts", label: "Beiträge verwalten" },
  { key: "manageMembers", label: "Mitglieder verwalten" },
  { key: "manageRoles", label: "Rollen verwalten" },
  { key: "sendMessages", label: "Nachrichten senden" },
  { key: "createPosts", label: "Beiträge erstellen" },
]

export function RoleManager({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const [roles, setRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null)

  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("gray")
  const [newPermissions, setNewPermissions] = useState<RolePermissions>({
    sendMessages: true,
    createPosts: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadRoles()
  }, [workspaceId])

  function loadRoles() {
    setLoading(true)
    fetch(`/api/workspaces/${workspaceId}/roles`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.roles)) setRoles(data.roles)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError("")
    const res = await fetch(`/api/workspaces/${workspaceId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor, permissions: newPermissions }),
    })
    const data = await res.json()
    if (res.ok && data.role) {
      setRoles((prev) => [...prev, data.role])
      resetForm()
    } else {
      setError(data.error ?? "Fehler")
    }
    setSaving(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingRole || !newName.trim()) return
    setSaving(true)
    setError("")
    const res = await fetch(`/api/workspaces/${workspaceId}/roles/${editingRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor, permissions: newPermissions }),
    })
    if (res.ok) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, name: newName.trim(), color: newColor, permissions: newPermissions } : r))
      )
      resetForm()
    } else {
      const data = await res.json()
      setError(data.error ?? "Fehler")
    }
    setSaving(false)
  }

  async function handleDelete(roleId: string) {
    const res = await fetch(`/api/workspaces/${workspaceId}/roles/${roleId}`, { method: "DELETE" })
    if (res.ok) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId))
      if (editingRole?.id === roleId) resetForm()
    }
  }

  function startEdit(role: CustomRole) {
    setEditingRole(role)
    setNewName(role.name)
    setNewColor(role.color)
    setNewPermissions(role.permissions)
    setShowCreate(true)
    setError("")
  }

  function resetForm() {
    setShowCreate(false)
    setEditingRole(null)
    setNewName("")
    setNewColor("gray")
    setNewPermissions({ sendMessages: true, createPosts: true })
    setError("")
  }

  const colorDot = ROLE_COLORS.find((c) => c.id === newColor)?.tw ?? "bg-gray-500"

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center gap-2 border-b px-3">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm font-semibold">Rollen verwalten</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Built-in roles */}
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Standard-Rollen</p>
          <div className="flex flex-col gap-1.5">
            {[
              { name: "Inhaber", color: "bg-yellow-500", desc: "Vollzugriff" },
              { name: "Admin", color: "bg-purple-500", desc: "Verwaltungsrechte" },
              { name: "Mitglied", color: "bg-blue-500", desc: "Standard-Zugang" },
              { name: "Zuschauer", color: "bg-gray-500", desc: "Nur Lesen" },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", r.color)} />
                <span className="flex-1 text-xs font-medium">{r.name}</span>
                <span className="text-[10px] text-muted-foreground">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom roles */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Eigene Rollen</p>
          <button
            type="button"
            onClick={() => { resetForm(); setShowCreate(true) }}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Lädt…
          </div>
        ) : roles.length === 0 && !showCreate ? (
          <p className="py-2 text-xs text-muted-foreground/60">Noch keine eigenen Rollen erstellt.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {roles.map((role) => {
              const color = ROLE_COLORS.find((c) => c.id === role.color)?.tw ?? "bg-gray-500"
              return (
                <div key={role.id} className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
                  <button
                    type="button"
                    onClick={() => startEdit(role)}
                    className="flex-1 text-left text-xs font-medium hover:underline"
                  >
                    {role.name}
                  </button>
                  <button
                    type="button"
                    title="Rolle löschen"
                    onClick={() => handleDelete(role.id)}
                    className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-destructive group-hover:flex"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Create / Edit form */}
        {showCreate && (
          <form onSubmit={editingRole ? handleUpdate : handleCreate} className="mt-3 rounded-lg border bg-card p-3">
            <p className="mb-2 text-xs font-semibold">
              {editingRole ? "Rolle bearbeiten" : "Neue Rolle erstellen"}
            </p>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Rollenname"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
                className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="mb-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Palette className="h-3 w-3" /> Farbe
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setNewColor(c.id)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-all",
                      c.tw,
                      c.id === newColor ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-[11px] text-muted-foreground">Berechtigungen</p>
              <div className="flex flex-col gap-1">
                {PERMISSION_LABELS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!newPermissions[key]}
                      onChange={(e) => setNewPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-input"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="mb-2 text-[11px] text-destructive">{error}</p>}

            <div className="flex gap-1.5">
              <Button type="submit" size="sm" className="h-7 text-xs" disabled={saving || !newName.trim()}>
                {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                {editingRole ? "Speichern" : "Erstellen"}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={resetForm}>
                Abbrechen
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
