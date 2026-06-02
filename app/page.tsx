import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, FileText, LayoutGrid, Plus, Sparkles, UserCircle, Building2, Lock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo_icon.png"
            alt="LumaSpace Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
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

      {/* ── Hero ───────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-16 pt-12 text-center">
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
          Workspace – damit du dich auf das Wesentliche konzentrieren kannst.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/20">
              Kostenlos starten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 backdrop-blur-sm">
              Ich habe ein Konto
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/50">
          Kein Kreditkarte erforderlich · Immer kostenlos starten
        </p>
      </main>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Alles was du brauchst
          </h2>
          <p className="mt-3 text-muted-foreground">
            Produktivität und Übersicht – in einer App.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* ── Card 1: Kalender ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            {/* App mockup */}
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2">
                {/* Weekday header */}
                <div className="mb-1 grid grid-cols-6 gap-px">
                  {["Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((d) => (
                    <div key={d} className="py-0.5 text-center text-[8px] text-muted-foreground">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                {[
                  [{ d: 1 }, { d: 2 }, { d: 3 }, { d: 4, today: true }, { d: 5, ev: "bg-blue-600" }, { d: 6 }],
                  [{ d: 7 }, { d: 8, ev: "bg-green-700" }, { d: 9 }, { d: 10 }, { d: 11, ev: "bg-yellow-600" }, { d: 12 }],
                  [{ d: 13, ev: "bg-purple-600" }, { d: 14 }, { d: 15 }, { d: 16 }, { d: 17 }, { d: 18, ev: "bg-red-600" }],
                  [{ d: 19 }, { d: 20 }, { d: 21, ev: "bg-blue-600" }, { d: 22 }, { d: 23 }, { d: 24 }],
                ].map((week, wi) => (
                  <div key={wi} className="grid grid-cols-6 gap-px">
                    {week.map(({ d, today, ev }: { d: number; today?: boolean; ev?: string }, di) => (
                      <div key={di} className="min-h-[20px] p-0.5">
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] mx-auto ${
                            today ? "bg-primary text-primary-foreground" : "text-foreground/60"
                          }`}
                        >
                          {d}
                        </span>
                        {ev && <div className={`mt-0.5 h-1 w-full rounded-full ${ev}`} />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold">Kalender-Ansicht</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Behalte alle Termine im Blick – mit farbigen Events und monatlicher Übersicht.
              </p>
            </div>
          </div>

          {/* ── Card 2: Events erstellen ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2">
                {/* Dialog header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground/80">
                    Neues Event
                  </span>
                  <div className="h-2.5 w-2.5 rounded-full bg-border/60" />
                </div>
                {/* Date hint */}
                <p className="text-[8px] text-muted-foreground">Montag, 4. Juni 2026</p>
                {/* Title field */}
                <div className="rounded-md border border-border/50 bg-muted/40 px-2 py-1.5">
                  <span className="text-[9px] text-muted-foreground">Event-Titel</span>
                </div>
                {/* Time field */}
                <div className="rounded-md border border-primary/50 bg-muted/40 px-2 py-1.5 ring-1 ring-primary/20">
                  <span className="text-[9px] text-foreground/80">09:00</span>
                </div>
                {/* Color picker */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[
                    { c: "bg-blue-600", ring: true },
                    { c: "bg-green-700" },
                    { c: "bg-red-600" },
                    { c: "bg-yellow-600" },
                    { c: "bg-purple-600" },
                  ].map(({ c, ring }, i) => (
                    <div
                      key={i}
                      className={`h-3.5 w-3.5 rounded-full ${c} ${ring ? "ring-2 ring-offset-1 ring-offset-background ring-white/40" : ""}`}
                    />
                  ))}
                </div>
                {/* Action buttons */}
                <div className="flex justify-end gap-1.5 pt-1">
                  <div className="rounded bg-muted px-2 py-0.5 text-[8px] text-muted-foreground">
                    Abbrechen
                  </div>
                  <div className="rounded bg-primary px-2 py-0.5 text-[8px] text-primary-foreground">
                    Erstellen
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Events erstellen</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Füge Events mit Uhrzeit, Farbe und Beschreibung in wenigen Sekunden hinzu.
              </p>
            </div>
          </div>

          {/* ── Card 3: Spalten ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2">
                {/* Column picker */}
                <div className="mb-2 flex items-center justify-end gap-0.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={`flex h-4 w-4 items-center justify-center rounded text-[8px] font-medium ${
                        n === 3 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                {/* 3-column grid */}
                <div className="grid grid-cols-3 gap-px border-t border-border/40">
                  {["Mo", "Di", "Mi"].map((d) => (
                    <div key={d} className="py-0.5 text-center text-[8px] text-muted-foreground">
                      {d}
                    </div>
                  ))}
                  {[
                    { d: "1", ev: null },
                    { d: "2", ev: "bg-blue-600" },
                    { d: "3", ev: null },
                    { d: "8", ev: "bg-green-700" },
                    { d: "9", ev: null },
                    { d: "10", ev: null },
                    { d: "15", ev: null },
                    { d: "16", ev: null },
                    { d: "17", ev: "bg-yellow-600" },
                    { d: "22", ev: "bg-purple-600" },
                    { d: "23", ev: null },
                    { d: "24", ev: null },
                  ].map(({ d, ev }, i) => (
                    <div
                      key={i}
                      className="min-h-[22px] rounded-sm border border-border/20 p-0.5"
                    >
                      <span className="text-[8px] text-foreground/50">{d}</span>
                      {ev && <div className={`mt-0.5 h-1 w-full rounded-full ${ev}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">Flexible Ansicht</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Wähle zwischen 1 und 6 Spalten – passe den Kalender an deinen Workflow an.
              </p>
            </div>
          </div>
        </div>

        {/* ── Second row ── */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">

          {/* ── Card 4: Workspaces ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2">
                {["FLUX0 WORKSPACE", "Stark Industries", "Wayne Enterprises"].map((name, i) => {
                  const plans = ["Pro Plan", "Free Plan", "Enterprise Plan"]
                  const colors = ["bg-blue-500/20 text-blue-400", "bg-muted text-muted-foreground", "bg-purple-500/20 text-purple-400"]
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/30 px-2 py-1.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/20 text-[8px] font-bold text-primary">
                        {name[0]}
                      </div>
                      <span className="flex-1 truncate text-[9px] font-medium">{name}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-medium ${colors[i]}`}>{plans[i]}</span>
                    </div>
                  )
                })}
                <div className="flex items-center gap-1 pt-0.5 text-[8px] text-muted-foreground">
                  <Plus className="h-2.5 w-2.5" />
                  Neuer Workspace
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold">Workspaces</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Organisiere deine Projekte in Workspaces – mit Free, Pro und Enterprise Plan.
              </p>
            </div>
          </div>

          {/* ── Card 5: Seiten ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Workspace</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  {[
                    { title: "Meeting Notes", depth: 0 },
                    { title: "Sprint Planning", depth: 1 },
                    { title: "Retrospektive", depth: 1 },
                    { title: "Roadmap Q3", depth: 0 },
                    { title: "Design Specs", depth: 1 },
                  ].map((page, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded py-0.5 text-[9px] text-foreground/70"
                      style={{ paddingLeft: `${4 + page.depth * 12}px` }}
                    >
                      <FileText className="h-2.5 w-2.5 shrink-0 text-muted-foreground/60" />
                      {page.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Seiten & Dokumente</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Erstelle verschachtelte Seiten in deinem Workspace – direkt aus der Sidebar.
              </p>
            </div>
          </div>

          {/* ── Card 6: Profil ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2.5">
                {/* Avatar row */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-bold text-primary">
                    PB
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold">Prodbybezo</p>
                    <p className="text-[8px] text-muted-foreground">@prodbybezo</p>
                  </div>
                </div>
                {/* Fields */}
                {[
                  { label: "Name", value: "Prodbybezo" },
                  { label: "@Benutzername", value: "prodbybezo" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-md border border-border/40 bg-muted/30 px-2 py-1">
                    <p className="text-[7px] text-muted-foreground">{label}</p>
                    <p className="text-[9px] font-medium">{value}</p>
                  </div>
                ))}
                {/* Password row */}
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" />
                  Passwort ändern
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">Profil & Einstellungen</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Profilbild hochladen, Name, @Benutzername und Passwort verwalten.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40 py-6 text-center">
        <p className="text-xs text-muted-foreground/50">
          Powered by{" "}
          <span className="font-semibold text-muted-foreground">Flux Network</span>
        </p>
      </footer>
    </div>
  )
}
