"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  GripVertical,
  Heading1,
  Minus,
  Plus,
  Quote,
  Table2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
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

const BLOCK_TYPES: {
  type: BlockType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
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
    type: "page_link",
    label: "Seitenvorschau",
    description: "Vorschau einer anderen Seite",
    icon: <ExternalLink className="h-4 w-4 text-cyan-400" />,
  },
  {
    type: "pnl_calendar",
    label: "PnL Kalender",
    description: "Tägliche Gewinn- & Verlustübersicht",
    icon: <CalendarDays className="h-4 w-4 text-emerald-400" />,
  },
  {
    type: "mexc_portfolio",
    label: "MEXC Portfolio",
    description: "Live Kontostände von MEXC Exchange",
    icon: <Wallet className="h-4 w-4 text-amber-400" />,
  },
  {
    type: "divider",
    label: "Trennlinie",
    description: "Horizontaler Trenner",
    icon: <Minus className="h-4 w-4 text-muted-foreground" />,
  },
]

// ── Individual block renderers ─────────────────────────────────────────────

function DividerBlock() {
  return <hr className="border-border/50" />
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
  const sizeClass = level === 1 ? "text-2xl font-bold" : level === 2 ? "text-xl font-semibold" : "text-lg font-medium"

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <select value={level} onChange={e => onChange({ ...data, level: Number(e.target.value) })}
          className="shrink-0 rounded border border-border/40 bg-background px-1 py-0.5 text-xs text-muted-foreground">
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      )}
      <input disabled={!canEdit} value={text} onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Überschrift…"
        className={cn("flex-1 bg-transparent outline-none placeholder:text-muted-foreground/30 disabled:cursor-default", sizeClass)} />
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
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", s.border, s.bg)}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{s.icon}</span>
      <div className="flex flex-1 flex-col gap-2">
        {canEdit && (
          <select value={variant} onChange={e => onChange({ ...data, variant: e.target.value })}
            className="w-fit rounded border border-border/40 bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
            <option value="info">Info</option>
            <option value="warning">Warnung</option>
            <option value="success">Erfolg</option>
            <option value="error">Fehler</option>
          </select>
        )}
        <textarea disabled={!canEdit} value={text} rows={2}
          onChange={e => onChange({ ...data, text: e.target.value })}
          placeholder="Hinweistext…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 disabled:cursor-default" />
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
    <div className="border-l-4 border-primary/40 pl-4">
      <textarea disabled={!canEdit} value={text} rows={2}
        onChange={e => onChange({ ...data, text: e.target.value })}
        placeholder="Zitat…"
        className="w-full resize-none bg-transparent text-base italic leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/40 disabled:cursor-default" />
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
    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/40">
      {canEdit && (
        <div className="flex items-center border-b border-border/30 bg-muted/60 px-3 py-1.5">
          <input value={lang} onChange={e => onChange({ ...data, lang: e.target.value })}
            placeholder="Sprache (z.B. typescript)"
            className="bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40" />
        </div>
      )}
      {!canEdit && lang && (
        <div className="border-b border-border/30 bg-muted/60 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">{lang}</span>
        </div>
      )}
      <textarea disabled={!canEdit} value={code} rows={5}
        onChange={e => onChange({ ...data, code: e.target.value })}
        placeholder="Code eingeben…"
        className="w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 disabled:cursor-default"
        spellCheck={false} />
    </div>
  )
}

// ── PnL Calendar block ────────────────────────────────────────────────────

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

