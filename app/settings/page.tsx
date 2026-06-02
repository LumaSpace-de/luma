"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { data: session, update } = useSession()

  // Profile
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((d) => {
        setDisplayName(d.displayName ?? "")
        setUsername(d.username ?? "")
      })
      .catch(() => {})
  }, [])

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess(false)
    setProfileLoading(true)

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, username }),
    })

    const data = await res.json()
    if (!res.ok) {
      setProfileError(data.error || "Fehler beim Speichern")
    } else {
      setProfileSuccess(true)
      await update({ name: displayName })
    }
    setProfileLoading(false)
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

  const initials = (displayName || session?.user?.name || "?").slice(0, 2).toUpperCase()

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verwalte dein Konto</p>
        </div>

        {/* Profile section */}
        <section>
          <h2 className="text-base font-semibold">Profil</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Dein öffentliches Profil und dein Benutzername.
          </p>

          <form onSubmit={handleProfileSave} className="mt-4 flex flex-col gap-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium">{displayName || session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {username ? `@${username}` : "Noch kein Benutzername"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Anzeigename</Label>
              <Input
                id="displayName"
                placeholder="Dein Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Benutzername</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
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
              <p className="text-xs text-muted-foreground">
                Nur Buchstaben, Zahlen und _ · 3–30 Zeichen
              </p>
            </div>

            {profileError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Profil gespeichert
              </p>
            )}

            <Button type="submit" className="w-full" disabled={profileLoading}>
              {profileLoading ? "Wird gespeichert…" : "Profil speichern"}
            </Button>
          </form>
        </section>

        <Separator />

        {/* Password section */}
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
      </div>
    </div>
  )
}
