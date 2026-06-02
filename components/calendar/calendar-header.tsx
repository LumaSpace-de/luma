"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface CalendarHeaderProps {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: de })}
        </h2>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onToday}>
          Heute
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
