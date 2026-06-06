"use client"

import { useEffect, useState } from "react"
import { PanelLeft, Flame, TrendingUp, FileText, CalendarDays, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface StatsData {
  totalPages: number
  totalEvents: number
  totalWorkspaces: number
  activityByDay: Record<string, number>
  currentStreak: number
  longestStreak: number
}

// Heatmap: last 52 weeks (364 days) + pad to week start
function buildHeatmapGrid(activityByDay: Record<string, number>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // go back 364 days
  const start = new Date(today)
  start.setDate(start.getDate() - 363)
  // align to Monday
  const dayOfWeek = (start.getDay() + 6) % 7 // 0=Mon
  start.setDate(start.getDate() - dayOfWeek)

  const weeks: { date: string; count: number }[][] = []
  let week: { date: string; count: number }[] = []
  const d = new Date(start)

  while (d <= today) {
    const key = d.toISOString().slice(0, 10)
    week.push({ date: key, count: activityByDay[key] ?? 0 })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    d.setDate(d.getDate() + 1)
  }
  if (week.length) {
    while (week.length < 7) week.push({ date: "", count: 0 })
    weeks.push(week)
  }
  return weeks
}

function heatColor(count: number) {
  if (count === 0) return "bg-muted/40"
  if (count <= 2) return "bg-blue-900/60"
  if (count <= 5) return "bg-blue-600/70"
  return "bg-blue-400"
}

export default function StatisticsPage() {
  const { toggle } = useInlineSidebar()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/statistics")
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const weeks = data ? buildHeatmapGrid(data.activityByDay) : []

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Statistiken</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/20" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">Keine Daten verfügbar.</p>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Streak + general stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/15">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aktueller Streak</p>
                  <p className="text-2xl font-bold">{data.currentStreak} <span className="text-sm font-normal text-muted-foreground">Tage</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-500/15">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Längster Streak</p>
                  <p className="text-2xl font-bold">{data.longestStreak} <span className="text-sm font-normal text-muted-foreground">Tage</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seiten gesamt</p>
                  <p className="text-2xl font-bold">{data.totalPages}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/15">
                  <CalendarDays className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Events gesamt</p>
                  <p className="text-2xl font-bold">{data.totalEvents}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-500/15">
                  <Building2 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Workspaces</p>
                  <p className="text-2xl font-bold">{data.totalWorkspaces}</p>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-xl border bg-card p-5">
              <p className="mb-4 text-sm font-semibold">Aktivität – letzte 12 Monate</p>
              <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {/* Weekday labels */}
                  <div className="flex flex-col justify-around pr-1" style={{ paddingTop: "0px" }}>
                    {["Mo", "Mi", "Fr"].map(d => (
                      <span key={d} className="text-[9px] text-muted-foreground/50 leading-none h-[10px] flex items-center">{d}</span>
                    ))}
                  </div>
                  {/* Weeks */}
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          title={day.date ? `${day.date}: ${day.count} Aktivitäten` : ""}
                          className={cn(
                            "h-[10px] w-[10px] rounded-sm transition-colors",
                            day.date ? heatColor(day.count) : "opacity-0"
                          )}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground/50">Weniger</span>
                {[0,1,3,6].map(n => (
                  <div key={n} className={cn("h-[10px] w-[10px] rounded-sm", heatColor(n))} />
                ))}
                <span className="text-[10px] text-muted-foreground/50">Mehr</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
