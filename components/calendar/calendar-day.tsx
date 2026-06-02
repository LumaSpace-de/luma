"use client"

import { format, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { CalendarEvent, EventColor } from "@/types/calendar"

const colorMap: Record<EventColor, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
}

interface CalendarDayProps {
  date: Date
  events: CalendarEvent[]
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: () => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarDay({
  date,
  events,
  isCurrentMonth,
  isSelected,
  onClick,
  onEventClick,
}: CalendarDayProps) {
  const today = isToday(date)
  const visible = events.slice(0, 3)
  const overflow = events.length - visible.length

  return (
    <div
      className={cn(
        "flex h-full min-h-[80px] w-full flex-col gap-1 p-1.5 transition-colors",
        !isCurrentMonth && "opacity-40",
        isSelected && "ring-1 ring-inset ring-primary"
      )}
    >
      <button
        onClick={onClick}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium hover:bg-accent"
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            today && "bg-primary text-primary-foreground"
          )}
        >
          {format(date, "d")}
        </span>
      </button>

      <div className="flex w-full flex-col gap-0.5">
        {visible.map((event) => (
          <button
            key={event.id}
            onClick={(e) => {
              e.stopPropagation()
              onEventClick(event)
            }}
            className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-xs hover:bg-accent/60"
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                colorMap[event.color]
              )}
            />
            <span className="truncate text-foreground/80">{event.title}</span>
          </button>
        ))}
        {overflow > 0 && (
          <span className="px-1 text-xs text-muted-foreground">
            +{overflow} weitere
          </span>
        )}
      </div>
    </div>
  )
}
