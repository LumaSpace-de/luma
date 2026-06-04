"use client"

import { format, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { CalendarEvent, CalendarLabel, EventColor } from "@/types/calendar"

const colorMap: Record<EventColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-700",
  red: "bg-red-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
}

interface CalendarDayProps {
  date: Date
  events: CalendarEvent[]
  labels: CalendarLabel[]
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: () => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarDay({
  date,
  events,
  labels,
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
        "flex h-full min-h-[90px] w-full flex-col gap-1 p-1 transition-colors hover:bg-accent/20",
        !isCurrentMonth && "opacity-35",
        isSelected && "bg-accent/30"
      )}
    >
      <button onClick={onClick} className="w-fit" tabIndex={-1}>
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors hover:bg-accent",
            today && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {format(date, "d")}
        </span>
      </button>

      <div className="flex w-full flex-col gap-0.5">
        {visible.map((event) => {
          const label = event.labelId ? labels.find((l) => l.id === event.labelId) : null
          return (
            <button
              key={event.id}
              onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
              className={cn(
                "flex w-full flex-col rounded-md px-1.5 py-0.5 text-left text-xs text-white transition-opacity hover:opacity-90",
                colorMap[event.color]
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate font-medium">{event.title}</span>
                {event.time && <span className="shrink-0 text-white/80">{event.time}</span>}
              </div>
              {label && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="truncate text-[10px] text-white/70">{label.name}</span>
                </div>
              )}
            </button>
          )
        })}
        {overflow > 0 && (
          <button
            onClick={onClick}
            className="px-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            +{overflow} weitere
          </button>
        )}
      </div>
    </div>
  )
}
