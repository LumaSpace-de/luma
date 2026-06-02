"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  // Username
  const [username, setUsername] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [usernameSuccess, setUsernameSuccess] = useState(false)

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
      .then((d) => setUsername(d.username ?? ""))
      .catch(() => {})
  }, [])

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
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verwalte dein Konto</p>
        </div>

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
              <p className="text-xs text-muted-foreground">
                Buchstaben, Zahlen und _ · 3–30 Zeichen
              </p>
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
      </div>
    </div>
  )
}
