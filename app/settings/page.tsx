"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (newPw !== confirm) {
      setError("Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Fehler beim Ändern")
    } else {
      setSuccess(true)
      setCurrent("")
      setNewPw("")
      setConfirm("")
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">Verwalte dein Konto</p>

        <Separator className="my-6" />

        <section>
          <h2 className="text-base font-semibold">Passwort ändern</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Wähle ein sicheres Passwort mit mindestens 6 Zeichen.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Passwort erfolgreich geändert
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird gespeichert…" : "Passwort speichern"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
