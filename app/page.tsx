import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  Clock,
  FileText,
  GitBranch,
  LayoutGrid,
  Mail,
  MapPin,
  Plus,
  Repeat,
  ScrollText,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FaqSection } from "@/components/faq-section"
import { cn } from "@/lib/utils"

export default function IndexPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#080808]">

      {/* ── Background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-10%] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[140px]" />
        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[120px]" />
        <div className="absolute left-[-5%] top-[60%] h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.05] bg-[#080808]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <Image src="/logo_icon.png" alt="LumaSpace" width={32} height={32} className="rounded-lg" />
          <span className="text-base font-bold tracking-tight text-white">LumaSpace</span>
        </div>
        <div className="hidden items-center gap-6 text-sm text-white/50 sm:flex">
          <a href="#features" className="transition-colors hover:text-white/80">Features</a>
          <a href="#trading" className="transition-colors hover:text-white/80">Trading</a>
          <a href="#pricing" className="transition-colors hover:text-white/80">Preise</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
              Anmelden
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-white text-black hover:bg-white/90">
              Kostenlos starten
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-20 pt-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5">
          <Sparkles className="h-3 w-3 text-blue-400" />
          <span className="text-xs text-white/60">KI-gestützter Arbeitsbereich</span>
        </div>

        <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Dein kompletter
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            digitaler Workspace.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-white/40 sm:text-lg">
          Kalender, Seiten-Editor, Trading-Dashboard und GitHub – alles in einer App. Kostenlos.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2 bg-white px-8 text-black hover:bg-white/90">
              Jetzt starten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost" className="px-8 text-white/60 hover:bg-white/[0.05] hover:text-white">
              Ich habe ein Konto
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {[
            { value: "17+", label: "Block-Typen" },
            { value: "3", label: "Kalender-Ansichten" },
            { value: "0€", label: "Für immer kostenlos" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">{value}</span>
              <span className="text-xs text-white/30">{label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ── Hero App Mockup ── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-2xl shadow-black/60">
          {/* Mockup top bar */}
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1">
              <span className="text-[10px] text-white/30">lumaspace.de/calendar</span>
            </div>
          </div>
          {/* Calendar */}
          <div className="p-4 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-white sm:text-lg">Oktober 2026</h3>
                <div className="flex items-center gap-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.05] text-white/40 hover:bg-white/[0.08]">
                    <span className="text-xs">‹</span>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.05] text-white/40">
                    <span className="text-xs">›</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/60">Monat</div>
                <div className="rounded-md border border-white/[0.04] px-2.5 py-1 text-[11px] text-white/25">Woche</div>
                <div className="ml-2 flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">
                  <Plus className="h-3 w-3" /> Neu
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px text-center">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(d => (
                <div key={d} className="py-2 text-[11px] font-medium text-white/25">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[
                { day: 28, prev: true }, { day: 29, prev: true }, { day: 30, prev: true },
                { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
                { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
                { day: 12 }, { day: 13 }, { day: 14 }, { day: 15, today: true }, { day: 16 }, { day: 17 }, { day: 18 },
                { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 },
                { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1, next: true },
              ].map(({ day, prev, next, today }, i) => (
                <div
                  key={i}
                  className={cn(
                    "min-h-[52px] rounded-xl p-1.5 sm:min-h-[64px]",
                    today ? "bg-blue-500/10 ring-1 ring-blue-500/40" : "hover:bg-white/[0.03]",
                    (prev || next) && "opacity-25"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                    today ? "bg-blue-500 font-bold text-white" : "text-white/40"
                  )}>
                    {day}
                  </span>
                  {day === 1 && !prev && <div className="mt-1 truncate rounded bg-purple-500/20 px-1 py-0.5 text-[9px] text-purple-300">Sprint Start</div>}
                  {day === 8 && <div className="mt-1 truncate rounded bg-blue-500/20 px-1 py-0.5 text-[9px] text-blue-300">Meeting</div>}
                  {day === 15 && today && <div className="mt-1 truncate rounded bg-blue-500/20 px-1 py-0.5 text-[9px] text-blue-300">Heute</div>}
                  {day === 22 && <div className="mt-1 truncate rounded bg-green-500/20 px-1 py-0.5 text-[9px] text-green-300">Release</div>}
                  {day === 28 && !prev && <div className="mt-1 truncate rounded bg-amber-500/20 px-1 py-0.5 text-[9px] text-amber-300">Review</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Integration strip ── */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-white/20">
          Verbinde deine Tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            {
              name: "GitHub",
              icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white/60">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              ),
            },
            {
              name: "Discord",
              icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#5865F2]">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              ),
            },
            {
              name: "MEXC",
              icon: <span className="text-lg font-bold text-blue-400">M</span>,
            },
            {
              name: "Apple Kalender",
              icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <rect x="3" y="6" width="18" height="15" rx="3" stroke="#FF3B30" strokeWidth="1.5" />
                  <line x1="3" y1="11" x2="21" y2="11" stroke="#FF3B30" strokeWidth="1.5" />
                  <line x1="8" y1="6" x2="8" y2="3" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="6" x2="16" y2="3" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              name: "Google Kalender",
              icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <rect x="3" y="6" width="18" height="15" rx="3" stroke="#4285F4" strokeWidth="1.5" />
                  <line x1="3" y1="11" x2="21" y2="11" stroke="#4285F4" strokeWidth="1.5" />
                  <line x1="8" y1="6" x2="8" y2="3" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="6" x2="16" y2="3" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M9 16l2 2 4-4" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
          ].map(({ name, icon }) => (
            <div key={name} className="group flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all group-hover:border-white/[0.12] group-hover:bg-white/[0.06]">
                {icon}
              </div>
              <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Bento ── */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Alles was du brauchst
          </h2>
          <p className="mt-3 text-white/40">
            Kalender, Editor und smarte Blöcke – in einer App.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Large: Calendar views */}
          <div className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:col-span-2">
            <div className="border-b border-white/[0.05] p-5">
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d0d]">
                <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
                  <span className="text-[10px] font-semibold text-white/50">Kalender</span>
                  <div className="flex items-center gap-0.5 rounded bg-white/[0.04] p-0.5">
                    {["▦ Monat", "⏱ Woche", "⊟ Timeline"].map((v, i) => (
                      <div key={v} className={cn("rounded px-2 py-0.5 text-[8px]", i === 0 ? "bg-blue-500 text-white" : "text-white/30")}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px p-2">
                  {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
                    <div key={d} className="py-1 text-center text-[7px] text-white/20">{d}</div>
                  ))}
                  {Array.from({ length: 21 }, (_, i) => i + 1).map(day => (
                    <div key={day} className={cn(
                      "min-h-[28px] rounded-md p-1",
                      day === 15 && "ring-1 ring-blue-500/40 bg-blue-500/5"
                    )}>
                      <span className={cn("text-[8px]", day === 15 ? "font-bold text-blue-400" : "text-white/25")}>{day}</span>
                      {day === 3 && <div className="mt-0.5 truncate rounded bg-purple-500/25 px-0.5 text-[6px] text-purple-300">Sprint</div>}
                      {day === 8 && <div className="mt-0.5 truncate rounded bg-blue-500/25 px-0.5 text-[6px] text-blue-300">Meeting</div>}
                      {day === 15 && <div className="mt-0.5 truncate rounded bg-blue-500/25 px-0.5 text-[6px] text-blue-300">Heute</div>}
                      {day === 18 && <div className="mt-0.5 truncate rounded bg-green-500/25 px-0.5 text-[6px] text-green-300">Release</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold text-white">3 Kalender-Ansichten</h3>
              </div>
              <p className="text-sm text-white/40">
                Monatsgitter, Wochenansicht und Timeline mit Live-Zeitindikator — wechsle mit einem Klick.
              </p>
            </div>
          </div>

          {/* Small: Blocks */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <span className="text-[9px] font-semibold text-white/40">Block einfügen</span>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { icon: "✓", label: "Checkliste", color: "text-sky-400" },
                    { icon: "◎", label: "Fortschritt", color: "text-rose-400" },
                    { icon: "⊞", label: "Embed", color: "text-indigo-400" },
                    { icon: "↗", label: "Habit Tracker", color: "text-lime-400" },
                    { icon: "H", label: "Überschrift", color: "text-purple-400" },
                    { icon: "◈", label: "Portfolio", color: "text-amber-400" },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1.5">
                      <span className={cn("text-[10px] font-bold", b.color)}>{b.icon}</span>
                      <span className="text-[8px] text-white/50">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-purple-400" />
                <h3 className="font-semibold text-white">17+ Block-Typen</h3>
                <Badge className="rounded-full bg-purple-500/15 px-2 py-0 text-[10px] text-purple-400 hover:bg-purple-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-white/40">
                Drag & Drop, verschachtelt, automatisch gespeichert.
              </p>
            </div>
          </div>

          {/* Small: Events */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <span className="text-[9px] font-semibold text-white/40">Neues Event</span>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-2 py-1.5 ring-1 ring-blue-500/20">
                  <span className="text-[9px] text-white/70">Team-Meeting</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1">
                    <p className="text-[6px] text-white/25">Von</p>
                    <p className="text-[9px] font-medium text-white/60">09:00</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1">
                    <p className="text-[6px] text-white/25">Bis</p>
                    <p className="text-[9px] font-medium text-white/60">10:30</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1">
                  <MapPin className="h-2 w-2 text-white/20" />
                  <span className="text-[8px] text-white/40">Berlin, Deutschland</span>
                </div>
                <div className="flex gap-1.5">
                  {["bg-blue-500", "bg-green-600", "bg-red-500", "bg-purple-500"].map((c, i) => (
                    <div key={i} className={cn("h-3 w-3 rounded-full", c, i === 0 && "ring-2 ring-white/30 ring-offset-1 ring-offset-[#0d0d0d]")} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold text-white">Events mit Details</h3>
              </div>
              <p className="text-sm text-white/40">
                Zeit, Standort, Farbe und Erinnerungen — alles in einem Dialog.
              </p>
            </div>
          </div>

          {/* Small: Workspaces */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                {["FLUX0", "Stark Industries", "Wayne Enterprises"].map((name, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2.5 py-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/20 text-[8px] font-bold text-blue-400">
                      {name[0]}
                    </div>
                    <span className="flex-1 truncate text-[9px] font-medium text-white/60">{name}</span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[6px] font-medium", i === 2 ? "bg-purple-500/20 text-purple-400" : "bg-white/[0.05] text-white/25")}>
                      {i === 2 ? "Enterprise" : "Free"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <h3 className="font-semibold text-white">Workspaces</h3>
              </div>
              <p className="text-sm text-white/40">
                Mehrere Workspaces für Teams, Projekte oder Unternehmen.
              </p>
            </div>
          </div>

          {/* Large: Pages editor */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:col-span-2">
            <div className="border-b border-white/[0.05] p-5">
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d0d]">
                <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-2">
                  <FileText className="h-2.5 w-2.5 text-white/20" />
                  <span className="text-[8px] text-white/30">Sprint Planning Q3</span>
                  <span className="ml-auto text-[7px] text-white/15">Gespeichert ✓</span>
                </div>
                <div className="px-4 py-3">
                  <p className="mb-2 text-sm font-bold text-white/80">Sprint Planning Q3</p>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-sm bg-white/[0.06]" />
                    <div className="h-1.5 w-4/5 rounded-sm bg-white/[0.06]" />
                    <div className="h-1.5 w-full rounded-sm bg-white/[0.06]" />
                    <div className="h-1.5 w-3/5 rounded-sm bg-white/[0.04]" />
                  </div>
                  <div className="mt-3 space-y-0.5 border-t border-white/[0.05] pt-2.5">
                    {["Meeting Notes", "↳ Sprint Planning", "↳ Retrospektive", "Roadmap Q3"].map((t, i) => (
                      <div key={i} className={`text-[8px] ${i === 1 ? "font-medium text-blue-400" : "text-white/20"}`}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold text-white">Seiten-Editor</h3>
              </div>
              <p className="text-sm text-white/40">
                Verschachtelte Seiten mit vollständigem Block-Editor, Favoriten und automatischem Speichern.
              </p>
            </div>
          </div>

          {/* Small: Repeat & Reminder */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <div className="flex items-center gap-1.5">
                  <Repeat className="h-2.5 w-2.5 text-green-400/60" />
                  <span className="text-[9px] font-semibold text-white/40">Wiederholung</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1">
                    <p className="text-[6px] text-white/20">Wiederholt sich</p>
                    <p className="text-[9px] text-white/50">Wöchentlich ▾</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1">
                    <p className="text-[6px] text-white/20">Erinnerung</p>
                    <p className="text-[9px] text-white/50">30 Min. ▾</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1.5">
                  <Bell className="h-2.5 w-2.5 text-white/20" />
                  <span className="text-[8px] text-white/40">Browser-Benachrichtigung aktiv</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold text-white">Wiederkehrende Events</h3>
              </div>
              <p className="text-sm text-white/40">
                Täglich, wöchentlich, monatlich — mit Browser-Push.
              </p>
            </div>
          </div>

          {/* Small: Search */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1.5">
                  <Search className="h-2.5 w-2.5 text-white/20" />
                  <span className="text-[8px] text-white/20">Events durchsuchen…</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { l: "Arbeit", c: "bg-blue-500", active: true },
                    { l: "Privat", c: "bg-green-500", active: false },
                    { l: "Sport", c: "bg-purple-500", active: false },
                  ].map(({ l, c, active }) => (
                    <div key={l} className={cn(
                      "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px]",
                      active ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-white/[0.05] text-white/20"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", c)} />
                      {l}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] px-2 py-1.5 text-[8px] text-white/25">
                  Team-Meeting → Mi 22. Oktober
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Search className="h-4 w-4 text-violet-400" />
                <h3 className="font-semibold text-white">Suche & Labels</h3>
              </div>
              <p className="text-sm text-white/40">
                Events filtern, Labels verwalten und per Drag & Drop verschieben.
              </p>
            </div>
          </div>

          {/* Small: GitHub */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white/40"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                  <span className="text-[9px] font-semibold text-white/40">GitHub Integration</span>
                </div>
                {["prodbybezo/luma", "prodbybezo/flux-api"].map((repo, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-2 py-1.5">
                    <GitBranch className="h-2.5 w-2.5 text-white/20" />
                    <span className="flex-1 truncate text-[8px] text-white/40">{repo}</span>
                    <span className="text-[7px] text-white/15">main</span>
                  </div>
                ))}
                <div className="flex gap-2 text-[7px] text-white/20">
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />2 open PRs</span>
                  <span>·</span>
                  <span>5 issues</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-orange-400" />
                <h3 className="font-semibold text-white">GitHub Dashboard</h3>
              </div>
              <p className="text-sm text-white/40">
                Repos, PRs und Issues direkt in deinem Workspace.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trading ── */}
      <section id="trading" className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        </div>

        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">Trading-Integration</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Dein Trading-Dashboard
          </h2>
          <p className="mt-3 text-white/40">
            MEXC Exchange direkt in deinem Workspace — Portfolio, PnL und Trade Logs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* MEXC Portfolio */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-2.5 w-2.5 text-amber-400/60" />
                    <span className="text-[9px] font-semibold text-white/40">MEXC Portfolio</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">$12.847</span>
                </div>
                {[
                  { asset: "BTC", usd: "$9.142", change: "+2.4%", win: true },
                  { asset: "ETH", usd: "$2.841", change: "-0.8%", win: false },
                  { asset: "USDT", usd: "$864", change: "", win: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2 py-1.5">
                    <span className="text-[9px] font-semibold text-white/60">{row.asset}</span>
                    <div className="text-right">
                      <span className="text-[8px] text-white/40">{row.usd}</span>
                      {row.change && (
                        <span className={cn("ml-1.5 text-[7px] font-semibold", row.win ? "text-emerald-400" : "text-red-400")}>
                          {row.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-white">MEXC Portfolio</h3>
                <Badge className="rounded-full bg-amber-500/15 px-2 py-0 text-[10px] text-amber-400 hover:bg-amber-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-white/40">
                Live Spot- & Futures-Kontostände mit unrealisiertem PnL.
              </p>
            </div>
          </div>

          {/* PnL Calendar */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-white/40">Oktober 2026</span>
                  <span className="text-[9px] font-bold text-emerald-400">+$1.247</span>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
                    <div key={d} className="text-center text-[5px] text-white/15 py-0.5">{d}</div>
                  ))}
                  {[null,null,null,null,null,null,"+12","-45","+89","+23","-15","+67",null,null,"+134","-28","+56","+91","-33",null,null,"+78","-12","+45","+210","+56",null,null].map((val, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-center rounded py-1 text-[5px] font-semibold",
                      val?.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" :
                      val?.startsWith("-") ? "bg-red-500/10 text-red-400" : ""
                    )}>
                      {val || ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-white">PnL Kalender</h3>
                <Badge className="rounded-full bg-emerald-500/15 px-2 py-0 text-[10px] text-emerald-400 hover:bg-emerald-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-white/40">
                Tägliche Gewinn- & Verlustübersicht aus MEXC Futures-Trades.
              </p>
            </div>
          </div>

          {/* Trade Logs */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.05] p-5">
              <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <ScrollText className="h-2.5 w-2.5 text-cyan-400/60" />
                    <span className="text-[9px] font-semibold text-white/40">Trade Logs</span>
                  </div>
                  <span className="text-[7px] text-white/25">73% Winrate</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-b border-white/[0.05] pb-1 text-[6px] font-medium text-white/15">
                  <span>Symbol</span><span>Seite</span><span>PnL</span>
                </div>
                {[
                  { sym: "BTC_USDT", side: "Long", pnl: "+$245", win: true },
                  { sym: "ETH_USDT", side: "Short", pnl: "-$32", win: false },
                  { sym: "SOL_USDT", side: "Long", pnl: "+$89", win: true },
                ].map((t, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 text-[7px]">
                    <span className="truncate font-medium text-white/50">{t.sym}</span>
                    <span className={cn("rounded px-1 py-px text-[6px] font-semibold", t.side === "Long" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>{t.side}</span>
                    <span className={cn("font-semibold", t.win ? "text-emerald-400" : "text-red-400")}>{t.pnl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold text-white">Trade Logs</h3>
                <Badge className="rounded-full bg-cyan-500/15 px-2 py-0 text-[10px] text-cyan-400 hover:bg-cyan-500/15">Neu</Badge>
              </div>
              <p className="text-sm text-white/40">
                Vollständige Handelshistorie mit Winrate und PnL pro Trade.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-24">
        <div className="mb-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">Einfache Preise</h2>
          <p className="mt-3 text-white/40">
            Kostenlos für jeden — oder maßgeschneidert für dein Unternehmen.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <span className="inline-block w-fit rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/50">
              Free
            </span>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-4xl font-bold text-white">0€</span>
              <span className="mb-1 text-sm text-white/30">/ Monat</span>
            </div>
            <p className="mt-2 text-sm text-white/30">Für immer kostenlos. Keine Kreditkarte nötig.</p>

            <ul className="my-8 flex flex-col gap-3 text-sm">
              {[
                "Kalender mit 3 Ansichten",
                "Seiten-Editor mit 17+ Block-Typen",
                "MEXC Portfolio, PnL & Trade Logs",
                "Workspaces mit unbegrenzten Mitgliedern",
                "Apple & Google Kalender Sync (ICS)",
                "GitHub Dashboard",
                "Profil mit Avatar & Benutzername",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-white/40">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Link href="/signup">
                <button className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white">
                  Kostenlos starten
                </button>
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-white/[0.02] p-8">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/[0.06] via-transparent to-transparent" />

            <span className="relative inline-block w-fit rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
              Enterprise
            </span>
            <div className="relative mt-5">
              <span className="text-4xl font-bold text-white">Auf Anfrage</span>
            </div>
            <p className="relative mt-2 text-sm text-white/30">Für verifizierte Unternehmen. Maßgeschneidert.</p>

            <ul className="relative my-8 flex flex-col gap-3 text-sm">
              {[
                { text: "Alles aus Free", hl: false },
                { text: "Unbegrenzte Workspaces", hl: false },
                { text: "Slack-Integration & Webhooks", hl: false },
                { text: "Dedizierter Support & SLA", hl: false },
                { text: "Erweiterte Rollen & Berechtigungen", hl: false },
                { text: "Unternehmens-Verifizierung erforderlich", hl: true },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className={cn("mt-0.5 h-4 w-4 shrink-0", f.hl ? "text-purple-400" : "text-emerald-500")} />
                  <span className={f.hl ? "font-medium text-purple-300/80" : "text-white/40"}>{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="relative mt-auto">
              <a href="mailto:support@lumaspace.de?subject=Enterprise-Anfrage">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500">
                  <Mail className="h-4 w-4" />
                  Anfrage stellen
                </button>
              </a>
              <p className="mt-3 text-center text-xs text-white/20">
                support@lumaspace.de · Antwort innerhalb 24h
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/[0.06] via-transparent to-violet-600/[0.06]" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-white/50">Kostenlos · Kein Abo · Sofort loslegen</span>
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-4xl">
              Bereit loszulegen?
            </h2>
            <p className="mt-4 text-white/40">
              Erstelle deinen Account in 30 Sekunden. Keine Kreditkarte nötig.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 bg-white px-10 text-black hover:bg-white/90">
                  Jetzt starten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo_icon.png" alt="LumaSpace" width={24} height={24} className="rounded-md opacity-60" />
            <span className="text-sm font-medium text-white/25">LumaSpace</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/20">
            <Link href="/impressum" className="transition-colors hover:text-white/40">Impressum</Link>
            <Link href="/datenschutz" className="transition-colors hover:text-white/40">Datenschutz</Link>
            <Link href="/agb" className="transition-colors hover:text-white/40">AGB</Link>
            <span className="text-white/10">·</span>
            <span>
              Powered by{" "}
              <a href="https://flux0.dev" className="text-white/30 transition-colors hover:text-white/50">Flux Network</a>
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}
