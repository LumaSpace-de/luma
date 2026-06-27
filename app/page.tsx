import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Camera,
  Check,
  Clock,
  Copy,
  FileText,
  Globe,
  GripVertical,
  Heading1,
  LayoutGrid,
  Link as LinkIcon,
  ListChecks,
  Mail,
  MapPin,
  Plus,
  Repeat,
  Search,
  ScrollText,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FaqSection } from "@/components/faq-section"
import { cn } from "@/lib/utils"

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
          LumaSpace vereint Kalender, Aufgaben, Trading-Tools und Projekte in einem
          modernen Workspace – damit du dich auf das Wesentliche konzentrieren kannst.
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

      {/* ── Calendar Hero Image ────────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold sm:text-xl">Juni 2026</h3>
              <div className="flex gap-1">
                <div className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Monat</div>
                <div className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">Woche</div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-muted-foreground">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {[1,2,3,4,5,6,7].map(day => (
                <div key={day} className={cn("min-h-[60px] rounded-lg border border-transparent p-1.5 sm:min-h-[72px]", day === 3 && "border-blue-500/30 bg-blue-500/5")}>
                  <span className={cn("text-xs", day === 3 ? "font-bold text-blue-400" : "text-muted-foreground/70")}>{day}</span>
                  {day === 1 && <div className="mt-1 rounded bg-purple-500/20 px-1 py-0.5 text-[10px] text-purple-400 sm:text-[11px]">Sprint Start</div>}
                  {day === 3 && <div className="mt-1 rounded bg-blue-500/20 px-1 py-0.5 text-[10px] text-blue-400 sm:text-[11px]">Team-Meeting</div>}
                  {day === 5 && <div className="mt-1 rounded bg-green-500/20 px-1 py-0.5 text-[10px] text-green-400 sm:text-[11px]">Release v2.0</div>}
                </div>
              ))}
              {[8,9,10,11,12,13,14].map(day => (
                <div key={day} className="min-h-[60px] rounded-lg p-1.5 sm:min-h-[72px]">
                  <span className="text-xs text-muted-foreground/70">{day}</span>
                  {day === 10 && <div className="mt-1 rounded bg-amber-500/20 px-1 py-0.5 text-[10px] text-amber-400 sm:text-[11px]">Design Review</div>}
                  {day === 12 && <div className="mt-1 rounded bg-red-500/20 px-1 py-0.5 text-[10px] text-red-400 sm:text-[11px]">Deadline</div>}
                </div>
              ))}
              {[15,16,17,18,19,20,21].map(day => (
                <div key={day} className={cn("min-h-[60px] rounded-lg p-1.5 sm:min-h-[72px]", day === 20 && "ring-2 ring-primary/40")}>
                  <span className={cn("text-xs", day === 20 ? "font-bold text-primary" : "text-muted-foreground/70")}>{day}</span>
                  {day === 15 && <div className="mt-1 rounded bg-blue-500/20 px-1 py-0.5 text-[10px] text-blue-400 sm:text-[11px]">Standup</div>}
                  {day === 18 && <div className="mt-1 rounded bg-green-500/20 px-1 py-0.5 text-[10px] text-green-400 sm:text-[11px]">Launch</div>}
                  {day === 20 && <div className="mt-1 rounded bg-primary/20 px-1 py-0.5 text-[10px] text-primary sm:text-[11px]">Heute</div>}
                </div>
              ))}
              {[22,23,24,25,26,27,28].map(day => (
                <div key={day} className="min-h-[60px] rounded-lg p-1.5 sm:min-h-[72px]">
                  <span className="text-xs text-muted-foreground/70">{day}</span>
                  {day === 24 && <div className="mt-1 rounded bg-purple-500/20 px-1 py-0.5 text-[10px] text-purple-400 sm:text-[11px]">Retrospektive</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Integration Logo Cloud ──────────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
          Verknüpfe deine Tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {/* MEXC */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                <rect width="32" height="32" rx="6" fill="#1B69E1" fillOpacity="0.15" />
                <text x="16" y="21" textAnchor="middle" className="fill-blue-400 text-[11px] font-bold">M</text>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">MEXC</span>
          </div>

          {/* GitHub */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-foreground/80">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">GitHub</span>
          </div>

          {/* Apple Calendar */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                <rect width="32" height="32" rx="6" fill="#FF3B30" fillOpacity="0.15" />
                <rect x="6" y="10" width="20" height="16" rx="3" className="stroke-red-400" strokeWidth="1.5" fill="none" />
                <line x1="6" y1="15" x2="26" y2="15" className="stroke-red-400" strokeWidth="1.5" />
                <line x1="12" y1="10" x2="12" y2="7" className="stroke-red-400" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="10" x2="20" y2="7" className="stroke-red-400" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="11" cy="20" r="1.2" className="fill-red-400" />
                <circle cx="16" cy="20" r="1.2" className="fill-red-400" />
                <circle cx="21" cy="20" r="1.2" className="fill-red-400/50" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Apple Kalender</span>
          </div>

          {/* Google Calendar */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                <rect x="6" y="10" width="20" height="16" rx="3" className="stroke-blue-400" strokeWidth="1.5" fill="none" />
                <line x1="6" y1="15" x2="26" y2="15" className="stroke-blue-400" strokeWidth="1.5" />
                <line x1="12" y1="10" x2="12" y2="7" className="stroke-blue-400" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="10" x2="20" y2="7" className="stroke-blue-400" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 19l2 2 5-5" className="stroke-green-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Google Kalender</span>
          </div>

          {/* Outlook */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                <rect width="32" height="32" rx="6" fill="#0078D4" fillOpacity="0.15" />
                <rect x="7" y="8" width="18" height="16" rx="2" className="stroke-blue-500" strokeWidth="1.5" fill="none" />
                <path d="M7 11l9 6 9-6" className="stroke-blue-500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Outlook</span>
          </div>

          {/* Discord */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[#5865F2]">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Discord</span>
          </div>

          {/* Slack */}
          <div className="group flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm transition-all group-hover:border-border group-hover:shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                <rect width="32" height="32" rx="6" fill="transparent" />
                <rect x="8" y="13" width="4" height="8" rx="2" className="fill-emerald-400" />
                <rect x="14" y="8" width="4" height="8" rx="2" className="fill-blue-400" />
                <rect x="20" y="13" width="4" height="8" rx="2" className="fill-yellow-400" />
                <rect x="14" y="18" width="4" height="8" rx="2" className="fill-red-400" />
                <circle cx="10" cy="11" r="2" className="fill-emerald-400" />
                <circle cx="22" cy="11" r="2" className="fill-blue-400" />
                <circle cx="10" cy="23" r="2" className="fill-yellow-400" />
                <circle cx="22" cy="23" r="2" className="fill-red-400" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">Slack</span>
          </div>
        </div>
      </section>

      {/* ── Features: Kalender & Produktivität ─────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Alles was du brauchst
          </h2>
          <p className="mt-3 text-muted-foreground">
            Kalender, Seiten-Editor und smarte Blöcke – in einer App.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* ── Card 1: Timeline-Ansicht ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2 overflow-hidden">
                <div className="mb-1.5 flex items-center gap-1">
                  <div className="flex items-center gap-0.5 rounded bg-muted/60 p-0.5">
                    <div className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[7px] text-muted-foreground">
                      <span>▦</span> Monat
                    </div>
                    <div className="flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[7px] text-primary-foreground">
                      <span>⏱</span> Woche
                    </div>
                  </div>
                  <div className="ml-auto rounded border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[7px] text-muted-foreground">
                    KW 24 · Juni 2026
                  </div>
                </div>
                <div className="grid gap-px" style={{ gridTemplateColumns: "1.4rem 1fr 1fr 1fr" }}>
                  <div />
                  {[{ d: "Mo 8" }, { d: "Di 9", today: true }, { d: "Mi 10" }].map(({ d, today }) => (
                    <div key={d} className="pb-1 text-center">
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-medium leading-none ${today ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{d}</span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-px" style={{ gridTemplateColumns: "1.4rem 1fr 1fr 1fr" }}>
                  <div />
                  {["c0", "c1", "c2"].map((c) => <div key={c} />)}
                  {[8, 9, 10, 11, 12].map((h) => (
                    <>
                      <div key={`h${h}`} className="pt-1 text-right text-[7px] leading-none text-muted-foreground/60 pr-0.5">{h}:00</div>
                      {[0, 1, 2].map((col) => (
                        <div key={col} className="min-h-[18px] border-t border-border/20 relative">
                          {h === 9 && col === 0 && (
                            <div className="absolute inset-x-0.5 top-0 flex h-[20px] items-center overflow-hidden rounded-sm border-l-2 border-blue-500 bg-blue-600/15 px-1.5">
                              <span className="truncate text-[7px] leading-none text-blue-300">Meeting</span>
                            </div>
                          )}
                          {h === 10 && col === 1 && (
                            <div className="absolute inset-x-0.5 top-0 flex h-[34px] flex-col justify-center gap-1 overflow-hidden rounded-sm border-l-2 border-green-600 bg-green-700/15 px-1.5">
                              <span className="truncate text-[7px] leading-none text-green-300">Sprint Planning</span>
                              <span className="flex items-center gap-0.5 truncate text-[6px] leading-none text-green-300/70">
                                <MapPin className="h-[6px] w-[6px] shrink-0" /> Büro
                              </span>
                            </div>
                          )}
                          {h === 11 && col === 2 && (
                            <div className="absolute inset-x-0.5 top-0 flex h-[20px] items-center overflow-hidden rounded-sm border-l-2 border-purple-500 bg-purple-600/15 px-1.5">
                              <span className="truncate text-[7px] leading-none text-purple-300">Call</span>
                            </div>
                          )}
                          {h === 11 && col === 0 && (
                            <div className="absolute inset-x-0 top-1/2 h-px bg-red-500/70">
                              <span className="absolute -left-px -top-[1.5px] h-1 w-1 rounded-full bg-red-500" />
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
                Wechsle zwischen Monatsraster (1–6 Spalten), Wochenansicht und Zeitstrahl mit Live-Indikator.
              </p>
            </div>
          </div>

          {/* ── Card 2: Events mit Zeit & Standort ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground/80">Neues Event</span>
                  <div className="h-2.5 w-2.5 rounded-full bg-border/60" />
                </div>
                <p className="text-[8px] text-muted-foreground">Montag, 4. Juni 2026</p>
                <div className="rounded-md border border-primary/50 bg-muted/40 px-2 py-1 ring-1 ring-primary/20">
                  <span className="text-[9px] text-foreground/80">Team-Meeting</span>
                </div>
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
                <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-1.5 py-1">
                  <MapPin className="h-2 w-2 shrink-0 text-muted-foreground/60" />
                  <span className="text-[8px] text-foreground/70">Berlin, Deutschland</span>
                </div>
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

          {/* ── Card 3: Block-System ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-foreground/80">Block einfügen</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { icon: <ListChecks className="h-2.5 w-2.5 text-sky-400" />, label: "Checkliste" },
                    { icon: <Target className="h-2.5 w-2.5 text-rose-400" />, label: "Fortschritt" },
                    { icon: <Globe className="h-2.5 w-2.5 text-indigo-400" />, label: "Embed" },
                    { icon: <BarChart3 className="h-2.5 w-2.5 text-lime-400" />, label: "Habit Tracker" },
                    { icon: <Heading1 className="h-2.5 w-2.5 text-purple-400" />, label: "Überschrift" },
                    { icon: <Wallet className="h-2.5 w-2.5 text-amber-400" />, label: "Portfolio" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-1.5 py-1">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted/80">{b.icon}</span>
                      <span className="text-[8px] font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-md border border-border/40 bg-muted/20 p-1.5">
                  <div className="flex items-center gap-1 mb-1">
                    <ListChecks className="h-2 w-2 text-sky-400" />
                    <span className="text-[7px] font-semibold">Sprint Tasks</span>
                  </div>
                  <div className="space-y-0.5">
                    {["API Endpoints", "Unit Tests", "Deploy"].map((t, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={cn("h-2 w-2 rounded-sm border", i < 2 ? "border-emerald-500 bg-emerald-500/30" : "border-border/60")} />
                        <span className={cn("text-[7px]", i < 2 ? "text-muted-foreground line-through" : "text-foreground/80")}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold">17+ Block-Typen</h3>
                <Badge className="rounded-full bg-purple-500/15 px-2 py-0 text-[10px] font-medium text-purple-400 hover:bg-purple-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Checklisten, Fortschritt, Embeds, Bilder, Bookmarks, Habit Tracker und mehr – alles per Drag & Drop.
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
                <div className="flex items-center justify-between border-b border-border/30 px-2.5 py-1.5">
                  <div className="flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5 text-muted-foreground/60" />
                    <span className="text-[8px] text-muted-foreground">Sprint Planning</span>
                  </div>
                  <span className="text-[6px] text-muted-foreground/40">Gespeichert ✓</span>
                </div>
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[11px] font-bold text-foreground/90">Sprint Planning Q3</p>
                  <div className="space-y-1">
                    <div className="h-[6px] w-full rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-4/5 rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-full rounded-sm bg-muted/60" />
                    <div className="h-[6px] w-3/5 rounded-sm bg-muted/40" />
                  </div>
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
                Verschachtelte Seiten mit vollständigem Editor, Blöcken und automatischem Speichern.
              </p>
            </div>
          </div>

          {/* ── Card 6: Apple Kalender Sync ── */}
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
        </div>

        {/* ── Third row ── */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">

          {/* ── Card 7: Wiederkehrende Events ── */}
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

          {/* ── Card 8: Profil & Einstellungen ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2">
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
                Profilbild, Name, @Benutzername und Passwort jederzeit ändern.
              </p>
            </div>
          </div>

          {/* ── Card 9: Suche, Filter & DnD ── */}
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
                <h3 className="font-semibold">Suche & Drag and Drop</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Events durchsuchen, nach Labels filtern und per Drag & Drop verschieben.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features: Trading & Finanzen ────────────────────── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-600/6 blur-[100px]" />
        </div>

        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            Trading-Integration
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dein Trading-Dashboard
          </h2>
          <p className="mt-3 text-muted-foreground">
            MEXC Exchange direkt in deinem Workspace – Portfolio, PnL und Trade Logs als Blöcke.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">

          {/* ── Trading Card 1: MEXC Portfolio ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-2.5 w-2.5 text-amber-400" />
                    <span className="text-[9px] font-semibold">MEXC Portfolio</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">$12.847,53</span>
                </div>
                <div className="flex gap-0.5 rounded bg-muted/50 p-0.5">
                  <div className="rounded bg-background px-2 py-0.5 text-[7px] font-medium shadow-sm">Spot</div>
                  <div className="rounded px-2 py-0.5 text-[7px] text-muted-foreground">Futures</div>
                </div>
                {[
                  { asset: "BTC", amount: "0.1523", usd: "$9.142,00", change: "+2.4%" },
                  { asset: "ETH", amount: "2.8400", usd: "$2.841,20", change: "-0.8%" },
                  { asset: "USDT", amount: "864.33", usd: "$864,33", change: "" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-muted/20 px-2 py-1">
                    <div>
                      <span className="text-[9px] font-semibold">{row.asset}</span>
                      <span className="ml-1 text-[7px] text-muted-foreground">{row.amount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-medium">{row.usd}</span>
                      {row.change && (
                        <span className={cn("ml-1 text-[7px] font-medium", row.change.startsWith("+") ? "text-emerald-400" : "text-red-400")}>
                          {row.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">MEXC Portfolio</h3>
                <Badge className="rounded-full bg-amber-500/15 px-2 py-0 text-[10px] font-medium text-amber-400 hover:bg-amber-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Live Spot- & Futures-Kontostände, offene Positionen mit unrealisiertem PnL.
              </p>
            </div>
          </div>

          {/* ── Trading Card 2: PnL Kalender ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold">Juni 2026</span>
                  <span className="text-[8px] font-bold text-emerald-400">+$1.247,80</span>
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
                    <div key={d} className="py-0.5 text-center text-[5px] font-medium text-muted-foreground">{d}</div>
                  ))}
                  {[
                    null, null, null, null, null, null, "+12",
                    "-45", "+89", "+23", "-15", "+67", null, null,
                    "+134", "-28", "+56", "+91", "-33", null, null,
                    "+78", "-12", "+45", "+210", "+56", null, null,
                  ].map((val, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-center rounded py-1 text-[6px] font-medium",
                      !val ? "" :
                      val.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {val ? `${val}$` : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold">PnL Kalender</h3>
                <Badge className="rounded-full bg-emerald-500/15 px-2 py-0 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tägliche Gewinn- & Verlustübersicht – automatisch aus MEXC Futures-Trades berechnet.
              </p>
            </div>
          </div>

          {/* ── Trading Card 3: Trade Logs ── */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="border-b border-border/40 bg-card/60 p-4">
              <div className="rounded-lg border border-border/50 bg-background/90 p-2.5 space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <ScrollText className="h-2.5 w-2.5 text-cyan-400" />
                    <span className="text-[9px] font-semibold">Trade Logs</span>
                  </div>
                  <div className="flex items-center gap-1 text-[7px]">
                    <span className="text-emerald-400">8W</span>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="text-red-400">3L</span>
                    <span className="text-muted-foreground/50">· 73%</span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-[6px] font-medium text-muted-foreground/60 border-b border-border/20 pb-0.5">
                  <span>Symbol</span><span>Seite</span><span>Hebel</span><span className="text-right">PnL</span>
                </div>
                {[
                  { sym: "BTC_USDT", side: "Long", lev: "20x", pnl: "+$245.80", win: true },
                  { sym: "ETH_USDT", side: "Short", lev: "10x", pnl: "-$32.10", win: false },
                  { sym: "SOL_USDT", side: "Long", lev: "15x", pnl: "+$89.40", win: true },
                  { sym: "DOGE_USDT", side: "Long", lev: "5x", pnl: "+$12.20", win: true },
                ].map((t, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 py-0.5 text-[7px]">
                    <span className="font-medium truncate">{t.sym}</span>
                    <span className={cn("rounded px-1 py-px text-[6px] font-semibold", t.side === "Long" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>{t.side}</span>
                    <span className="text-muted-foreground">{t.lev}</span>
                    <span className={cn("text-right font-semibold", t.win ? "text-emerald-400" : "text-red-400")}>{t.pnl}</span>
                  </div>
                ))}
                <div className="border-t border-border/20 pt-1 flex items-center justify-between text-[7px]">
                  <span className="text-muted-foreground">Gesamt</span>
                  <span className="font-bold text-emerald-400">+$315.30</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold">Trade Logs</h3>
                <Badge className="rounded-full bg-cyan-500/15 px-2 py-0 text-[10px] font-medium text-cyan-400 hover:bg-cyan-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Vollständige Handelshistorie mit Winrate, PnL pro Trade und Pagination.
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
                <span className="text-4xl font-bold tracking-tight">0€</span>
                <span className="mb-1 text-sm text-muted-foreground">/ Monat</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Für immer kostenlos. Keine Kreditkarte nötig.
              </p>
            </div>

            <ul className="mb-8 flex flex-col gap-3 text-sm">
              {[
                "Kalender mit Monats-, Wochen- & Timeline-Ansicht",
                "Seiten-Editor mit 17+ Block-Typen",
                "MEXC Portfolio, PnL Kalender & Trade Logs",
                "Checklisten, Habit Tracker & Fortschrittsbalken",
                "Workspace mit unbegrenzten Mitgliedern",
                "Apple Kalender Sync (ICS)",
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
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/8 via-transparent to-transparent" />

            <div className="relative mb-6">
              <span className="inline-block rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                Enterprise
              </span>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">Auf Anfrage</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Für verifizierte Unternehmen. Maßgeschneidert für dein Team.
              </p>
            </div>

            <ul className="relative mb-8 flex flex-col gap-3 text-sm">
              {[
                { text: "Alles aus Free", highlight: false },
                { text: "Unbegrenzte Workspaces", highlight: false },
                { text: "Slack-Integration & Webhooks", highlight: false },
                { text: "Dedizierter Support & SLA", highlight: false },
                { text: "Erweiterte Rollen & Berechtigungen", highlight: false },
                { text: "Unternehmens-Verifizierung erforderlich", highlight: true },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${f.highlight ? "text-purple-400" : "text-green-500"}`} />
                  <span className={f.highlight ? "font-medium text-purple-300" : "text-muted-foreground"}>{f.text}</span>
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
            <a href="https://flux0.dev" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">Flux Network</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
