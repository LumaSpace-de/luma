"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Globe,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  Link2,
  ListChecks,
  Minus,
  NotebookPen,
  Plus,
  Quote,
  Square,
  Table2,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ScrollText,
  ChevronDown,
  Filter,
} from "lucide-react"
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, addMonths, subMonths,
  isSameMonth, isToday,
} from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { PageBlock, BlockType } from "@/lib/blocks-db"
import { PageTaskTable } from "@/components/page-task-table"
import { PageDataTable } from "@/components/page-data-table"

// ── Block menu definition ──────────────────────────────────────────────────

interface BlockTypeItem {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
}

const BLOCK_CATEGORIES: { category: string; items: BlockTypeItem[] }[] = [
  {
    category: "Daten & Tabellen",
    items: [
      {
        type: "task_table",
        label: "Aufgabentabelle",
        description: "Tasks mit Status & Priorität",
        icon: <CheckSquare className="h-4 w-4 text-blue-400" />,
      },
      {
        type: "data_table",
        label: "Datenbank",
        description: "Freie Tabelle mit eigenen Spalten",
        icon: <Table2 className="h-4 w-4 text-teal-400" />,
      },
      {
        type: "checklist",
        label: "Checkliste",
        description: "Einfache Checkbox-Liste",
        icon: <ListChecks className="h-4 w-4 text-sky-400" />,
      },
    ],
  },
  {
    category: "Text & Layout",
    items: [
      {
        type: "heading",
        label: "Überschrift",
        description: "H1, H2 oder H3",
        icon: <Heading1 className="h-4 w-4 text-purple-400" />,
      },
      {
        type: "callout",
        label: "Hinweis",
        description: "Info, Warnung oder Erfolg",
        icon: <AlertCircle className="h-4 w-4 text-yellow-400" />,
      },
      {
        type: "quote",
        label: "Zitat",
        description: "Hervorgehobenes Zitat",
        icon: <Quote className="h-4 w-4 text-green-400" />,
      },
      {
        type: "code",
        label: "Code-Block",
        description: "Formatierter Code",
        icon: <Code2 className="h-4 w-4 text-orange-400" />,
      },
      {
        type: "divider",
        label: "Trennlinie",
        description: "Horizontaler Trenner",
        icon: <Minus className="h-4 w-4 text-muted-foreground" />,
      },
    ],
  },
  {
    category: "Medien & Links",
    items: [
      {
        type: "image",
        label: "Bild",
        description: "Bild per URL einbetten",
        icon: <ImageIcon className="h-4 w-4 text-pink-400" />,
      },
      {
        type: "embed",
        label: "Embed",
        description: "TradingView, YouTube & mehr",
        icon: <Globe className="h-4 w-4 text-indigo-400" />,
      },
      {
        type: "bookmark",
        label: "Bookmark",
        description: "Link mit Titel & Beschreibung",
        icon: <Link2 className="h-4 w-4 text-teal-400" />,
      },
      {
        type: "page_link",
        label: "Seitenvorschau",
        description: "Vorschau einer anderen Seite",
        icon: <ExternalLink className="h-4 w-4 text-cyan-400" />,
      },
    ],
  },
  {
    category: "Trading & Finanzen",
    items: [
      {
        type: "pnl_calendar",
        label: "PnL Kalender",
        description: "Tägliche Gewinn- & Verlustübersicht",
        icon: <CalendarDays className="h-4 w-4 text-emerald-400" />,
      },
      {
        type: "mexc_portfolio",
        label: "MEXC Portfolio",
        description: "Live Kontostände von MEXC",
        icon: <Wallet className="h-4 w-4 text-amber-400" />,
      },
      {
        type: "daily_notes",
        label: "Tagesnotizen",
        description: "Trading-Journal & Notizen",
        icon: <NotebookPen className="h-4 w-4 text-violet-400" />,
      },
      {
        type: "trade_logs",
        label: "Trade Logs",
        description: "Handelshistorie von MEXC",
        icon: <ScrollText className="h-4 w-4 text-cyan-400" />,
      },
    ],
  },
  {
    category: "Tracking",
    items: [
      {
        type: "progress",
        label: "Fortschritt",
        description: "Fortschrittsbalken mit Ziel",
        icon: <Target className="h-4 w-4 text-rose-400" />,
      },
      {
        type: "habit_tracker",
        label: "Habit Tracker",
        description: "Tägliche Gewohnheiten tracken",
        icon: <BarChart3 className="h-4 w-4 text-lime-400" />,
      },
    ],
  },
]

// ── Individual block renderers ─────────────────────────────────────────────

function DividerBlock() {
  return <hr className="border-border/25" />
}

function HeadingBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const level = (data.level as number) ?? 1
  const text  = (data.text as string) ?? ""
  const sizeClass = level === 1 ? "text-2xl font-bold tracking-tight" : level === 2 ? "text-xl font-semibold" : "text-base font-semibold text-muted-foreground"

  return (
    <div className="group/heading flex items-baseline gap-2">
      <input disabled={!canEdit} value={text} onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Überschrift…"
        className={cn("flex-1 bg-transparent outline-none placeholder:text-muted-foreground/25 disabled:cursor-default", sizeClass)} />
      {canEdit && (
        <select value={level} onChange={e => onChange({ ...data, level: Number(e.target.value) })}
          className="shrink-0 rounded border border-border/30 bg-background px-1 py-0.5 text-[10px] text-muted-foreground/50 opacity-0 transition-opacity group-hover/heading:opacity-100">
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      )}
    </div>
  )
}

const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  info:    { border: "border-blue-500/40",   bg: "bg-blue-500/8",   icon: "ℹ️" },
  warning: { border: "border-yellow-500/40", bg: "bg-yellow-500/8", icon: "⚠️" },
  success: { border: "border-green-500/40",  bg: "bg-green-500/8",  icon: "✅" },
  error:   { border: "border-red-500/40",    bg: "bg-red-500/8",    icon: "❌" },
}

function CalloutBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const variant = (data.variant as string) ?? "info"
  const text    = (data.text as string) ?? ""
  const s = CALLOUT_STYLES[variant] ?? CALLOUT_STYLES.info

  return (
    <div className={cn("flex items-start gap-3 rounded-r-lg border-l-[3px] px-4 py-3", s.border, s.bg)}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{s.icon}</span>
      <div className="flex flex-1 flex-col gap-1.5">
        <textarea disabled={!canEdit} value={text} rows={2}
          onChange={e => onChange({ ...data, text: e.target.value })}
          placeholder="Hinweistext…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 disabled:cursor-default" />
        {canEdit && (
          <select value={variant} onChange={e => onChange({ ...data, variant: e.target.value })}
            className="w-fit rounded border border-border/30 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/60">
            <option value="info">Info</option>
            <option value="warning">Warnung</option>
            <option value="success">Erfolg</option>
            <option value="error">Fehler</option>
          </select>
        )}
      </div>
    </div>
  )
}

function QuoteBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const text = (data.text as string) ?? ""
  return (
    <div className="border-l-[3px] border-foreground/25 pl-5 py-1">
      <textarea disabled={!canEdit} value={text} rows={2}
        onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Zitat…"
        className="w-full resize-none bg-transparent text-[1.05rem] italic leading-relaxed text-foreground/60 outline-none placeholder:text-muted-foreground/30 disabled:cursor-default" />
    </div>
  )
}

function CodeBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const lang = (data.lang as string) ?? ""
  const code = (data.code as string) ?? ""
  return (
    <div className="overflow-hidden rounded-xl border border-border/20 bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        {canEdit ? (
          <input value={lang} onChange={e => onChange({ ...data, lang: e.target.value })}
            placeholder="Sprache…"
            className="bg-transparent text-[11px] font-medium text-zinc-400 outline-none placeholder:text-zinc-600" />
        ) : (
          <span className="text-[11px] font-medium text-zinc-400">{lang || "code"}</span>
        )}
      </div>
      <textarea disabled={!canEdit} value={code} rows={5}
        onChange={e => onChange({ ...data, code: e.target.value })}
        placeholder="Code eingeben…"
        className="w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-700 disabled:cursor-default"
        spellCheck={false} />
    </div>
  )
}

// ── PnL Calendar block ────────────────────────────────────────────────────
// ── PnL Calendar block ────────────────────────────────────────────────────

const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

function PnlCalendarBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const [entries, setEntries] = useState<Record<string, number>>(() => {
    try { return (data.entries as Record<string, number>) ?? {} } catch { return {} }
  })
  const [viewDate, setViewDate] = useState(() => new Date())
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [tab, setTab] = useState<"daily" | "monthly">("daily")
  const inputRef = useRef<HTMLInputElement>(null)
  const fetchedMonths = useRef<Set<string>>(new Set())

  // Auto-fetch futures PnL
  useEffect(() => {
    const monthKey = format(viewDate, "yyyy-MM")
    if (fetchedMonths.current.has(monthKey)) return
    fetchedMonths.current.add(monthKey)
    setLoading(true)
    setFetchError("")
    fetch(`/api/mexc/pnl?symbol=BTCUSDT&month=${monthKey}&market=futures`)
      .then(r => {
        if (!r.ok) throw new Error("API error")
        return r.json()
      })
      .then(pnl => {
        if (pnl?.entries && typeof pnl.entries === "object") {
          const pnlEntries = pnl.entries as Record<string, number>
          if (Object.keys(pnlEntries).length > 0) {
            setEntries(prev => {
              const merged = { ...prev, ...pnlEntries }
              // persist to block data (debounced by parent)
              try { onChange({ ...data, entries: merged }) } catch {}
              return merged
            })
          }
        }
      })
      .catch(() => setFetchError("MEXC nicht verbunden"))
      .finally(() => setLoading(false))
  }, [viewDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const monthEntries = Object.entries(entries).filter(([k]) => {
    try { return isSameMonth(new Date(k), viewDate) } catch { return false }
  })
  const monthTotal = monthEntries.reduce((s, [, v]) => s + v, 0)
  const wins = monthEntries.filter(([, v]) => v > 0).length
  const losses = monthEntries.filter(([, v]) => v < 0).length
  const tradeDays = monthEntries.filter(([, v]) => v !== 0).length
  const winRate = tradeDays > 0 ? Math.round((wins / tradeDays) * 100) : 0

  // Recent 7 days
  const now = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    return format(d, "yyyy-MM-dd")
  })
  const recent7Total = last7.reduce((s, k) => s + (entries[k] ?? 0), 0)

  function startEdit(dayKey: string) {
    if (!canEdit) return
    setEditingDay(dayKey)
    setEditValue(entries[dayKey] !== undefined ? String(entries[dayKey]) : "")
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function saveEdit() {
    if (!editingDay) return
    const num = parseFloat(editValue.replace(",", "."))
    const next = { ...entries }
    if (editValue.trim() === "" || isNaN(num)) {
      delete next[editingDay]
    } else {
      next[editingDay] = Math.round(num * 100) / 100
    }
    setEntries(next)
    try { onChange({ ...data, entries: next }) } catch {}
    setEditingDay(null)
  }

  function forceRefresh() {
    const monthKey = format(viewDate, "yyyy-MM")
    fetchedMonths.current.delete(monthKey)
    setViewDate(new Date(viewDate.getTime()))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">Futures PNL Analysis</span>
        </div>
        <button onClick={forceRefresh} disabled={loading}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {/* Tabs: Daily PNL / Monthly PNL */}
      <div className="flex border-b border-border/30">
        <button onClick={() => setTab("daily")}
          className={cn("flex-1 py-2 text-xs font-medium transition-colors",
            tab === "daily" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>Daily PNL</button>
        <button onClick={() => setTab("monthly")}
          className={cn("flex-1 py-2 text-xs font-medium transition-colors",
            tab === "monthly" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>Monthly PNL</button>
      </div>

      {/* 7-day summary */}
      <div className="border-b border-border/30 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">Recent 7-Day PNL: </span>
        <span className={cn("text-xs font-bold", recent7Total >= 0 ? "text-emerald-400" : "text-red-400")}>
          {recent7Total >= 0 ? "+" : ""}{recent7Total.toFixed(2)} USDT
        </span>
      </div>

      {fetchError && !loading && Object.keys(entries).length === 0 && (
        <div className="px-4 py-3 text-center text-xs text-muted-foreground">{fetchError}</div>
      )}

      {tab === "daily" ? (
        <>
          {/* Month navigation */}
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            <button onClick={() => setViewDate(d => subMonths(d, 1))}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[120px] text-center text-sm font-medium">
              {format(viewDate, "MMM yyyy", { locale: de })}
            </span>
            <button onClick={() => setViewDate(d => addMonths(d, 1))}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
            {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>

          {/* Calendar grid */}
          <div className="px-2 pb-3">
            <div className="mb-0.5 grid grid-cols-7">
              {WEEKDAYS_SHORT.map(wd => (
                <div key={wd} className="py-1 text-center text-[10px] font-medium text-muted-foreground/50">
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map(day => {
                const dayKey = format(day, "yyyy-MM-dd")
                const inMonth = isSameMonth(day, viewDate)
                const today = isToday(day)
                const value = entries[dayKey]
                const hasValue = value !== undefined && value !== 0
                const isEditing = editingDay === dayKey

                return (
                  <div
                    key={dayKey}
                    onClick={() => inMonth && startEdit(dayKey)}
                    className={cn(
                      "flex min-h-[48px] flex-col items-center justify-center rounded-md py-1 transition-colors",
                      !inMonth && "opacity-20",
                      inMonth && canEdit && "cursor-pointer hover:bg-accent/30",
                      today && "bg-primary/10",
                      hasValue && value > 0 && "bg-emerald-500/8",
                      hasValue && value < 0 && "bg-red-500/8",
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      today ? "text-primary" : "text-muted-foreground",
                    )}>
                      {format(day, "d")}
                    </span>
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingDay(null) }}
                        className="mt-0.5 w-14 rounded bg-background px-0.5 text-center text-[10px] font-medium outline-none ring-1 ring-primary/50"
                        placeholder="0"
                      />
                    ) : hasValue ? (
                      <span className={cn(
                        "text-[10px] font-bold",
                        value > 0 ? "text-emerald-400" : "text-red-400",
                      )}>
                        {value > 0 ? "+" : ""}{value.toFixed(2)}
                      </span>
                    ) : inMonth ? (
                      <span className="text-[10px] text-muted-foreground/30">--</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        /* Monthly PNL summary */
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Monats-PNL</p>
              <p className={cn("mt-1 text-lg font-bold", monthTotal >= 0 ? "text-emerald-400" : "text-red-400")}>
                {monthTotal >= 0 ? "+" : ""}{monthTotal.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">USDT</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Win Rate</p>
              <p className="mt-1 text-lg font-bold text-foreground">{winRate}%</p>
              <p className="text-[10px] text-muted-foreground">{wins}W / {losses}L</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Handelstage</p>
              <p className="mt-1 text-lg font-bold text-foreground">{tradeDays}</p>
              <p className="text-[10px] text-muted-foreground">Tage mit Trades</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Durchschnitt/Tag</p>
              <p className={cn("mt-1 text-lg font-bold", tradeDays > 0 ? (monthTotal / tradeDays >= 0 ? "text-emerald-400" : "text-red-400") : "text-muted-foreground")}>
                {tradeDays > 0 ? `${(monthTotal / tradeDays) >= 0 ? "+" : ""}${(monthTotal / tradeDays).toFixed(2)}` : "--"}
              </p>
              <p className="text-[10px] text-muted-foreground">USDT</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/30 px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {wins}W
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-400" />
            {losses}L
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">MEXC Futures · Auto-Sync</span>
      </div>
    </div>
  )
}

// ── MEXC Portfolio block ──────────────────────────────────────────────────

interface MexcSpotAsset {
  asset: string
  free: number
  locked: number
  total: number
  usdValue: number
}

interface MexcFuturesBalance {
  currency: string
  available: number
  frozen: number
  equity: number
}

interface MexcFuturesPos {
  symbol: string
  side: string
  size: number
  entryPrice: number
  pnl: number
  unrealisedPnl: number
  leverage: number
  liqPrice: number
}

function MexcPortfolioBlock() {
  const [tab, setTab] = useState<"spot" | "futures">("spot")
  const [spotAssets, setSpotAssets] = useState<MexcSpotAsset[]>([])
  const [spotTotal, setSpotTotal] = useState(0)
  const [futuresBalances, setFuturesBalances] = useState<MexcFuturesBalance[]>([])
  const [futuresTotal, setFuturesTotal] = useState(0)
  const [positions, setPositions] = useState<MexcFuturesPos[]>([])
  const [totalUsd, setTotalUsd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function loadAssets() {
    setLoading(true)
    setError("")
    fetch("/api/mexc/assets")
      .then(r => { if (!r.ok) throw new Error("Fehler"); return r.json() })
      .then(d => {
        setSpotAssets(d.spot?.balances ?? [])
        setSpotTotal(d.spot?.total ?? 0)
        setFuturesBalances(d.futures?.balances ?? [])
        setFuturesTotal(d.futures?.total ?? 0)
        setPositions(d.futures?.positions ?? [])
        setTotalUsd(d.totalUsd ?? 0)
      })
      .catch(() => setError("MEXC nicht verbunden oder API-Fehler"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAssets() }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">MEXC Portfolio</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            ${totalUsd.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button onClick={loadAssets} disabled={loading}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Spot / Futures tabs */}
      <div className="flex border-b border-border/30">
        <button onClick={() => setTab("spot")}
          className={cn("flex-1 py-2 text-xs font-medium transition-colors",
            tab === "spot" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          Spot {!loading && <span className="ml-1 text-muted-foreground">${spotTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>}
        </button>
        <button onClick={() => setTab("futures")}
          className={cn("flex-1 py-2 text-xs font-medium transition-colors",
            tab === "futures" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          Futures {!loading && <span className="ml-1 text-muted-foreground">${futuresTotal.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>}
        </button>
      </div>

      {error ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">{error}</div>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tab === "spot" ? (
        spotAssets.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Keine Spot-Assets</div>
        ) : (
          <div className="divide-y divide-border/20">
            {spotAssets.slice(0, 15).map(a => {
              const pct = spotTotal > 0 ? (a.usdValue / spotTotal) * 100 : 0
              return (
                <div key={a.asset} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                    {a.asset.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{a.asset}</span>
                      <span className="text-sm font-semibold">${a.usdValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{a.total.toLocaleString("de-DE", { maximumFractionDigits: 8 })} {a.asset}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
            {spotAssets.length > 15 && (
              <div className="px-4 py-2 text-center text-xs text-muted-foreground">+{spotAssets.length - 15} weitere</div>
            )}
          </div>
        )
      ) : (
        <div>
          {/* Futures balances */}
          {futuresBalances.length > 0 && (
            <div className="border-b border-border/20 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Kontostand</p>
              <div className="flex flex-wrap gap-4">
                {futuresBalances.map(b => (
                  <div key={b.currency} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{b.currency}</span>
                    <span className="text-sm font-semibold">{b.equity.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-muted-foreground">Verfügbar: {b.available.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open positions */}
          {positions.length > 0 ? (
            <div className="divide-y divide-border/20">
              <div className="flex items-center justify-between px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Offene Positionen</p>
                <p className={cn("text-xs font-bold",
                  positions.reduce((s, p) => s + p.unrealisedPnl, 0) >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  Unrealised: {positions.reduce((s, p) => s + p.unrealisedPnl, 0) >= 0 ? "+" : ""}
                  {positions.reduce((s, p) => s + p.unrealisedPnl, 0).toLocaleString("de-DE", { minimumFractionDigits: 2 })} USDT
                </p>
              </div>
              {positions.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold",
                      p.side === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {p.side}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{p.symbol}</span>
                      <span className="ml-1 text-[10px] text-muted-foreground">{p.leverage}x</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {p.unrealisedPnl >= 0
                        ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                        : <ArrowDownRight className="h-3 w-3 text-red-400" />
                      }
                      <span className={cn("text-sm font-semibold", p.unrealisedPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {p.unrealisedPnl >= 0 ? "+" : ""}{p.unrealisedPnl.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Size: {p.size}</span>
                      <span>Entry: {p.entryPrice.toLocaleString("de-DE")}</span>
                    </div>
                    {p.pnl !== 0 && (
                      <span className="text-[10px] text-muted-foreground/60">
                        Realised: {p.pnl >= 0 ? "+" : ""}{p.pnl.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : futuresBalances.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Keine Futures-Daten</div>
          ) : (
            <div className="px-4 py-4 text-center text-xs text-muted-foreground">Keine offenen Positionen</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Trade Logs block ──────────────────────────────────────────────────────

interface TradeEntry {
  id: string
  symbol: string
  side: string
  size: number
  entryPrice: number
  closePrice: number
  pnl: number
  leverage: number
  time: number
  market: string
}

function TradeLogsBlock() {
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [market, setMarket] = useState<"futures" | "spot">("futures")
  const [page, setPage] = useState(1)

  const fetchTrades = async (m: string, p: number) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/mexc/trades?market=${m}&page=${p}`)
      if (!res.ok) { setError("Fehler beim Laden"); setLoading(false); return }
      const json = await res.json()
      setTrades(json.trades ?? [])
    } catch {
      setError("Netzwerkfehler")
    }
    setLoading(false)
  }

  useEffect(() => { fetchTrades(market, page) }, [market, page])

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) +
      " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const formatNum = (n: number, decimals = 2) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  return (
    <div className="rounded-xl border bg-card/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold">Trade Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <button
              onClick={() => { setMarket("futures"); setPage(1) }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                market === "futures" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Futures
            </button>
            <button
              onClick={() => { setMarket("spot"); setPage(1) }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                market === "spot" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Spot
            </button>
          </div>
          <button onClick={() => fetchTrades(market, page)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="px-4 py-8 text-center text-sm text-red-400">{error}</div>
      ) : loading ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">Lade Trades…</div>
      ) : trades.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">Keine Trades gefunden</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Datum</th>
                  <th className="px-4 py-2.5 text-left font-medium">Symbol</th>
                  <th className="px-4 py-2.5 text-left font-medium">Seite</th>
                  <th className="px-4 py-2.5 text-right font-medium">Größe</th>
                  <th className="px-4 py-2.5 text-right font-medium">Einstieg</th>
                  {market === "futures" && <th className="px-4 py-2.5 text-right font-medium">Schlusskurs</th>}
                  {market === "futures" && <th className="px-4 py-2.5 text-right font-medium">Hebel</th>}
                  <th className="px-4 py-2.5 text-right font-medium">PnL</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id + t.time} className="border-b border-border/20 transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{formatDate(t.time)}</td>
                    <td className="px-4 py-2.5 font-medium">{t.symbol}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        t.side === "Long" || t.side === "Buy"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      )}>
                        {t.side}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatNum(t.size, 4)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatNum(t.entryPrice)}</td>
                    {market === "futures" && <td className="px-4 py-2.5 text-right tabular-nums">{t.closePrice > 0 ? formatNum(t.closePrice) : "—"}</td>}
                    {market === "futures" && <td className="px-4 py-2.5 text-right tabular-nums">{t.leverage}x</td>}
                    <td className={cn(
                      "px-4 py-2.5 text-right font-semibold tabular-nums",
                      t.pnl > 0 ? "text-emerald-400" : t.pnl < 0 ? "text-red-400" : "text-muted-foreground"
                    )}>
                      {t.pnl > 0 ? "+" : ""}{formatNum(t.pnl)} $
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border/30 px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{trades.length} Trades</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs tabular-nums text-muted-foreground">Seite {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={trades.length < 100}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Summary */}
          {trades.length > 0 && (() => {
            const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
            const wins = trades.filter(t => t.pnl > 0).length
            const losses = trades.filter(t => t.pnl < 0).length
            return (
              <div className="flex items-center gap-4 border-t border-border/30 px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Gesamt:</span>
                  <span className={cn("font-semibold tabular-nums", totalPnl > 0 ? "text-emerald-400" : totalPnl < 0 ? "text-red-400" : "text-muted-foreground")}>
                    {totalPnl > 0 ? "+" : ""}{formatNum(totalPnl)} $
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-400 tabular-nums">{wins}W</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-red-400 tabular-nums">{losses}L</span>
                </div>
                {(wins + losses) > 0 && (
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {Math.round((wins / (wins + losses)) * 100)}% Winrate
                  </div>
                )}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}

// ── Daily Notes block ─────────────────────────────────────────────────────

function DailyNotesBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const notes = (data.notes as Record<string, string>) ?? {}
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const currentNote = notes[selectedDay] ?? ""

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function saveNote(text: string) {
    const next = { ...notes }
    if (text.trim() === "") {
      delete next[selectedDay]
    } else {
      next[selectedDay] = text
    }
    onChange({ ...data, notes: next })
  }

  const noteDays = Object.keys(notes).filter(k => notes[k]?.trim())

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold">Tagesnotizen</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(d => subMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => { setViewDate(new Date()); setSelectedDay(format(new Date(), "yyyy-MM-dd")) }}
            className="rounded-md px-2 py-0.5 text-sm font-medium text-foreground hover:bg-accent">
            {format(viewDate, "MMM yyyy", { locale: de })}
          </button>
          <button onClick={() => setViewDate(d => addMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground">{noteDays.length} Einträge</span>
      </div>

      {/* Mini calendar */}
      <div className="border-b border-border/30 px-3 py-2">
        <div className="mb-0.5 grid grid-cols-7">
          {["Mo","Di","Mi","Do","Fr","Sa","So"].map(wd => (
            <div key={wd} className="py-0.5 text-center text-[9px] font-medium text-muted-foreground/40">{wd}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map(day => {
            const dayKey = format(day, "yyyy-MM-dd")
            const inMonth = isSameMonth(day, viewDate)
            const today = isToday(day)
            const selected = dayKey === selectedDay
            const hasNote = !!notes[dayKey]?.trim()

            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={cn(
                  "relative flex h-7 items-center justify-center rounded text-xs transition-colors",
                  !inMonth && "opacity-20",
                  selected && "bg-primary text-primary-foreground",
                  !selected && today && "bg-primary/10 text-primary",
                  !selected && !today && inMonth && "text-muted-foreground hover:bg-accent",
                )}
              >
                {format(day, "d")}
                {hasNote && !selected && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note editor */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {format(new Date(selectedDay + "T00:00:00"), "EEEE, d. MMMM yyyy", { locale: de })}
          </span>
          {isToday(new Date(selectedDay + "T00:00:00")) && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Heute</span>
          )}
        </div>
        <textarea
          disabled={!canEdit}
          value={currentNote}
          onChange={e => saveNote(e.target.value)}
          placeholder={canEdit ? "Was hast du heute gemacht? Trades, Gedanken, Learnings…" : "Keine Notiz"}
          rows={5}
          className="w-full resize-none rounded-lg border border-border/30 bg-background/50 p-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/30 focus:border-primary/40 disabled:cursor-default"
        />
      </div>
    </div>
  )
}


// ── Checklist block ───────────────────────────────────────────────────────

interface CheckItem { id: string; text: string; done: boolean }

function ChecklistBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const items = (data.items as CheckItem[]) ?? []
  const title = (data.title as string) ?? ""

  function update(newItems: CheckItem[]) {
    onChange({ ...data, items: newItems })
  }

  function addItem() {
    update([...items, { id: crypto.randomUUID(), text: "", done: false }])
  }

  function toggleItem(id: string) {
    update(items.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function updateText(id: string, text: string) {
    update(items.map(i => i.id === id ? { ...i, text } : i))
  }

  function removeItem(id: string) {
    update(items.filter(i => i.id !== id))
  }

  const doneCount = items.filter(i => i.done).length

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-sky-400" />
          {canEdit ? (
            <input value={title} onChange={e => onChange({ ...data, title: e.target.value })}
              placeholder="Checkliste" className="bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/40" />
          ) : (
            <span className="text-sm font-semibold">{title || "Checkliste"}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{doneCount}/{items.length}</span>
      </div>

      <div className="divide-y divide-border/20">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 px-4 py-2">
            <button onClick={() => toggleItem(item.id)}
              className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border/60 hover:border-primary/60"
              )}>
              {item.done && <Check className="h-3 w-3" />}
            </button>
            <input
              disabled={!canEdit}
              value={item.text}
              onChange={e => updateText(item.id, e.target.value)}
              placeholder="Neuer Punkt…"
              className={cn("flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/30 disabled:cursor-default",
                item.done && "text-muted-foreground line-through"
              )}
            />
            {canEdit && (
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground/30 hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <button onClick={addItem}
          className="flex w-full items-center gap-2 border-t border-border/30 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Punkt hinzufügen
        </button>
      )}
    </div>
  )
}

// ── Embed block ───────────────────────────────────────────────────────────

function EmbedBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const url = (data.url as string) ?? ""
  const height = (data.height as number) ?? 400

  function getEmbedUrl(rawUrl: string): string {
    try {
      const u = new URL(rawUrl)
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`
      }
      if (u.hostname === "youtu.be") {
        return `https://www.youtube.com/embed${u.pathname}`
      }
    } catch {}
    return rawUrl
  }

  if (!url && canEdit) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
        <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
        <input
          placeholder="URL eingeben (YouTube, TradingView, …)"
          className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
          onKeyDown={e => { if (e.key === "Enter") onChange({ ...data, url: (e.target as HTMLInputElement).value }) }}
          onBlur={e => { if (e.target.value) onChange({ ...data, url: e.target.value }) }}
        />
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" /> Kein Embed konfiguriert
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      {canEdit && (
        <div className="flex items-center gap-2 border-b border-border/30 bg-muted/30 px-3 py-1.5">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <input value={url} onChange={e => onChange({ ...data, url: e.target.value })}
            className="flex-1 bg-transparent text-xs text-muted-foreground outline-none" />
          <input type="number" value={height} onChange={e => onChange({ ...data, height: Number(e.target.value) })}
            className="w-16 rounded border border-border/40 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground outline-none" min={100} max={800} step={50} />
        </div>
      )}
      <iframe src={getEmbedUrl(url)} width="100%" height={height}
        className="border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups" />
    </div>
  )
}

// ── Image block ───────────────────────────────────────────────────────────

function ImageBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const url = (data.url as string) ?? ""
  const caption = (data.caption as string) ?? ""

  if (!url && canEdit) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
        <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
        <input
          placeholder="Bild-URL eingeben…"
          className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
          onKeyDown={e => { if (e.key === "Enter") onChange({ ...data, url: (e.target as HTMLInputElement).value }) }}
          onBlur={e => { if (e.target.value) onChange({ ...data, url: e.target.value }) }}
        />
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <ImageIcon className="h-4 w-4" /> Kein Bild
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <img src={url} alt={caption || "Bild"} className="w-full object-cover" loading="lazy" />
      {(caption || canEdit) && (
        <div className="border-t border-border/30 px-4 py-2">
          {canEdit ? (
            <input value={caption} onChange={e => onChange({ ...data, caption: e.target.value })}
              placeholder="Bildunterschrift…" className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/30" />
          ) : caption ? (
            <p className="text-xs text-muted-foreground">{caption}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── Progress block ────────────────────────────────────────────────────────

function ProgressBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const label = (data.label as string) ?? ""
  const current = (data.current as number) ?? 0
  const goal = (data.goal as number) ?? 100
  const unit = (data.unit as string) ?? ""
  const color = (data.color as string) ?? "primary"
  const pct = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0

  const colorClass: Record<string, string> = {
    primary: "bg-primary",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    sky: "bg-sky-500",
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-rose-400" />
          {canEdit ? (
            <input value={label} onChange={e => onChange({ ...data, label: e.target.value })}
              placeholder="Ziel-Name" className="bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/40" />
          ) : (
            <span className="text-sm font-semibold">{label || "Fortschritt"}</span>
          )}
        </div>
        <span className="text-sm font-bold text-foreground">{pct}%</span>
      </div>

      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", colorClass[color] ?? "bg-primary")}
          style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {canEdit ? (
          <>
            <div className="flex items-center gap-1">
              <input type="number" value={current} onChange={e => onChange({ ...data, current: Number(e.target.value) })}
                className="w-16 rounded border border-border/40 bg-background px-1.5 py-0.5 text-xs outline-none" />
              <span>/</span>
              <input type="number" value={goal} onChange={e => onChange({ ...data, goal: Number(e.target.value) })}
                className="w-16 rounded border border-border/40 bg-background px-1.5 py-0.5 text-xs outline-none" />
              <input value={unit} onChange={e => onChange({ ...data, unit: e.target.value })}
                placeholder="Einheit" className="w-16 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30" />
            </div>
            <select value={color} onChange={e => onChange({ ...data, color: e.target.value })}
              className="rounded border border-border/40 bg-background px-1 py-0.5 text-[10px] text-muted-foreground">
              <option value="primary">Blau</option>
              <option value="emerald">Grün</option>
              <option value="red">Rot</option>
              <option value="amber">Gelb</option>
              <option value="violet">Lila</option>
              <option value="sky">Hellblau</option>
            </select>
          </>
        ) : (
          <span>{current}{unit ? ` ${unit}` : ""} / {goal}{unit ? ` ${unit}` : ""}</span>
        )}
      </div>
    </div>
  )
}

// ── Bookmark block ────────────────────────────────────────────────────────

function BookmarkBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const url = (data.url as string) ?? ""
  const title = (data.title as string) ?? ""
  const description = (data.description as string) ?? ""

  function getDomain(rawUrl: string): string {
    try { return new URL(rawUrl).hostname } catch { return "" }
  }

  if (!url && canEdit) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-4">
        <input placeholder="Link-URL eingeben…"
          className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
          onKeyDown={e => { if (e.key === "Enter") onChange({ ...data, url: (e.target as HTMLInputElement).value }) }}
          onBlur={e => { if (e.target.value) onChange({ ...data, url: e.target.value }) }} />
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <Link2 className="h-4 w-4" /> Kein Bookmark
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card/60 p-4 transition-colors hover:bg-accent/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Link2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        {canEdit ? (
          <>
            <input value={title} onChange={e => { e.preventDefault(); e.stopPropagation(); onChange({ ...data, title: e.target.value }) }}
              onClick={e => e.preventDefault()} placeholder="Titel"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/40" />
            <input value={description} onChange={e => { e.preventDefault(); e.stopPropagation(); onChange({ ...data, description: e.target.value }) }}
              onClick={e => e.preventDefault()} placeholder="Beschreibung"
              className="mt-0.5 w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/30" />
          </>
        ) : (
          <>
            <p className="truncate text-sm font-semibold">{title || url}</p>
            {description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>}
          </>
        )}
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <Globe className="h-3 w-3" /> {getDomain(url)}
          <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100" />
        </p>
      </div>
    </a>
  )
}

// ── Habit Tracker block ───────────────────────────────────────────────────

function HabitTrackerBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const habits = (data.habits as string[]) ?? []
  const checks = (data.checks as Record<string, string[]>) ?? {}
  const [viewDate, setViewDate] = useState(() => new Date())

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  function toggleHabit(dayKey: string, habit: string) {
    const dayChecks = checks[dayKey] ?? []
    const next = dayChecks.includes(habit)
      ? dayChecks.filter(h => h !== habit)
      : [...dayChecks, habit]
    onChange({ ...data, checks: { ...checks, [dayKey]: next } })
  }

  function addHabit() {
    onChange({ ...data, habits: [...habits, ""] })
  }

  function updateHabit(index: number, text: string) {
    const next = [...habits]
    next[index] = text
    onChange({ ...data, habits: next })
  }

  function removeHabit(index: number) {
    onChange({ ...data, habits: habits.filter((_, i) => i !== index) })
  }

  // Streak calculation for a habit
  function getStreak(habit: string): number {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = format(d, "yyyy-MM-dd")
      if ((checks[key] ?? []).includes(habit)) streak++
      else break
    }
    return streak
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-lime-400" />
          <span className="text-sm font-semibold">Habit Tracker</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(d => subMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[100px] text-center text-xs font-medium">
            {format(viewDate, "MMMM yyyy", { locale: de })}
          </span>
          <button onClick={() => setViewDate(d => addMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          {canEdit ? "Füge eine Gewohnheit hinzu" : "Keine Gewohnheiten"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="sticky left-0 z-10 bg-card/90 px-3 py-2 text-left text-[10px] font-medium text-muted-foreground/60">Habit</th>
                {daysInMonth.map(day => (
                  <th key={day.getTime()} className={cn("px-0.5 py-2 text-center text-[9px] font-medium",
                    isToday(day) ? "text-primary" : "text-muted-foreground/40"
                  )}>{format(day, "d")}</th>
                ))}
                <th className="px-3 py-2 text-right text-[10px] font-medium text-muted-foreground/60">Streak</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, hi) => (
                <tr key={hi} className="border-b border-border/10">
                  <td className="sticky left-0 z-10 bg-card/90 px-3 py-1.5">
                    {canEdit ? (
                      <div className="flex items-center gap-1">
                        <input value={habit} onChange={e => updateHabit(hi, e.target.value)}
                          placeholder="Gewohnheit…" className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30" />
                        <button onClick={() => removeHabit(hi)} className="text-muted-foreground/20 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs">{habit}</span>
                    )}
                  </td>
                  {daysInMonth.map(day => {
                    const dayKey = format(day, "yyyy-MM-dd")
                    const checked = (checks[dayKey] ?? []).includes(habit)
                    return (
                      <td key={day.getTime()} className="px-0.5 py-1.5 text-center">
                        <button onClick={() => toggleHabit(dayKey, habit)}
                          className={cn("inline-flex h-4 w-4 items-center justify-center rounded-sm transition-colors",
                            checked ? "bg-lime-500 text-white" : "bg-muted/50 hover:bg-muted"
                          )}>
                          {checked && <Check className="h-2.5 w-2.5" />}
                        </button>
                      </td>
                    )
                  })}
                  <td className="px-3 py-1.5 text-right">
                    <span className="text-xs font-bold text-lime-400">{getStreak(habit)}d</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canEdit && (
        <button onClick={addHabit}
          className="flex w-full items-center gap-2 border-t border-border/30 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Plus className="h-3.5 w-3.5" /> Gewohnheit hinzufügen
        </button>
      )}
    </div>
  )
}


function PageLinkBlock({
  data, canEdit, onChange, workspaceId,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
  workspaceId?: string
}) {
  const linkedPageId = (data.pageId as string) ?? ""
  const [pages, setPages] = useState<{ id: string; title: string; icon: string | null }[]>([])
  const [preview, setPreview] = useState<{
    title: string; icon: string | null; content: string | null
    blocks: { type: string; data: Record<string, unknown> }[]
    taskCount: number
  } | null>(null)
  const [loadingPages, setLoadingPages] = useState(false)

  useEffect(() => {
    if (!linkedPageId) { setPreview(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const [pageRes, blocksRes, tasksRes] = await Promise.all([
          fetch(`/api/pages/${linkedPageId}`),
          fetch(`/api/pages/${linkedPageId}/blocks`),
          fetch(`/api/pages/${linkedPageId}/tasks`),
        ])
        const pageData = pageRes.ok ? await pageRes.json() : null
        const blocks = blocksRes.ok ? await blocksRes.json() : []
        const tasks = tasksRes.ok ? await tasksRes.json() : []
        if (cancelled || !pageData?.title) return
        setPreview({
          title: pageData.title,
          icon: pageData.icon ?? null,
          content: pageData.content ?? null,
          blocks: Array.isArray(blocks) ? blocks.slice(0, 4) : [],
          taskCount: Array.isArray(tasks) ? tasks.length : 0,
        })
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [linkedPageId])

  function loadPages() {
    if (!workspaceId || pages.length > 0) return
    setLoadingPages(true)
    fetch(`/api/pages?workspaceId=${workspaceId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setPages(d) })
      .catch(() => {})
      .finally(() => setLoadingPages(false))
  }

  if (!linkedPageId && canEdit) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Seite auswählen:</p>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value=""
          onFocus={loadPages}
          onChange={e => { if (e.target.value) onChange({ ...data, pageId: e.target.value }) }}
        >
          <option value="">{loadingPages ? "Lädt…" : "— Seite wählen —"}</option>
          {pages.map(p => (
            <option key={p.id} value={p.id}>{p.icon ? `${p.icon} ` : ""}{p.title}</option>
          ))}
        </select>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        {linkedPageId ? "Seite wird geladen…" : "Keine Seite verknüpft"}
      </div>
    )
  }

  const snippet = preview.content ? preview.content.slice(0, 200) + (preview.content.length > 200 ? "…" : "") : ""

  return (
    <Link
      href={`/pages/${linkedPageId}`}
      className="group flex flex-col rounded-xl border bg-card/60 transition-colors hover:bg-accent/40"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
          {preview.icon ?? <FileText className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{preview.title}</p>
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {snippet && <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{snippet}</p>}
        </div>
      </div>

      {/* Block previews */}
      {preview.blocks.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border/30 px-4 py-3">
          {preview.blocks.map((block, i) => {
            if (block.type === "heading") {
              const level = (block.data.level as number) ?? 1
              const text = (block.data.text as string) ?? ""
              if (!text) return null
              return (
                <p key={i} className={cn(
                  "truncate text-muted-foreground",
                  level === 1 ? "text-sm font-bold" : level === 2 ? "text-xs font-semibold" : "text-xs font-medium"
                )}>
                  {text}
                </p>
              )
            }
            if (block.type === "callout") {
              const variant = (block.data.variant as string) ?? "info"
              const text = (block.data.text as string) ?? ""
              if (!text) return null
              const icon = variant === "warning" ? "⚠️" : variant === "success" ? "✅" : variant === "error" ? "❌" : "ℹ️"
              return (
                <p key={i} className="flex items-center gap-1.5 truncate text-xs text-muted-foreground/70">
                  <span className="text-[10px]">{icon}</span>
                  <span className="truncate">{text}</span>
                </p>
              )
            }
            if (block.type === "quote") {
              const text = (block.data.text as string) ?? ""
              if (!text) return null
              return (
                <p key={i} className="truncate border-l-2 border-primary/30 pl-2 text-xs italic text-muted-foreground/60">
                  {text}
                </p>
              )
            }
            if (block.type === "task_table") {
              const name = (block.data.name as string) ?? "Aufgaben"
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <CheckSquare className="h-3 w-3 shrink-0" />
                  <span className="truncate">{name}</span>
                  {preview.taskCount > 0 && (
                    <span className="shrink-0 rounded bg-muted px-1 py-px text-[10px]">{preview.taskCount}</span>
                  )}
                </p>
              )
            }
            if (block.type === "data_table") {
              const name = (block.data.name as string) ?? "Datenbank"
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Table2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{name}</span>
                </p>
              )
            }
            if (block.type === "code") {
              const lang = (block.data.lang as string) ?? ""
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Code2 className="h-3 w-3 shrink-0" />
                  <span>{lang || "Code"}</span>
                </p>
              )
            }
            if (block.type === "pnl_calendar") {
              const entries = (block.data.entries as Record<string, number>) ?? {}
              const total = Object.values(entries).reduce((s, v) => s + v, 0)
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  <span>PnL {total >= 0 ? "+" : ""}{total.toFixed(2)}</span>
                </p>
              )
            }
            if (block.type === "mexc_portfolio") {
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Wallet className="h-3 w-3 shrink-0" />
                  <span>MEXC Portfolio</span>
                </p>
              )
            }
            if (block.type === "daily_notes") {
              const noteCount = Object.values((block.data.notes as Record<string, string>) ?? {}).filter(v => v?.trim()).length
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <NotebookPen className="h-3 w-3 shrink-0" />
                  <span>{noteCount} Notizen</span>
                </p>
              )
            }
            if (block.type === "checklist") {
              const items = (block.data.items as { text: string; done: boolean }[]) ?? []
              const done = items.filter(it => it.done).length
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <ListChecks className="h-3 w-3 shrink-0" />
                  <span>Checkliste {items.length > 0 ? `${done}/${items.length}` : ""}</span>
                </p>
              )
            }
            if (block.type === "embed") {
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span>Embed</span>
                </p>
              )
            }
            if (block.type === "image") {
              const caption = (block.data.caption as string) ?? ""
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <ImageIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{caption || "Bild"}</span>
                </p>
              )
            }
            if (block.type === "progress") {
              const label = (block.data.label as string) ?? "Fortschritt"
              const current = (block.data.current as number) ?? 0
              const goal = (block.data.goal as number) ?? 100
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <BarChart3 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{label} {goal > 0 ? `${Math.round((current / goal) * 100)}%` : ""}</span>
                </p>
              )
            }
            if (block.type === "bookmark") {
              const title = (block.data.title as string) ?? (block.data.url as string) ?? ""
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{title || "Lesezeichen"}</span>
                </p>
              )
            }
            if (block.type === "habit_tracker") {
              const habits = (block.data.habits as string[]) ?? []
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Target className="h-3 w-3 shrink-0" />
                  <span>{habits.length} Gewohnheiten</span>
                </p>
              )
            }
            if (block.type === "trade_logs") {
              return (
                <p key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <ScrollText className="h-3 w-3 shrink-0" />
                  <span>Trade Logs</span>
                </p>
              )
            }
            if (block.type === "divider") return null
            return null
          })}
        </div>
      )}
    </Link>
  )
}

// ── Block wrapper with drag handle + delete ────────────────────────────────

function BlockWrapper({
  block, canEdit, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd, onDelete, children,
}: {
  block: PageBlock
  canEdit: boolean
  isDragOver: boolean
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
  onDelete: () => void
  children: React.ReactNode
}) {
  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn("group relative", isDragOver && "border-t border-primary/50 pt-3")}
    >
      {canEdit && (
        <div className="absolute -left-7 top-1 flex flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="cursor-grab rounded p-0.5 text-muted-foreground/30 hover:bg-accent/60 hover:text-muted-foreground active:cursor-grabbing" title="Verschieben">
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-0.5 text-muted-foreground/30 hover:bg-accent/60 hover:text-destructive" title="Löschen">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
      {children}
    </div>
  )
}

// ── Main PageBlocks component ──────────────────────────────────────────────

interface PageBlocksProps {
  pageId: string
  canEdit: boolean
  workspaceId?: string
}

export function PageBlocks({ pageId, canEdit, workspaceId }: PageBlocksProps) {
  const [blocks, setBlocks]             = useState<PageBlock[]>([])
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dragIndex, setDragIndex]       = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const menuRef  = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/pages/${pageId}/blocks`)
      .then(r => r.ok ? r.json() : [])
      .then(setBlocks)
  }, [pageId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function addBlock(type: BlockType) {
    setMenuOpen(false)
    const position = blocks.length
    const defaultData: Record<string, unknown> =
      type === "heading" ? { level: 2, text: "" }
      : type === "callout" ? { variant: "info", text: "" }
      : type === "code"    ? { lang: "", code: "" }
      : type === "quote"   ? { text: "" }
      : type === "page_link" ? { pageId: "" }
      : type === "pnl_calendar" ? { entries: {}, currency: "€" }
      : type === "mexc_portfolio" ? {}
      : type === "daily_notes" ? { notes: {} }
      : type === "checklist" ? { items: [], title: "" }
      : type === "embed" ? { url: "", height: 400 }
      : type === "image" ? { url: "", caption: "" }
      : type === "progress" ? { label: "", current: 0, goal: 100, unit: "", color: "primary" }
      : type === "bookmark" ? { url: "", title: "", description: "" }
      : type === "habit_tracker" ? { habits: [], checks: {} }
      : type === "trade_logs" ? {}
      : {}

    const optimistic: PageBlock = { id: crypto.randomUUID(), pageId, type, data: defaultData, position }
    setBlocks(prev => [...prev, optimistic])

    const res = await fetch(`/api/pages/${pageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data: defaultData, position }),
    })
    if (res.ok) {
      const created: PageBlock = await res.json()
      setBlocks(prev => prev.map(b => b.id === optimistic.id ? created : b))
    } else {
      setBlocks(prev => prev.filter(b => b.id !== optimistic.id))
    }
  }

  function updateBlockData(id: string, data: Record<string, unknown>) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/pages/${pageId}/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
    }, 600)
  }

  async function removeBlock(id: string) {
    const block = blocks.find(b => b.id === id)
    if (block?.type === "task_table" || block?.type === "data_table") {
      const tasks: { id: string }[] = await fetch(`/api/pages/${pageId}/tasks?blockId=${id}`).then(r => r.ok ? r.json() : [])
      await Promise.all(tasks.map(t => fetch(`/api/pages/${pageId}/tasks/${t.id}`, { method: "DELETE" })))
    }
    setBlocks(prev => prev.filter(b => b.id !== id))
    await fetch(`/api/pages/${pageId}/blocks/${id}`, { method: "DELETE" })
  }

  function handleDragStart(index: number) { setDragIndex(index) }
  function handleDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOverIndex(index) }
  function handleDragEnd() { setDragIndex(null); setDragOverIndex(null) }

  async function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) { handleDragEnd(); return }
    const reordered = [...blocks]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    const withPositions = reordered.map((b, i) => ({ ...b, position: i }))
    setBlocks(withPositions)
    handleDragEnd()
    await Promise.all(
      withPositions.map(b =>
        fetch(`/api/pages/${pageId}/blocks/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: b.position }),
        })
      )
    )
  }

  return (
    <div className="mt-2">
      {blocks.length > 0 && (
        <div className="flex flex-col gap-5 pl-7 mb-6">
          {blocks.map((block, i) => (
            <BlockWrapper
              key={block.id}
              block={block}
              canEdit={canEdit}
              isDragOver={dragOverIndex === i && dragIndex !== i}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              onDelete={() => removeBlock(block.id)}
            >
              {block.type === "task_table" && (
                <PageTaskTable
                  pageId={pageId}
                  blockId={block.id}
                  canEdit={canEdit}
                  blockData={block.data}
                  onBlockDataChange={d => updateBlockData(block.id, d)}
                  onRemoveTable={() => removeBlock(block.id)}
                />
              )}
              {block.type === "data_table" && (
                <PageDataTable
                  pageId={pageId}
                  blockId={block.id}
                  canEdit={canEdit}
                  blockData={block.data}
                  onBlockDataChange={d => updateBlockData(block.id, d)}
                  onRemoveTable={() => removeBlock(block.id)}
                />
              )}
              {block.type === "divider" && <DividerBlock />}
              {block.type === "heading" && (
                <HeadingBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "callout" && (
                <CalloutBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "quote" && (
                <QuoteBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "code" && (
                <CodeBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "page_link" && (
                <PageLinkBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} workspaceId={workspaceId} />
              )}
              {block.type === "pnl_calendar" && (
                <PnlCalendarBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "mexc_portfolio" && (
                <MexcPortfolioBlock />
              )}
              {block.type === "daily_notes" && (
                <DailyNotesBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "checklist" && (
                <ChecklistBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "embed" && (
                <EmbedBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "image" && (
                <ImageBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "progress" && (
                <ProgressBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "bookmark" && (
                <BookmarkBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "habit_tracker" && (
                <HabitTrackerBlock data={block.data} canEdit={canEdit} onChange={d => updateBlockData(block.id, d)} />
              )}
              {block.type === "trade_logs" && (
                <TradeLogsBlock />
              )}
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Add block button */}
      {canEdit && (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="group/add flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/30 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-muted-foreground/20 transition-colors group-hover/add:border-muted-foreground/40">
              <Plus className="h-3 w-3" />
            </span>
            Block hinzufügen
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 z-50 mt-1.5 w-[340px] overflow-hidden rounded-xl border bg-popover shadow-xl sm:w-[420px]">
              <div className="border-b border-border/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Block einfügen
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {BLOCK_CATEGORIES.map(cat => (
                  <div key={cat.category}>
                    <div className="sticky top-0 z-10 bg-popover/95 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {cat.category}
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                      {cat.items.map(bt => (
                        <button key={bt.type} onClick={() => addBlock(bt.type)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted">
                            {bt.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium leading-tight">{bt.label}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{bt.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
