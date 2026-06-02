import Link from "next/link"
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">LumaSpace</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Anmelden
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Registrieren</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12 text-center">
        <Badge
          variant="secondary"
          className="mb-8 gap-1.5 rounded-full border border-border/60 px-4 py-1.5 text-xs"
        >
          <Sparkles className="h-3 w-3 text-blue-400" />
          KI-gestützter Arbeitsbereich
        </Badge>

        <h1 className="max-w-3xl text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Plane deinen Tag.{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
            Einfach. Smart.
          </span>
        </h1>

        <p className="mt-6 max-w-lg text-balance text-base text-muted-foreground sm:text-lg">
          LumaSpace vereint Kalender, Aufgaben und Projekte in einem modernen
          Workspace — damit du dich auf das Wesentliche konzentrieren kannst.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/20">
              Kostenlos starten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="px-8 backdrop-blur-sm"
            >
              Ich habe ein Konto
            </Button>
          </Link>
        </div>

        {/* Social proof / hint */}
        <p className="mt-8 text-xs text-muted-foreground/60">
          Kein Kreditkarte erforderlich · Immer kostenlos starten
        </p>
      </main>

      {/* Bottom grid decoration */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--border)) 30%, hsl(var(--border)) 70%, transparent)",
        }}
      />
    </div>
  )
}
