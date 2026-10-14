"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  Bell,
  Bot,
  Building2,
  Camera,
  ChevronRight,
  GitBranch,
  LinkIcon,
  LogOut,
  MessageCircle,
  PanelLeft,
  Shield,
  Sparkles,
  User,
  Wallet,
} from "lucide-react"

import { signOut } from "next-auth/react"

import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

import { ProfileBadges } from "@/components/profile-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "profil",            label: "Profil",            icon: User },
  { id: "sicherheit",        label: "Sicherheit",        icon: Shield },
  { id: "verknuepfungen",    label: "Verknüpfungen",     icon: LinkIcon },
  { id: "benachrichtigungen",label: "Benachrichtigungen",icon: Bell },
  { id: "workspaces",        label: "Workspaces",        icon: Building2 },
] as const

const DISCORD_SVG = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
)

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toggle } = useInlineSidebar()
  const [activeCategory, setActiveCategory] = useState("profil")
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

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
        if (data?.connected) { setGhConnected(true); setGhUsername(data.username ?? "") }
      })
      .catch(() => {})

    fetch("/api/mexc/status")
      .then((r) => r.json())
      .then((data) => { if (data?.connected) setMexcConnected(true) })
      .catch(() => {})

    const claudeParam = searchParams.get("claude")
    if (claudeParam === "error") setClaudeError("Claude-Verbindung fehlgeschlagen")
    if (claudeParam === "connected") setClaudeSuccess(true)

    fetch("/api/claude/status")
      .then((r) => r.json())
      .then((data) => { if (data?.connected) setClaudeConnected(true) })
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
      { root: container, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
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
    if (!res.ok) { setAvatarError(data.error || "Upload fehlgeschlagen") }
    else { setAvatarUrl(data.avatarUrl) }
    setAvatarLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const initials = (session?.user?.name ?? "?").slice(0, 2).toUpperCase()

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault()
    setNameError(""); setNameSuccess(false); setNameLoading(true)
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) { setNameError(data.error || "Fehler beim Speichern") }
    else { setNameSuccess(true) }
    setNameLoading(false)
  }

  async function handleUsernameSave(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError(""); setUsernameSuccess(false); setUsernameLoading(true)
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    if (!res.ok) { setUsernameError(data.error || "Fehler beim Speichern") }
    else { setUsernameSuccess(true) }
    setUsernameLoading(false)
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPwError(""); setPwSuccess(false)
    if (newPw !== confirm) { setPwError("Passwörter stimmen nicht überein"); return }
    setPwLoading(true)
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    })
    const data = await res.json()
    if (!res.ok) { setPwError(data.error || "Fehler beim Ändern") }
    else { setPwSuccess(true); setCurrent(""); setNewPw(""); setConfirm("") }
    setPwLoading(false)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Desktop top bar */}
      <div className="hidden h-10 shrink-0 items-center px-3 sm:flex">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-auto">

        {/* Gradient cover */}
        <div className="pointer-events-none h-32 w-full bg-gradient-to-b from-primary/[0.09] via-primary/[0.04] to-transparent" />

        <div className="mx-auto max-w-lg -mt-20 px-5 pb-20">

          {/* Profile hero */}
          <div className="mb-8 flex items-end gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="group relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {initials}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>

            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold leading-tight">{name || "Einstellungen"}</h1>
              {username && <p className="text-sm text-muted-foreground/60">@{username}</p>}
            </div>
          </div>

          {avatarError && (
            <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{avatarError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Category tabs — sticky */}
          <div
            ref={tabsRef}
            className="sticky top-0 z-10 -mx-5 flex gap-1 overflow-x-auto border-b border-border/40 bg-background/80 px-4 pb-2 pt-1 backdrop-blur-xl scrollbar-none"
          >
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
                      : "text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* ── PROFIL ─────────────────────────────────────────── */}
          <div data-category="profil" className="mt-8 scroll-mt-10">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Profil</p>

            {/* Badges */}
            <section className="mb-3 rounded-2xl border border-border/60 bg-card/60 p-5">
              <h3 className="text-sm font-semibold">Abzeichen</h3>
              <p className="mt-0.5 text-xs text-muted-foreground/60">Freigeschaltete Status- und Erfolgs-Abzeichen.</p>
              <div className="mt-4">
                <ProfileBadges />
              </div>
            </section>

            {/* Name */}
            <section className="mb-3 rounded-2xl border border-border/60 bg-card/60 p-5">
              <h3 className="text-sm font-semibold">Anzeigename</h3>
              <form onSubmit={handleNameSave} className="mt-3 flex gap-2">
                <Input
                  placeholder="Dein Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className="flex-1 bg-background/50"
                />
                <Button type="submit" size="sm" disabled={nameLoading} className="shrink-0">
                  {nameLoading ? "…" : "Speichern"}
                </Button>
              </form>
              {nameError && <p className="mt-2 text-xs text-destructive">{nameError}</p>}
              {nameSuccess && <p className="mt-2 text-xs text-green-500">Gespeichert</p>}
            </section>

            {/* Username */}
            <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <h3 className="text-sm font-semibold">Benutzername</h3>
              <p className="mt-0.5 text-xs text-muted-foreground/60">Buchstaben, Zahlen und _ · 3–30 Zeichen</p>
              <form onSubmit={handleUsernameSave} className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">@</span>
                  <Input
                    placeholder="dein_name"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                    className="bg-background/50 pl-7"
                    maxLength={30}
                  />
                </div>
                <Button type="submit" size="sm" disabled={usernameLoading} className="shrink-0">
                  {usernameLoading ? "…" : "Speichern"}
                </Button>
              </form>
              {usernameError && <p className="mt-2 text-xs text-destructive">{usernameError}</p>}
              {usernameSuccess && <p className="mt-2 text-xs text-green-500">Gespeichert</p>}
            </section>
          </div>

          {/* ── SICHERHEIT ─────────────────────────────────────── */}
          <div data-category="sicherheit" className="mt-10 scroll-mt-10">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Sicherheit</p>

            <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <h3 className="text-sm font-semibold">Passwort ändern</h3>
              <p className="mt-0.5 text-xs text-muted-foreground/60">Mindestens 6 Zeichen.</p>

              <form onSubmit={handlePasswordSave} className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="current" className="text-xs text-muted-foreground">Aktuelles Passwort</Label>
                  <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" className="bg-background/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="newpw" className="text-xs text-muted-foreground">Neues Passwort</Label>
                  <Input id="newpw" type="password" placeholder="Mindestens 6 Zeichen" value={newPw} onChange={(e) => setNewPw(e.target.value)} required autoComplete="new-password" className="bg-background/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm" className="text-xs text-muted-foreground">Bestätigen</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" className="bg-background/50" />
                </div>
                {pwError && <p className="text-xs text-destructive">{pwError}</p>}
                {pwSuccess && <p className="text-xs text-green-500">Passwort geändert</p>}
                <Button type="submit" size="sm" disabled={pwLoading}>
                  {pwLoading ? "Wird gespeichert…" : "Passwort speichern"}
                </Button>
              </form>
            </section>
          </div>

          {/* ── VERKNÜPFUNGEN ──────────────────────────────────── */}
          <div data-category="verknuepfungen" className="mt-10 scroll-mt-10">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Verknüpfungen</p>

            {/* GitHub */}
            <section className="mb-3 overflow-hidden rounded-2xl border border-border/60 bg-card/60">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
                  <GitBranch className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">GitHub</p>
                  {ghConnected
                    ? <p className="text-xs text-muted-foreground/60">Verbunden als @{ghUsername}</p>
                    : <p className="text-xs text-muted-foreground/60">Repositories in LumaSpace durchsuchen</p>
                  }
                </div>
                {ghConnected ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </span>
                ) : null}
              </div>
              <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                {ghConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={async () => {
                      setGhLoading(true)
                      await fetch("/api/github/disconnect", { method: "POST" })
                      setGhConnected(false); setGhUsername("")
                      setGhLoading(false)
                    }}
                    disabled={ghLoading}
                  >
                    {ghLoading ? "Wird getrennt…" : "Verbindung trennen"}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    {ghError && <p className="text-xs text-destructive">{ghError}</p>}
                    {ghSuccess && <p className="text-xs text-green-500">Erfolgreich verbunden</p>}
                    <Button asChild size="sm" className="h-7 gap-1.5 text-xs">
                      <a href="/api/github/authorize"><GitBranch className="h-3.5 w-3.5" />Mit GitHub verbinden</a>
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* MEXC */}
            <section className="mb-3 overflow-hidden rounded-2xl border border-border/60 bg-card/60">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
                  <Wallet className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">MEXC Exchange</p>
                  {mexcConnected
                    ? <p className="text-xs text-muted-foreground/60">API-Zugang aktiv</p>
                    : <p className="text-xs text-muted-foreground/60">Assets und PnL verbinden</p>
                  }
                </div>
                {mexcConnected ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </span>
                ) : null}
              </div>
              <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                {mexcConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
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
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setMexcError(""); setMexcSuccess(false); setMexcLoading(true)
                      const res = await fetch("/api/mexc/connect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ apiKey: mexcKey, apiSecret: mexcSecret }),
                      })
                      const data = await res.json()
                      if (!res.ok) { setMexcError(data.error || "Verbindung fehlgeschlagen") }
                      else { setMexcSuccess(true); setMexcConnected(true); setMexcKey(""); setMexcSecret("") }
                      setMexcLoading(false)
                    }}
                    className="flex flex-col gap-2"
                  >
                    <Input id="mexc-key" placeholder="API Key (mx0v…)" value={mexcKey} onChange={(e) => setMexcKey(e.target.value)} required className="bg-background/50 text-xs" />
                    <Input id="mexc-secret" type="password" placeholder="API Secret" value={mexcSecret} onChange={(e) => setMexcSecret(e.target.value)} required className="bg-background/50 text-xs" />
                    {mexcError && <p className="text-xs text-destructive">{mexcError}</p>}
                    {mexcSuccess && <p className="text-xs text-green-500">Erfolgreich verbunden</p>}
                    <Button type="submit" size="sm" className="h-7 gap-1.5 text-xs" disabled={mexcLoading}>
                      <Wallet className="h-3.5 w-3.5" />
                      {mexcLoading ? "Wird verbunden…" : "MEXC verbinden"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground/50">
                      API Key mit Nur-Lese-Rechten erstellen auf{" "}
                      <a href="https://www.mexc.com/user/openapi" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-2 hover:underline">
                        mexc.com/user/openapi
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </section>

            {/* Discord */}
            <section className="mb-3 overflow-hidden rounded-2xl border border-border/60 bg-card/60">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5865F2]/10">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#5865F2]">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Discord</p>
                  {dcConnected
                    ? <p className="text-xs text-muted-foreground/60">Verbunden als {dcUsername}</p>
                    : <p className="text-xs text-muted-foreground/60">Discord-Account verknüpfen</p>
                  }
                </div>
                {dcConnected && (
                  dcAvatar
                    ? <img src={dcAvatar} alt="Discord" className="h-7 w-7 rounded-full" />
                    : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20"><span className="h-2 w-2 rounded-full bg-green-500" /></span>
                )}
              </div>
              <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                {dcConnected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={async () => {
                      setDcLoading(true)
                      await fetch("/api/discord/disconnect", { method: "POST" })
                      setDcConnected(false); setDcUsername(""); setDcAvatar(null)
                      setDcLoading(false)
                    }}
                    disabled={dcLoading}
                  >
                    {dcLoading ? "Wird getrennt…" : "Verbindung trennen"}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    {dcError && <p className="text-xs text-destructive">{dcError}</p>}
                    {dcSuccess && <p className="text-xs text-green-500">Erfolgreich verbunden</p>}
                    <Button asChild size="sm" className="h-7 gap-1.5 bg-[#5865F2] text-xs hover:bg-[#4752C4]">
                      <a href="/api/discord/authorize">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
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
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Claude AI</p>
                  {claudeConnected
                    ? <p className="text-xs text-muted-foreground/60">Plattform-Verbindung aktiv</p>
                    : <p className="text-xs text-muted-foreground/60">KI-Assistenten aktivieren</p>
                  }
                </div>
                {claudeConnected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  </span>
                )}
              </div>
              {!claudeConnected && (
                <div className="border-t border-border/40 bg-muted/20 px-4 py-3">
                  {claudeError && <p className="mb-2 text-xs text-destructive">{claudeError}</p>}
                  {claudeSuccess && <p className="mb-2 text-xs text-green-500">Erfolgreich verbunden</p>}
                  <Button asChild size="sm" className="h-7 gap-1.5 text-xs">
                    <a href="/api/claude/authorize"><Sparkles className="h-3.5 w-3.5" />Mit Claude AI verbinden</a>
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* ── BENACHRICHTIGUNGEN ──────────────────────────────── */}
          <div data-category="benachrichtigungen" className="mt-10 scroll-mt-10">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Benachrichtigungen</p>

            <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#5865F2]">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <h3 className="text-sm font-semibold">Discord-Benachrichtigungen</h3>
              </div>

              {dcConnected ? (
                <div className="flex flex-col gap-2">
                  {[
                    { id: "calendar", label: "Kalender-Erinnerungen", desc: "DM vor deinen Terminen", value: dcNotifyCalendar, setter: setDcNotifyCalendar, key: "notifyCalendar" },
                    { id: "pages",    label: "Seiten-Aktivität",       desc: "Wenn jemand deine Seite bearbeitet", value: dcNotifyPages, setter: setDcNotifyPages, key: "notifyPages" },
                    { id: "daily",    label: "Tägliche Zusammenfassung", desc: "Morgens Events & Tasks", value: dcNotifyDaily, setter: setDcNotifyDaily, key: "notifyDaily" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground/60">{item.desc}</p>
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
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${item.value ? "bg-primary" : "bg-muted-foreground/25"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${item.value ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                      </button>
                    </div>
                  ))}
                  {dcNotifySaving && <p className="text-xs text-muted-foreground/50">Wird gespeichert…</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">
                  Verbinde Discord unter{" "}
                  <button onClick={() => scrollToCategory("verknuepfungen")} className="text-primary underline-offset-2 hover:underline">
                    Verknüpfungen
                  </button>
                  , um Benachrichtigungen zu aktivieren.
                </p>
              )}
            </section>
          </div>

          {/* ── WORKSPACES ─────────────────────────────────────── */}
          <div data-category="workspaces" className="mt-10 scroll-mt-10">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">Workspaces</p>

            <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="flex flex-col gap-2">
                {workspaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50">Keine Workspaces gefunden.</p>
                ) : (
                  workspaces.map((ws) => (
                    <div key={ws.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                        {ws.imageUrl
                          ? <img src={ws.imageUrl} alt={ws.name} className="h-full w-full object-cover" />
                          : <Building2 className="h-4 w-4 text-primary/60" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ws.name}</p>
                        <p className="text-xs text-muted-foreground/60 capitalize">{ws.userRole}</p>
                      </div>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        ws.plan === "enterprise"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-muted text-muted-foreground/60"
                      )}>
                        {ws.plan === "enterprise" ? "Enterprise" : "Free"}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground/50">
                Enterprise Plan?{" "}
                <a href="mailto:support@lumaspace.de" className="text-primary underline-offset-2 hover:underline">
                  support@lumaspace.de
                </a>
              </p>
            </section>
          </div>

          {/* ── ABMELDEN ───────────────────────────────────────── */}
          <div className="mt-10">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-left transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 text-destructive/70" />
              <span className="text-sm font-medium text-destructive/80">Abmelden</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
