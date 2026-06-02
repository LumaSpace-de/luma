"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface CalendarHeaderProps {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAdd: () => void
}

export function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
  onAdd,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold tracking-tight">Kalender</h1>
        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-sm text-muted-foreground">
            {format(currentDate, "MMMM yyyy", { locale: de })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 sm:hidden">
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