function PnlCalendarBlock({
  data, canEdit, onChange,
}: {
  data: Record<string, unknown>
  canEdit: boolean
  onChange: (d: Record<string, unknown>) => void
}) {
  const [entries, setEntries] = useState<Record<string, number>>((data.entries as Record<string, number>) ?? {})
  const currency = "$"
  const [viewDate, setViewDate] = useState(() => new Date())
  const [loading, setLoading] = useState(false)
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const lastFetchRef = useRef("")

  useEffect(() => {
    const monthKey = format(viewDate, "yyyy-MM")
    if (lastFetchRef.current === monthKey) return
    lastFetchRef.current = monthKey
    setLoading(true)
    fetch(`/api/mexc/pnl?symbol=BTCUSDT&month=${monthKey}&market=futures`)
      .then(r => r.ok ? r.json() : null)
      .then(pnl => {
        if (pnl?.entries && Object.keys(pnl.entries).length > 0) {
          setEntries(prev => {
            const merged = { ...prev, ...pnl.entries }
            onChange({ ...data, entries: merged })
            return merged
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [viewDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const monthEntries = Object.entries(entries).filter(([k]) => isSameMonth(new Date(k), viewDate))
  const monthTotal = monthEntries.reduce((s, [, v]) => s + v, 0)
  const wins = monthEntries.filter(([, v]) => v > 0).length
  const losses = monthEntries.filter(([, v]) => v < 0).length
  const tradeDays = monthEntries.filter(([, v]) => v !== 0).length
  const winRate = tradeDays > 0 ? Math.round((wins / tradeDays) * 100) : 0
  const bestDay = monthEntries.length > 0 ? Math.max(...monthEntries.map(([, v]) => v)) : 0
  const worstDay = monthEntries.length > 0 ? Math.min(...monthEntries.map(([, v]) => v)) : 0

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
    onChange({ ...data, entries: next })
    setEditingDay(null)
  }

  function fmtPnl(v: number): string {
    const s = Math.abs(v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return (v >= 0 ? "+" : "−") + s + currency
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">Futures PnL</span>
          {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(d => subMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setViewDate(new Date())}
            className="rounded-md px-2 py-0.5 text-sm font-medium text-foreground hover:bg-accent">
            {format(viewDate, "MMMM yyyy", { locale: de })}
          </button>
          <button onClick={() => setViewDate(d => addMonths(d, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button onClick={() => { lastFetchRef.current = ""; setViewDate(new Date(viewDate)) }}
          disabled={loading}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-px border-b border-border/30 bg-border/20">
        <div className="flex flex-col items-center bg-card/60 px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Gesamt</span>
          <span className={cn("text-sm font-bold", monthTotal > 0 ? "text-emerald-400" : monthTotal < 0 ? "text-red-400" : "text-muted-foreground")}>
            {fmtPnl(monthTotal)}
          </span>
        </div>
        <div className="flex flex-col items-center bg-card/60 px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Win Rate</span>
          <span className="text-sm font-bold text-foreground">{winRate}%</span>
        </div>
        <div className="flex flex-col items-center bg-card/60 px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Bester Tag</span>
          <span className="text-sm font-bold text-emerald-400">{bestDay > 0 ? fmtPnl(bestDay) : "—"}</span>
        </div>
        <div className="flex flex-col items-center bg-card/60 px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Schlechtester</span>
          <span className="text-sm font-bold text-red-400">{worstDay < 0 ? fmtPnl(worstDay) : "—"}</span>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
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
                  "relative flex min-h-[52px] flex-col items-center rounded-lg border px-1 py-1 transition-colors",
                  inMonth ? "border-border/30 bg-background/50" : "border-transparent bg-transparent opacity-30",
                  inMonth && canEdit && "cursor-pointer hover:border-border/60 hover:bg-accent/30",
                  today && "border-primary/50 bg-primary/5",
                  hasValue && value > 0 && "border-emerald-500/30 bg-emerald-500/5",
                  hasValue && value < 0 && "border-red-500/30 bg-red-500/5",
                )}
              >
                <span className={cn(
                  "text-[10px] font-medium leading-none",
                  today ? "text-primary" : inMonth ? "text-muted-foreground" : "text-muted-foreground/40",
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
                    className="mt-0.5 w-full rounded bg-background px-0.5 text-center text-[11px] font-medium outline-none ring-1 ring-primary/50"
                    placeholder="0"
                  />
                ) : hasValue ? (
                  <span className={cn(
                    "mt-0.5 text-[11px] font-semibold leading-tight",
                    value > 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {value > 0 ? "+" : "−"}{Math.abs(value).toLocaleString("de-DE", { maximumFractionDigits: 0 })}{currency}
                  </span>
                ) : inMonth && canEdit ? (
                  <span className="mt-1 text-[10px] text-muted-foreground/20">+</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/30 px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {wins} Gewinn
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-400" />
            {losses} Verlust
          </span>
          <span>{tradeDays} Tage</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50">MEXC Futures</span>
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
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Offene Positionen</p>
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
                      {p.pnl >= 0 ? <ArrowUpRight className="h-3 w-3 text-emerald-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                      <span className={cn("text-sm font-semibold", p.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {p.pnl >= 0 ? "+" : ""}{p.pnl.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Size: {p.size} · Entry: {p.entryPrice.toLocaleString("de-DE")}
                    </span>
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
      className={cn("group relative transition-all", isDragOver && "border-t-2 border-primary pt-2")}
    >
      {canEdit && (
        <div className="absolute -left-7 top-0 flex h-full flex-col items-center justify-start pt-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="cursor-grab rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-muted-foreground active:cursor-grabbing" title="Verschieben">
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="rounded p-0.5 text-muted-foreground/40 hover:bg-accent hover:text-destructive" title="Block löschen">
            <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex flex-col gap-3 pl-7 mb-4">
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
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Centered + pill button */}
      {canEdit && (
        <div ref={menuRef} className="relative flex justify-center">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background shadow-md transition-opacity hover:opacity-80"
          >
            <Plus className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border bg-popover shadow-xl">
              <div className="border-b border-border/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Block einfügen
              </div>
              {BLOCK_TYPES.map(bt => (
                <button key={bt.type} onClick={() => addBlock(bt.type)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted">
                    {bt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{bt.label}</p>
                    <p className="text-xs text-muted-foreground">{bt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
