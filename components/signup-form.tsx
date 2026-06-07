"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [betaCode, setBetaCode] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, betaCode }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Registrierung fehlgeschlagen")
      setLoading(false)
      return
    }

    // Auto-login after successful signup
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Konto erstellt – bitte anmelden")
      setLoading(false)
      window.location.href = "/login"
    } else {
      window.location.href = "/calendar"
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Schon ein Konto?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Anmelden
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="betaCode">Beta-Code</Label>
          <Input
            id="betaCode"
            type="text"
            placeholder="Dein Beta-Zugangscode"
            value={betaCode}
            onChange={(e) => setBetaCode(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 6 Zeichen"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Passwort bestätigen</Label>
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Konto wird erstellt…" : "Konto erstellen"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground/60">
        Mit der Registrierung stimmst du unseren{" "}
        <a href="#" className="underline underline-offset-4">Nutzungsbedingungen</a> zu.
      </p>
    </div>
  )
}
