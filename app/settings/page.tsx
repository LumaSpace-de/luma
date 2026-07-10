"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Bell, Bot, Building2, Camera, GitBranch, LinkIcon, Loader2, MessageCircle, PanelLeft, Shield, Sparkles, User, Wallet } from "lucide-react"

import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

import { ProfileBadges } from "@/components/profile-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "profil", label: "Profil", icon: User },
  { id: "sicherheit", label: "Sicherheit", icon: Shield },
  { id: "verknuepfungen", label: "Verknüpfungen", icon: LinkIcon },
  { id: "benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
  { id: "workspaces", label: "Workspaces", icon: Building2 },
] as const

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toggle } = useInlineSidebar()
  const [activeCategory, setActiveCategory] = useState("profil")
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Claude AI
  const [claudeConnected, setClaudeConnected] = useState(false)
  const [claudeLoading, setClaudeLoading] = useState(false)
  const [claudeError, setClaudeError] = useState("")
  const [claudeSuccess, setClaudeSuccess] = useState(false)

  // Discord
  const [dcConnected, setDcConnected] = useState(false)
  const [dcUsername, setDcUsername] = useState("")
  const [dcAvatar, setDcAvatar] = useState<string | null>(null)
  const [dcLoading, setDcLoading] = useState(false)
  const [dcError, setDcError] = useState("")
  const [dcSuccess, setDcSuccess] = useState(false)

  // Discord Notifications
  const [dcNotifyCalendar, setDcNotifyCalendar] = useState(false)
  const [dcNotifyPages, setDcNotifyPages] = useState(false)
  const [dcNotifyDaily, setDcNotifyDaily] = useState(false)
  const [dcNotifySaving, setDcNotifySaving] = useState(false)

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

    const claudeParam = searchParams.get("claude")
    if (claudeParam === "error") setClaudeError("Claude-Verbindung fehlgeschlagen")
    if (claudeParam === "connected") setClaudeSuccess(true)

    fetch("/api/claude/status")
      .then((r) => r.json())
      .then((data) => {
        if (data?.connected) setClaudeConnected(true)
      })
      .catch(() => {})

    const dcParam = searchParams.get("discord")
    if (dcParam === "error") setDcError("Discord-Verbindung fehlgeschlagen")
    if (dcParam === "connected") setDcSuccess(true)

    fetch("/api/discord/status")
      .then((r) => r.json())
      .then((data) => {
        if (data?.connected) {
          setDcConnected(true)
          setDcUsername(data.username ?? "")
          setDcAvatar(data.avatar ?? null)
          setDcNotifyCalendar(data.notifyCalendar ?? false)
          setDcNotifyPages(data.notifyPages ?? false)
          setDcNotifyDaily(data.notifyDaily ?? false)
        }
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

  // Intersection observer for active category highlight
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const sections = container.querySelectorAll("[data-category]")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute("data-category") ?? "profil")
          }
        }
      },
      { root: container, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function scrollToCategory(id: string) {
    const el = scrollRef.current?.querySelector(`[data-category="${id}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

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

      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <nav className="hidden w-52 shrink-0 border-r bg-card/30 p-3 sm:block">
          <div className="flex flex-col gap-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Mobile category tabs */}
        <div className="flex gap-1 overflow-x-auto border-b bg-card/30 px-3 py-2 sm:hidden">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  activeCategory === cat.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div className="mx-auto max-w-lg p-6">

            {/* ═══════════════════════════════════════════════════════
                PROFIL
            ═══════════════════════════════════════════════════════ */}
            <div data-category="profil" className="scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Profil</h2>
                <p className="text-sm text-muted-foreground">Deine persönlichen Daten und Darstellung.</p>
              </div>

              {/* Avatar */}
              <section className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold">Profilbild</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WebP oder GIF · max. 2 MB</p>

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

              {/* Badges */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold">Abzeichen</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Status- und Erfolgs-Abzeichen, die du freigeschaltet hast.
                </p>
                <div className="mt-4">
                  <ProfileBadges />
                </div>
              </section>

              {/* Name */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold">Name</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Dein Anzeigename in der App.</p>

                <form onSubmit={handleNameSave} className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="text-xs">Name</Label>
                    <Input
                      id="name"
                      placeholder="Dein Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                    />
                  </div>

                  {nameError && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{nameError}</p>
                  )}
                  {nameSuccess && (
                    <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">Name gespeichert</p>
                  )}

                  <Button type="submit" size="sm" disabled={nameLoading}>
                    {nameLoading ? "Wird gespeichert…" : "Speichern"}
                  </Button>
                </form>
              </section>

              {/* Username */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold">Benutzername</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mit @Benutzername können andere dich finden.
                </p>

                <form onSubmit={handleUsernameSave} className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="username" className="text-xs">@Benutzername</Label>
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
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{usernameError}</p>
                  )}
                  {usernameSuccess && (
                    <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">Benutzername gespeichert</p>
                  )}

                  <Button type="submit" size="sm" disabled={usernameLoading}>
                    {usernameLoading ? "Wird gespeichert…" : "Speichern"}
                  </Button>
                </form>
              </section>
            </div>

            {/* ═══════════════════════════════════════════════════════
                SICHERHEIT
            ═══════════════════════════════════════════════════════ */}
            <div data-category="sicherheit" className="mt-12 scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Sicherheit</h2>
                <p className="text-sm text-muted-foreground">Passwort und Kontosicherheit verwalten.</p>
              </div>

              <section className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-semibold">Passwort ändern</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Wähle ein sicheres Passwort mit mindestens 6 Zeichen.
                </p>

                <form onSubmit={handlePasswordSave} className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="current" className="text-xs">Aktuelles Passwort</Label>
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
                    <Label htmlFor="newpw" className="text-xs">Neues Passwort</Label>
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
                    <Label htmlFor="confirm" className="text-xs">Neues Passwort bestätigen</Label>
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
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwError}</p>
                  )}
                  {pwSuccess && (
                    <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">Passwort erfolgreich geändert</p>
                  )}

                  <Button type="submit" size="sm" disabled={pwLoading}>
                    {pwLoading ? "Wird gespeichert…" : "Passwort speichern"}
                  </Button>
                </form>
              </section>
            </div>

            {/* ═══════════════════════════════════════════════════════
                VERKNÜPFUNGEN
            ═══════════════════════════════════════════════════════ */}
            <div data-category="verknuepfungen" className="mt-12 scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Verknüpfungen</h2>
                <p className="text-sm text-muted-foreground">Externe Dienste mit deinem Konto verbinden.</p>
              </div>

              {/* GitHub */}
              <section className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-foreground/70" />
                  <h3 className="text-sm font-semibold">GitHub</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Verbinde deinen GitHub-Account, um Repositories in LumaSpace zu durchsuchen.
                </p>

                <div className="mt-4">
                  {ghConnected ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <GitBranch className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Verbunden als @{ghUsername}</p>
                          <p className="text-xs text-muted-foreground">GitHub-Account ist verknüpft</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
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
                      {ghError && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{ghError}</p>
                      )}
                      {ghSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">GitHub erfolgreich verbunden</p>
                      )}

                      <Button asChild size="sm" className="gap-2">
                        <a href="/api/github/authorize">
                          <GitBranch className="h-4 w-4" />
                          Mit GitHub verbinden
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* MEXC */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-foreground/70" />
                  <h3 className="text-sm font-semibold">MEXC Exchange</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Verbinde deinen MEXC-Account, um Assets und PnL zu sehen.
                  Erstelle einen API Key mit <strong>nur Lese-Rechten</strong> unter{" "}
                  <a href="https://www.mexc.com/user/openapi" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                    mexc.com/user/openapi
                  </a>.
                </p>

                <div className="mt-4">
                  {mexcConnected ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <Wallet className="h-5 w-5 text-emerald-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">MEXC verbunden</p>
                          <p className="text-xs text-muted-foreground">API-Zugang ist aktiv</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
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
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="mexc-key" className="text-xs">API Key</Label>
                        <Input
                          id="mexc-key"
                          placeholder="mx0v..."
                          value={mexcKey}
                          onChange={(e) => setMexcKey(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="mexc-secret" className="text-xs">API Secret</Label>
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
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{mexcError}</p>
                      )}
                      {mexcSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">MEXC erfolgreich verbunden</p>
                      )}

                      <Button type="submit" size="sm" className="gap-2" disabled={mexcLoading}>
                        <Wallet className="h-4 w-4" />
                        {mexcLoading ? "Wird verbunden…" : "MEXC verbinden"}
                      </Button>
                    </form>
                  )}
                </div>
              </section>
              {/* Discord */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground/70">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <h3 className="text-sm font-semibold">Discord</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Verbinde deinen Discord-Account mit LumaSpace.
                </p>

                <div className="mt-4">
                  {dcConnected ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        {dcAvatar ? (
                          <img src={dcAvatar} alt="Discord" className="h-8 w-8 rounded-full" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#5865F2]">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">Verbunden als {dcUsername}</p>
                          <p className="text-xs text-muted-foreground">Discord-Account ist verknüpft</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={async () => {
                          setDcLoading(true)
                          await fetch("/api/discord/disconnect", { method: "POST" })
                          setDcConnected(false)
                          setDcUsername("")
                          setDcAvatar(null)
                          setDcLoading(false)
                        }}
                        disabled={dcLoading}
                      >
                        {dcLoading ? "Wird getrennt…" : "Verbindung trennen"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {dcError && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{dcError}</p>
                      )}
                      {dcSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">Discord erfolgreich verbunden</p>
                      )}

                      <Button asChild size="sm" className="gap-2">
                        <a href="/api/discord/authorize">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                          </svg>
                          Mit Discord verbinden
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </section>
              {/* Claude AI */}
              <section className="mt-4 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-semibold">Claude AI</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Verbinde Claude AI mit LumaSpace, um den KI-Assistenten direkt zu nutzen.
                </p>

                <div className="mt-4">
                  {claudeConnected ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <Bot className="h-5 w-5 text-violet-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Claude AI verbunden</p>
                          <p className="text-xs text-muted-foreground">OAuth-Verbindung aktiv</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={async () => {
                          setClaudeLoading(true)
                          await fetch("/api/claude/disconnect", { method: "POST" })
                          setClaudeConnected(false)
                          setClaudeLoading(false)
                        }}
                        disabled={claudeLoading}
                      >
                        {claudeLoading ? "Wird getrennt…" : "Verbindung trennen"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {claudeError && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{claudeError}</p>
                      )}
                      {claudeSuccess && (
                        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">Claude AI erfolgreich verbunden</p>
                      )}
                      <Button asChild size="sm" className="gap-2">
                        <a href="/api/claude/authorize">
                          <Sparkles className="h-4 w-4" />
                          Mit Claude AI verbinden
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ═══════════════════════════════════════════════════════
                BENACHRICHTIGUNGEN
            ═══════════════════════════════════════════════════════ */}
            <div data-category="benachrichtigungen" className="mt-12 scroll-mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Benachrichtigungen</h2>
                <p className="text-sm text-muted-foreground">Steuere, welche Benachrichtigungen du per Discord erhältst.</p>
              </div>

              <section className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#5865F2]">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <h3 className="text-sm font-semibold">Discord-Benachrichtigungen</h3>
                </div>

                {dcConnected ? (
                  <div className="mt-4 flex flex-col gap-3">
                    {[
                      {
                        id: "calendar",
                        label: "Kalender-Erinnerungen",
                        desc: "Erhalte eine DM vor deinen Terminen",
                        value: dcNotifyCalendar,
                        setter: setDcNotifyCalendar,
                        key: "notifyCalendar",
                      },
                      {
                        id: "pages",
                        label: "Seiten-Aktivität",
                        desc: "Benachrichtigung wenn jemand deine Seite bearbeitet",
                        value: dcNotifyPages,
                        setter: setDcNotifyPages,
                        key: "notifyPages",
                      },
                      {
                        id: "daily",
                        label: "Tägliche Zusammenfassung",
                        desc: "Jeden Morgen eine Übersicht deiner Events und Tasks",
                        value: dcNotifyDaily,
                        setter: setDcNotifyDaily,
                        key: "notifyDaily",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.value}
                          onClick={async () => {
                            const newVal = !item.value
                            item.setter(newVal)
                            setDcNotifySaving(true)
                            await fetch("/api/discord/notifications", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ [item.key]: newVal }),
                            })
                            setDcNotifySaving(false)
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            item.value ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                              item.value ? "translate-x-[18px]" : "translate-x-[3px]"
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                    {dcNotifySaving && (
                      <p className="text-xs text-muted-foreground">Wird gespeichert…</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground/60">
                    Verbinde Discord unter{" "}
                    <button
                      onClick={() => scrollToCategory("verknuepfungen")}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      Verknüpfungen
                    </button>
                    , um Benachrichtigungen zu aktivieren.
                  </p>
                )}
              </section>
            </div>

            {/* ═══════════════════════════════════════════════════════
                WORKSPACES
            ═══════════════════════════════════════════════════════ */}
            <div data-category="workspaces" className="mt-12 scroll-mt-6 pb-12">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Workspaces & Plan</h2>
                <p className="text-sm text-muted-foreground">Deine Workspaces und ihre aktuellen Pläne.</p>
              </div>

              <section className="rounded-xl border bg-card p-5">
                <div className="flex flex-col gap-2">
                  {workspaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60">Keine Workspaces gefunden.</p>
                  ) : (
                    workspaces.map((ws) => (
                      <div key={ws.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
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
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Enterprise Plan?{" "}
                  <a href="mailto:support@lumaspace.de" className="text-primary underline-offset-2 hover:underline">
                    support@lumaspace.de
                  </a>
                </p>
              </section>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
