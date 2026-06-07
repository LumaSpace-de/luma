import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bell, Check, Clock, Copy, FileText, GripVertical, LayoutGrid, Link as LinkIcon, Mail, MapPin, Plus, Repeat, Search, Smartphone, Sparkles, UserCircle, Building2, Camera } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FaqSection } from "@/components/faq-section"

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
          <span className="text-lg font-bold tracking-tight"></span>
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
          {/* ── Card 1: Timeline-Ansicht ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2 overflow-hidden">
                {/* View toggle */}
                <div className="mb-2 flex items-center gap-1">
                  <div className="flex items-center gap-0.5 rounded bg-muted/60 p-0.5">
                    <div className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[7px] text-muted-foreground">
                      <span>▦</span> Monat
                    </div>
                    <div className="flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[7px] text-primary-foreground">
                      <span>⏱</span> Zeitstrahl
                    </div>
                  </div>
                  <div className="ml-auto rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[7px] text-muted-foreground">
                    3 Tage ▾
                  </div>
                </div>
                {/* Timeline grid */}
                <div className="grid gap-px" style={{ gridTemplateColumns: "1.5rem 1fr 1fr 1fr" }}>
                  <div />
                  {["Mo", "Di", "Mi"].map((d) => (
                    <div key={d} className="py-0.5 text-center text-[7px] font-medium text-muted-foreground">{d}</div>
                  ))}
                  {[8, 9, 10, 11, 12].map((h) => (
                    <>
                      <div key={`h${h}`} className="pt-0.5 text-right text-[6px] text-muted-foreground/60 pr-0.5">{h}:00</div>
                      {[0, 1, 2].map((col) => (
                        <div key={col} className="min-h-[10px] border-t border-border/20 relative">
                          {h === 9 && col === 0 && (
                            <div className="absolute inset-x-0.5 top-0 h-[14px] rounded bg-blue-600/80 px-0.5">
                              <span className="text-[5px] text-white leading-none">Meeting</span>
                            </div>
                          )}
                          {h === 10 && col === 1 && (
                            <div className="absolute inset-x-0.5 top-0 h-[20px] rounded bg-green-700/80 px-0.5">
                              <span className="text-[5px] text-white leading-none">Sprint</span>
                            </div>
                          )}
                          {h === 11 && col === 2 && (
                            <div className="absolute inset-x-0.5 top-0 h-[14px] rounded bg-purple-600/80 px-0.5">
                              <span className="text-[5px] text-white leading-none">Call</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold">Timeline & Monatsraster</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Wechsle zwischen Monatsraster (1–6 Spalten) und Zeitstrahl (1–7 Tage).
              </p>
            </div>
          </div>

          {/* ── Card 2: Events mit Zeit & Standort ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                {/* Dialog header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground/80">Neues Event</span>
                  <div className="h-2.5 w-2.5 rounded-full bg-border/60" />
                </div>
                <p className="text-[8px] text-muted-foreground">Montag, 4. Juni 2026</p>
                {/* Title */}
                <div className="rounded-md border border-primary/50 bg-muted/40 px-2 py-1 ring-1 ring-primary/20">
                  <span className="text-[9px] text-foreground/80">Team-Meeting</span>
                </div>
                {/* Von/Bis */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                    <p className="text-[6px] text-muted-foreground">Von</p>
                    <p className="text-[8px] font-medium">09:00 ▾</p>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                    <p className="text-[6px] text-muted-foreground">Bis</p>
                    <p className="text-[8px] font-medium">10:30 ▾</p>
                  </div>
                </div>
                {/* Standort */}
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                  <MapPin className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                  <span className="text-[8px] text-foreground/70">Berlin, Deutschland</span>
                </div>
                {/* Colors */}
                <div className="flex items-center gap-1.5">
                  {["bg-blue-600", "bg-green-700", "bg-red-600", "bg-yellow-600", "bg-purple-600"].map((c, i) => (
                    <div key={i} className={`h-3 w-3 rounded-full ${c} ${i === 0 ? "ring-2 ring-offset-1 ring-offset-background ring-white/40" : ""}`} />
                  ))}
                </div>
                <div className="flex justify-end gap-1.5">
                  <div className="rounded bg-muted px-2 py-0.5 text-[7px] text-muted-foreground">Abbrechen</div>
                  <div className="rounded bg-primary px-2 py-0.5 text-[7px] text-primary-foreground">Erstellen</div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Events mit Zeit & Standort</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Von/Bis-Zeitraum, GPS-Standort und Farbe – alles in einem kompakten Dialog.
              </p>
            </div>
          </div>

          {/* ── Card 3: Kalenderraster ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2">
                {/* Column picker */}
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-[7px] text-muted-foreground">Spalten</span>
                  <div className="flex gap-0.5 ml-1">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className={`flex h-4 w-4 items-center justify-center rounded text-[8px] font-medium ${
                          n === 4 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 4-column grid */}
                <div className="grid grid-cols-4 gap-px border-t border-border/40">
                  {["Mo", "Di", "Mi", "Do"].map((d) => (
                    <div key={d} className="py-0.5 text-center text-[7px] text-muted-foreground">{d}</div>
                  ))}
                  {[
                    { d: "1", ev: null }, { d: "2", ev: "bg-blue-600" }, { d: "3", ev: null }, { d: "4", today: true },
                    { d: "8", ev: "bg-green-700" }, { d: "9", ev: null }, { d: "10", ev: null }, { d: "11", ev: "bg-yellow-600" },
                    { d: "15", ev: null }, { d: "16", ev: "bg-purple-600" }, { d: "17", ev: null }, { d: "18", ev: null },
                  ].map(({ d, ev, today }: { d: string; ev?: string | null; today?: boolean }, i) => (
                    <div key={i} className="min-h-[18px] rounded-sm border border-border/20 p-0.5">
                      <span className={`flex h-3 w-3 items-center justify-center rounded-full text-[7px] mx-auto ${today ? "bg-primary text-primary-foreground" : "text-foreground/50"}`}>{d}</span>
                      {ev && <div className={`mt-0.5 h-0.5 w-full rounded-full ${ev}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">Flexible Spaltenansicht</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                1 bis 6 Spalten im Monatsraster – passe die Dichte an deinen Workflow an.
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
                  const plans = ["Free Plan", "Free Plan", "Enterprise Plan"]
                  const colors = ["bg-muted text-muted-foreground", "bg-muted text-muted-foreground", "bg-purple-500/20 text-purple-400"]
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
                Organisiere deine Projekte in Workspaces – kostenlos oder als verifiziertes Unternehmen.
              </p>
            </div>
          </div>

          {/* ── Card 5: Seiten-Editor ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 overflow-hidden">
                {/* Editor header */}
                <div className="flex items-center justify-between border-b border-border/30 px-2.5 py-1.5">
                  <div className="flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5 text-muted-foreground/60" />
                    <span className="text-[8px] text-muted-foreground">Sprint Planning</span>
                  </div>
                  <span className="text-[6px] text-muted-foreground/40">Gespeichert ✓</span>
                </div>
                {/* Editor content */}
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[11px] font-bold text-foreground/90">Sprint Planning Q3</p>
                  <div className="space-y-1">
                    <div className="h-[6px] w-full rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-4/5 rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-full rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-3/5 rounded-sm bg-muted/40" />
                  </div>
                  {/* Sidebar mini */}
                  <div className="mt-1.5 space-y-0.5 border-t border-border/30 pt-1.5">
                    {["Meeting Notes", "↳ Sprint Planning", "↳ Retrospektive", "Roadmap Q3"].map((t, i) => (
                      <div key={i} className={`text-[7px] ${i === 1 ? "text-primary font-medium" : "text-muted-foreground/60"}`}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Seiten-Editor</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Verschachtelte Seiten mit vollständigem Editor und automatischem Speichern.
              </p>
            </div>
          </div>

          {/* ── Card 6: Profil & Avatar ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2">
                {/* Avatar with camera overlay */}
                <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-bold text-primary">
                      PB
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-70">
                      <Camera className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold">Prodbybezo</p>
                    <p className="text-[8px] text-muted-foreground">@prodbybezo</p>
                    <p className="text-[7px] text-muted-foreground/50 mt-0.5">JPG · PNG · WebP</p>
                  </div>
                </div>
                {/* Fields */}
                {[
                  { label: "Name", value: "Prodbybezo" },
                  { label: "@Benutzername", value: "prodbybezo" },
                  { label: "Passwort", value: "••••••••" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-md border border-border/40 bg-muted/30 px-2 py-1">
                    <p className="text-[6px] text-muted-foreground">{label}</p>
                    <p className="text-[8px] font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">Profil & Einstellungen</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Profilbild hochladen, Name, @Benutzername und Passwort jederzeit ändern.
              </p>
            </div>
          </div>

        </div>

        {/* ── Third row ── */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">

          {/* ── Card 7: Apple Kalender Sync ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-2.5 w-2.5 text-muted-foreground/60" />
                  <span className="text-[9px] font-semibold text-foreground/80">Mit Apple Kalender verbinden</span>
                </div>
                <p className="text-[7px] leading-snug text-muted-foreground">
                  Abonniere deinen LumaSpace-Kalender – neue & geänderte Events werden automatisch übernommen.
                </p>
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                  <LinkIcon className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                  <span className="flex-1 truncate text-[7px] text-foreground/70">webcal://lumaspace.de/api/calendar/ics/a1b2…</span>
                  <Copy className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                </div>
                <div className="flex items-center justify-center rounded-md bg-primary px-2 py-1 text-[8px] font-medium text-primary-foreground">
                  In Apple Kalender öffnen
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold">Apple Kalender Sync</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Abonniere deinen Kalender per ICS-Link – Events erscheinen automatisch in Apple Kalender & Co.
              </p>
            </div>
          </div>

          {/* ── Card 8: Wiederkehrende Events & Erinnerungen ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Repeat className="h-2.5 w-2.5 text-muted-foreground/60" />
                  <span className="text-[9px] font-semibold text-foreground/80">Wiederholung & Erinnerung</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                    <p className="text-[6px] text-muted-foreground">Wiederholt sich</p>
                    <p className="text-[8px] font-medium">Wöchentlich ▾</p>
                  </div>
                  <div className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                    <p className="text-[6px] text-muted-foreground">Erinnerung</p>
                    <p className="text-[8px] font-medium">30 Min. vorher ▾</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                  <Bell className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                  <span className="text-[8px] text-foreground/70">Browser-Benachrichtigung aktiv</span>
                </div>
                <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground">
                  <Repeat className="h-2.5 w-2.5 text-green-500" />
                  Jeden Montag · 09:00 Uhr
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Wiederkehrende Events</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Täglich, wöchentlich, monatlich oder jährlich – inklusive Browser-Erinnerungen.
              </p>
            </div>
          </div>

          {/* ── Card 9: Suche, Filter & Drag and Drop ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                  <Search className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                  <span className="text-[8px] text-foreground/40">Events durchsuchen…</span>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { l: "Arbeit", c: "bg-blue-500", active: true },
                    { l: "Privat", c: "bg-green-600", active: false },
                    { l: "Sport", c: "bg-purple-500", active: false },
                  ].map(({ l, c, active }, i) => (
                    <div key={i} className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] ${active ? "border-primary/50 bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c}`} />
                      {l}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-dashed border-primary/50 bg-primary/5 px-1.5 py-1">
                  <GripVertical className="h-2.5 w-2.5 shrink-0 text-primary/60" />
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span className="flex-1 truncate text-[8px] text-foreground/70">Team-Meeting</span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground/40" />
                  <span className="shrink-0 text-[7px] text-muted-foreground/50">Mi 10. Juni</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">Suche, Filter & Drag and Drop</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Events durchsuchen, nach Labels filtern und per Drag and Drop auf neue Tage verschieben.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-28">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Einfache Preise</h2>
          <p className="mt-3 text-muted-foreground">
            Kostenlos für jeden – oder maßgeschneidert für dein Unternehmen.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">

          {/* ── Free ── */}
          <div className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            <div className="mb-6">
              <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Free
              </span>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">€0</span>
                <span className="mb-1 text-sm text-muted-foreground">/ Monat</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Für immer kostenlos. Kein Kreditkarte nötig.
              </p>
            </div>

            <ul className="mb-8 flex flex-col gap-3 text-sm">
              {[
                "Kalender mit Monatsraster & Timeline",
                "Seiten-Editor mit verschachtelten Seiten",
                "Privater Bereich & Favoriten",
                "Workspace mit unbegrenzten Mitgliedern",
                "Einladungssystem für Mitglieder",
                "Profil mit Avatar & Benutzername",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Link href="/signup">
                <button className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                  Kostenlos starten
                </button>
              </Link>
            </div>
          </div>

          {/* ── Enterprise ── */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-card/40 p-8 backdrop-blur-sm">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/8 via-transparent to-transparent" />

            <div className="relative mb-6">
              <span className="inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                Enterprise
              </span>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">Auf Anfrage</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Nur für verifizierte Unternehmen. Melde dich bei uns.
              </p>
            </div>

            <ul className="relative mb-8 flex flex-col gap-3 text-sm">
              {[
                "Alles aus Free",
                "Unbegrenzte Workspaces",
                "SSO & eigene Domain",
                "Dedizierter Support & SLA",
                "Erweiterte Rollen & Berechtigungen",
                "Unternehmens-Verifizierung erforderlich",
              ].map((f, i) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${i === 5 ? "text-purple-400" : "text-green-500"}`} />
                  <span className={i === 5 ? "font-medium text-purple-300" : "text-muted-foreground"}>{f}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-auto">
              <a href="mailto:support@lumaspace.de?subject=Enterprise-Anfrage">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500">
                  <Mail className="h-4 w-4" />
                  Anfrage stellen
                </button>
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground/60">
                support@lumaspace.de · Wir melden uns innerhalb 24h
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40 py-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/50">
          <Link href="/impressum" className="hover:text-muted-foreground transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-muted-foreground transition-colors">Datenschutz</Link>
          <Link href="/agb" className="hover:text-muted-foreground transition-colors">AGB</Link>
          <span>·</span>
          <span>
            Powered by{" "}
            <span className="font-semibold text-muted-foreground">Flux Network</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
