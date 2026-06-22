"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Building2, Camera, GitBranch, PanelLeft, Wallet } from "lucide-react"

import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

import { ProfileBadges } from "@/components/profile-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toggle } = useInlineSidebar()

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Name
  const [name, setName] = useState("")
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [nameSuccess, setNameSuccess] = useState(false)

  // Username
  const [username, setUsername] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [usernameSuccess, setUsernameSuccess] = useState(false)

  // Workspaces
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string; plan: string; imageUrl: string | null; userRole: string }[]>([])

  // GitHub
  const searchParams = useSearchParams()
  const [ghConnected, setGhConnected] = useState(false)
  const [ghUsername, setGhUsername] = useState("")
  const [ghLoading, setGhLoading] = useState(false)
  const [ghError, setGhError] = useState("")
  const [ghSuccess, setGhSuccess] = useState(false)

  // MEXC
  const [mexcConnected, setMexcConnected] = useState(false)
  const [mexcKey, setMexcKey] = useState("")
  const [mexcSecret, setMexcSecret] = useState("")
  const [mexcLoading, setMexcLoading] = useState(false)
  const [mexcError, setMexcError] = useState("")
  const [mexcSuccess, setMexcSuccess] = useState(false)

  // Password
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setWorkspaces(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const ghParam = searchParams.get("github")
    if (ghParam === "error") setGhError("GitHub-Verbindung fehlgeschlagen")
    if (ghParam === "connected") setGhSuccess(true)

    fetch("/api/github/status")
      .then((r) => r.json())
      .then((data) => {
        if (data?.connected) {
          setGhConnected(true)
          setGhUsername(data.username ?? "")
        }
      })
      .catch(() => {})

    fetch("/api/mexc/status")
      .then((r) => r.json())
      .then((data) => {
        if (data?.connected) setMexcConnected(true)
      })
      .catch(() => {})
  }, [searchParams])

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "")
        setUsername(d.username ?? "")
        if (d.avatarUrl) setAvatarUrl(d.avatarUrl)
      })
      .catch(() => {})
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError("")
    setAvatarLoading(true)

    const formData = new FormData()
    formData.append("avatar", file)

    const res = await fetch("/api/auth/avatar", { method: "POST", body: formData })
    const data = await res.json()

    if (!res.ok) {
      setAvatarError(data.error || "Upload fehlgeschlagen")
    } else {
      setAvatarUrl(data.avatarUrl)
    }
    setAvatarLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const initials = (session?.user?.name ?? "?").slice(0, 2).toUpperCase()

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault()
    setNameError("")
    setNameSuccess(false)
    setNameLoading(true)

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()
    if (!res.ok) {
      setNameError(data.error || "Fehler beim Speichern")
    } else {
      setNameSuccess(true)
    }
    setNameLoading(false)
  }

  async function handleUsernameSave(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError("")
    setUsernameSuccess(false)
    setUsernameLoading(true)

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })

    const data = await res.json()
    if (!res.ok) {
      setUsernameError(data.error || "Fehler beim Speichern")
    } else {
      setUsernameSuccess(true)
    }
    setUsernameLoading(false)
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPwError("")
    setPwSuccess(false)

    if (newPw !== confirm) {
      setPwError("Passwörter stimmen nicht überein")
      return
    }

    setPwLoading(true)
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    })

    const data = await res.json()
    if (!res.ok) {
      setPwError(data.error || "Fehler beim Ändern")
    } else {
      setPwSuccess(true)
      setCurrent("")
      setNewPw("")
      setConfirm("")
    }
    setPwLoading(false)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Einstellungen</h1>
      </div>

    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verwalte dein Konto</p>
        </div>

        {/* Avatar */}
        <section>
          <h2 className="text-base font-semibold">Profilbild</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">JPG, PNG, WebP oder GIF · max. 2 MB</p>

          <div className="mt-4 flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                  {initials}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                {avatarLoading ? "Wird hochgeladen…" : "Bild auswählen"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Klicke auf das Bild oder den Button.
              </p>
            </div>
          </div>

          {avatarError && (
            <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {avatarError}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h2 className="text-base font-semibold">Abzeichen</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Status- und Erfolgs-Abzeichen, die du freigeschaltet hast.
          </p>

          <div className="mt-4">
            <ProfileBadges />
          </div>
        </section>

        <Separator />

        {/* Name */}
        <section>
          <h2 className="text-base font-semibold">Name</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Dein Anzeigename in der App.</p>

          <form onSubmit={handleNameSave} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Dein Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </div>

            {nameError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {nameError}
              </p>
            )}
            {nameSuccess && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Name gespeichert
              </p>
            )}

            <Button type="submit" className="w-full" disabled={nameLoading}>
              {nameLoading ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </form>
        </section>

        <Separator />

        {/* Username */}
        <section>
          <h2 className="text-base font-semibold">Benutzername</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Mit @Benutzername können andere dich finden.
          </p>

          <form onSubmit={handleUsernameSave} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">@Benutzername</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <Input
                  id="username"
                  placeholder="dein_name"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, ""))
                  }
                  className="pl-7"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-muted-foreground">Buchstaben, Zahlen und _ · 3–30 Zeichen</p>
            </div>

            {usernameError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {usernameError}
              </p>
            )}
            {usernameSuccess && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Benutzername gespeichert
              </p>
            )}

            <Button type="submit" className="w-full" disabled={usernameLoading}>
              {usernameLoading ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </form>
        </section>

        <Separator />

        {/* GitHub */}
        <section>
          <h2 className="text-base font-semibold">GitHub Verbindung</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Verbinde deinen GitHub-Account per OAuth, um deine Repositories in LumaSpace zu durchsuchen.
          </p>

          <div className="mt-4">
            {ghConnected ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verbunden als @{ghUsername}</p>
                    <p className="text-xs text-muted-foreground">GitHub-Account ist verknüpft</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={async () => {
                    setGhLoading(true)
                    await fetch("/api/github/disconnect", { method: "POST" })
                    setGhConnected(false)
                    setGhUsername("")
                    setGhLoading(false)
                  }}
                  disabled={ghLoading}
                >
                  {ghLoading ? "Wird getrennt…" : "Verbindung trennen"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Klicke auf den Button, um dich bei GitHub anzumelden und LumaSpace Zugriff auf deine Repositories zu geben.
                </p>

                {ghError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {ghError}
                  </p>
                )}
                {ghSuccess && (
                  <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                    GitHub erfolgreich verbunden
                  </p>
                )}

                <Button asChild className="w-full gap-2">
                  <a href="/api/github/authorize">
                    <GitBranch className="h-4 w-4" />
                    Mit GitHub verbinden
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>

        <Separator />

        {/* MEXC */}
        <section>
          <h2 className="text-base font-semibold">MEXC Exchange</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Verbinde deinen MEXC-Account, um Assets und PnL in LumaSpace zu sehen.
            Erstelle einen API Key mit <strong>nur Lese-Rechten</strong> unter{" "}
            <a href="https://www.mexc.com/user/openapi" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
              mexc.com/user/openapi
            </a>.
          </p>

          <div className="mt-4">
            {mexcConnected ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <Wallet className="h-5 w-5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">MEXC verbunden</p>
                    <p className="text-xs text-muted-foreground">API-Zugang ist aktiv</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={async () => {
                    setMexcLoading(true)
                    await fetch("/api/mexc/disconnect", { method: "POST" })
                    setMexcConnected(false)
                    setMexcLoading(false)
                  }}
                  disabled={mexcLoading}
                >
                  {mexcLoading ? "Wird getrennt…" : "Verbindung trennen"}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setMexcError("")
                  setMexcSuccess(false)
                  setMexcLoading(true)

                  const res = await fetch("/api/mexc/connect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apiKey: mexcKey, apiSecret: mexcSecret }),
                  })
                  const data = await res.json()

                  if (!res.ok) {
                    setMexcError(data.error || "Verbindung fehlgeschlagen")
                  } else {
                    setMexcSuccess(true)
                    setMexcConnected(true)
                    setMexcKey("")
                    setMexcSecret("")
                  }
                  setMexcLoading(false)
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="mexc-key">API Key</Label>
                  <Input
                    id="mexc-key"
                    placeholder="mx0v..."
                    value={mexcKey}
                    onChange={(e) => setMexcKey(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="mexc-secret">API Secret</Label>
                  <Input
                    id="mexc-secret"
                    type="password"
                    placeholder="••••••••"
                    value={mexcSecret}
                    onChange={(e) => setMexcSecret(e.target.value)}
                    required
                  />
                </div>

                {mexcError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {mexcError}
                  </p>
                )}
                {mexcSuccess && (
                  <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                    MEXC erfolgreich verbunden
                  </p>
                )}

                <Button type="submit" className="w-full gap-2" disabled={mexcLoading}>
                  <Wallet className="h-4 w-4" />
                  {mexcLoading ? "Wird verbunden…" : "MEXC verbinden"}
                </Button>
              </form>
            )}
          </div>
        </section>

        <Separator />

        {/* Password */}
        <section>
          <h2 className="text-base font-semibold">Passwort ändern</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Wähle ein sicheres Passwort mit mindestens 6 Zeichen.
          </p>

          <form onSubmit={handlePasswordSave} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current">Aktuelles Passwort</Label>
              <Input
                id="current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newpw">Neues Passwort</Label>
              <Input
                id="newpw"
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Neues Passwort bestätigen</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {pwError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Passwort erfolgreich geändert
              </p>
            )}

            <Button type="submit" className="w-full" disabled={pwLoading}>
              {pwLoading ? "Wird gespeichert…" : "Passwort speichern"}
            </Button>
          </form>
        </section>

        <Separator />

        {/* Workspaces & Plan */}
        <section>
          <h2 className="text-base font-semibold">Workspaces & Plan</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Deine Workspaces und ihre aktuellen Pläne.</p>

          <div className="mt-4 flex flex-col gap-2">
            {workspaces.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">Keine Workspaces gefunden.</p>
            ) : (
              workspaces.map((ws) => (
                <div key={ws.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                    {ws.imageUrl ? (
                      <img src={ws.imageUrl} alt={ws.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-4 w-4 text-primary/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ws.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ws.userRole}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    ws.plan === "enterprise"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {ws.plan === "enterprise" ? "Enterprise" : "Free"}
                  </span>
                </div>
              ))
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Enterprise Plan?{" "}
              <a href="mailto:support@lumaspace.de" className="text-primary underline-offset-2 hover:underline">
                support@lumaspace.de
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
    </div>
  )
}
