"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BetaVerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/beta-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Ungültiger Beta-Code")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Badge */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
            🔒
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Beta-Zugang</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              LumaSpace ist aktuell nur für Beta-Tester zugänglich.
              <br />
              Gib deinen Zugangscode ein um fortzufahren.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code">Beta-Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Dein Zugangscode"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Prüfe…" : "Zugang bestätigen"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Noch kein Beta-Tester?{" "}
          <a href="mailto:support@lumaspace.de" className="underline underline-offset-4 hover:text-foreground">
            Kontakt aufnehmen
          </a>
        </p>
      </div>
    </div>
  )
}
