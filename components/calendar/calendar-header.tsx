"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ChevronLeft, ChevronRight, PanelLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  currentDate: Date
  columns: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
  onColumnsChange: (n: number) => void
}

export function CalendarHeader({
  currentDate,
  columns,
  onPrev,
  onNext,
  onToday,
  onAdd,
  onColumnsChange,
}: CalendarHeaderProps) {
  const { toggle } = useInlineSidebar()

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      {/* Left: sidebar toggle + title + navigation */}
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

      {/* Right: column picker + heute + neu */}
      <div className="flex items-center gap-2">
        {/* Column picker 1–6 */}
        <div className="flex items-center rounded-md border bg-background p-0.5">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <button
              key={n}
              onClick={() => onColumnsChange(n)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-xs font-medium transition-colors",
                columns === n
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={`${n} Spalte${n === 1 ? "" : "n"}`}
            >
              {n}
            </button>
          ))}
        </div>

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
