"use client"

import { format, isToday } from "date-fns"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { CalendarEvent, CalendarLabel, EventColor } from "@/types/calendar"

const colorMap: Record<EventColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-700",
  red: "bg-red-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
}

const colorHex: Record<EventColor, string> = {
  blue: "#2563eb",
  green: "#15803d",
  red: "#dc2626",
  yellow: "#ca8a04",
  purple: "#9333ea",
}

interface CalendarDayProps {
  date: Date
  events: CalendarEvent[]
  labels: CalendarLabel[]
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: () => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop?: (eventId: string, newDate: Date) => void
}

export function CalendarDay({
  date,
  events,
  labels,
  isCurrentMonth,
  isSelected,
  onClick,
  onEventClick,
  onEventDrop,
}: CalendarDayProps) {
  const today = isToday(date)
  const visible = events.slice(0, 3)
  const overflow = events.length - visible.length
  const [dragOver, setDragOver] = useState(false)

  const firstEvent = events[0]
  const firstLabel = firstEvent?.labelId ? labels.find((l) => l.id === firstEvent.labelId) : null
  const tintColor = firstLabel ? firstLabel.color : firstEvent ? colorHex[firstEvent.color] : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={(e) => {
        if (!onEventDrop) return
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!onEventDrop) return
        e.preventDefault()
        setDragOver(false)
        const eventId = e.dataTransfer.getData("text/plain")
        if (eventId) onEventDrop(eventId, date)
      }}
      className={cn(
        "flex h-full min-h-[90px] w-full cursor-pointer flex-col gap-1 p-1 transition-colors hover:bg-accent/20",
        !isCurrentMonth && "opacity-35",
        isSelected && "bg-accent/30",
        dragOver && "bg-primary/10 ring-1 ring-inset ring-primary/40"
      )}
      style={tintColor ? {
        backgroundColor: isSelected ? undefined : `${tintColor}0A`,
        boxShadow: `inset 0 0 0 1px ${tintColor}26`,
      } : undefined}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
          today && "bg-primary text-primary-foreground",
          !today && "hover:bg-accent"
        )}
      >
        {format(date, "d")}
      </span>

      <div className="flex w-full flex-col gap-0.5">
        {visible.map((event) => {
          const label = event.labelId ? labels.find((l) => l.id === event.labelId) : null
          return (
            <button
              key={event.id}
              draggable={!!onEventDrop && !event.recurrenceParentId}
              onDragStart={(e) => {
                e.stopPropagation()
                e.dataTransfer.setData("text/plain", event.recurrenceParentId ?? event.id)
                e.dataTransfer.effectAllowed = "move"
              }}
              onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
              className={cn(
                "flex w-full flex-col rounded-md px-1.5 py-0.5 text-left text-xs text-white transition-opacity hover:opacity-90",
                onEventDrop && !event.recurrenceParentId && "cursor-grab active:cursor-grabbing",
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
