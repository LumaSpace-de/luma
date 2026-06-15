import { ArrowRight, Building2, Shield } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getWorkspaceBySlug } from "@/lib/workspaces-db"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ws = await getWorkspaceBySlug(params.slug)
  if (!ws) return { title: "Workspace nicht gefunden" }
  return {
    title: `${ws.name} – LumaSpace`,
    description: `Tritt dem Workspace ${ws.name} auf LumaSpace bei.`,
  }
}

export default async function WorkspaceLandingPage({ params }: Props) {
  const ws = await getWorkspaceBySlug(params.slug)
  if (!ws) notFound()

  const initials = ws.name.slice(0, 2).toUpperCase()
  const loginUrl = `/login?callbackUrl=/dashboard`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="text-primary">LumaSpace</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 shadow-sm">
            {/* Workspace avatar */}
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-border bg-muted shadow">
              {ws.imageUrl ? (
                <img src={ws.imageUrl} alt={ws.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + badge */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">{ws.name}</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500">
                <Shield className="h-3 w-3" />
                Enterprise Workspace
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Dieser Workspace ist für Mitglieder von <span className="font-semibold text-foreground">{ws.name}</span>.
              Melde dich mit deinem LumaSpace-Konto an, um Zugang zu erhalten.
            </p>

            {/* Login CTA */}
            <Link
              href={loginUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Als Mitglied einloggen
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              Powered by LumaSpace
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
