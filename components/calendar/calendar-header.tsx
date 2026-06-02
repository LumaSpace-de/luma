"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ChevronDown, ChevronLeft, ChevronRight, Clock, LayoutGrid, PanelLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

export type ViewMode = "month" | "timeline"

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
}

export function CalendarHeader({
  currentDate, columns, rows, viewMode,
  onPrev, onNext, onToday, onAdd, onColumnsChange, onRowsChange, onViewModeChange,
}: CalendarHeaderProps) {
  const { toggle } = useInlineSidebar()

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
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
            {format(currentDate, "MMMM yyyy", { locale: de })}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
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
              {[1, 2, 3, 4, 5, 6].map((n) => (
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
  )
}
