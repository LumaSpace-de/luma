"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  LayoutGrid,
  PanelLeft,
  Plus,
  Search,
  Smartphone,
  X,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { CalendarLabel } from "@/types/calendar"
import { cn } from "@/lib/utils"

export type ViewMode = "month" | "week" | "timeline"

interface CalendarHeaderProps {
  currentDate: Date
  columns: number
  rows: number
  viewMode: ViewMode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
  onColumnsChange: (n: number) => void
  onRowsChange: (n: number) => void
  onViewModeChange: (m: ViewMode) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  labels: CalendarLabel[]
  activeLabelIds: Set<string>
  onToggleLabel: (id: string) => void
  onClearLabelFilter: () => void
  onOpenSubscribe: () => void
}

export function CalendarHeader({
  currentDate, columns, rows, viewMode,
  onPrev, onNext, onToday, onAdd, onColumnsChange, onRowsChange, onViewModeChange,
  searchQuery, onSearchChange, labels, activeLabelIds, onToggleLabel, onClearLabelFilter,
  onOpenSubscribe,
}: CalendarHeaderProps) {
  const { toggle } = useInlineSidebar()
  const [searchOpen, setSearchOpen] = useState(false)

  const dateLabel =
    viewMode === "week"
      ? `KW ${format(currentDate, "I")} · ${format(currentDate, "MMMM yyyy", { locale: de })}`
      : format(currentDate, "MMMM yyyy", { locale: de })

  return (
    <div className="flex flex-col border-b">
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Kalender</h1>
        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 min-w-[120px] text-sm text-muted-foreground">
            {dateLabel}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center">
          {searchOpen ? (
            <div className="flex items-center gap-1 rounded-md border bg-background px-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Suchen…"
                className="h-7 w-32 bg-transparent text-xs outline-none sm:w-44"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => { setSearchOpen(false); onSearchChange("") }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSearchOpen(true)} title="Suchen">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Label filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={activeLabelIds.size > 0 ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              title="Nach Label filtern"
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {labels.length === 0 && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">Keine Labels vorhanden</p>
            )}
            {labels.map((l) => (
              <DropdownMenuItem
                key={l.id}
                onClick={(e) => { e.preventDefault(); onToggleLabel(l.id) }}
                className="gap-2 text-xs"
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                    activeLabelIds.has(l.id) ? "border-transparent" : "border-border"
                  )}
                  style={{ backgroundColor: activeLabelIds.has(l.id) ? l.color : "transparent" }}
                />
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </DropdownMenuItem>
            ))}
            {activeLabelIds.size > 0 && (
              <DropdownMenuItem onClick={onClearLabelFilter} className="text-xs text-muted-foreground">
                Filter zurücksetzen
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Apple Calendar subscription */}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpenSubscribe} title="Mit Apple Kalender verbinden">
          <Smartphone className="h-4 w-4" />
        </Button>

        {/* View toggle + rows picker */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border bg-background p-0.5">
            <button
              onClick={() => onViewModeChange("month")}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                viewMode === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title="Monatsansicht"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("week")}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                viewMode === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title="Wochenansicht"
            >
              <CalendarDays className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("timeline")}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                viewMode === "timeline"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title="Zeitstrahl"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Days dropdown — only in timeline mode */}
          {viewMode === "timeline" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                  {rows} Tag{rows === 1 ? "" : "e"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <DropdownMenuItem
                    key={n}
                    onClick={() => onRowsChange(n)}
                    className={cn("text-xs", rows === n && "font-semibold text-primary")}
                  >
                    {n} Tag{n === 1 ? "" : "e"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Column picker — only in month view */}
        {viewMode === "month" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                {columns} Spalte{columns === 1 ? "" : "n"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <DropdownMenuItem
                  key={n}
                  onClick={() => onColumnsChange(n)}
                  className={cn("text-xs", columns === n && "font-semibold text-primary")}
                >
                  {n} Spalte{n === 1 ? "" : "n"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Mobile prev/next */}
        <div className="flex items-center gap-0.5 sm:hidden">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={onToday} className="hidden sm:flex">
          Heute
        </Button>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neu</span>
        </Button>
      </div>
    </div>
    </div>
  )
}
