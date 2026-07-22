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
          const dayStr = format(date, "yyyy-MM-dd")
          const eventEnd = event.endDate ?? event.date
          const isMultiDay = !!event.endDate && event.endDate !== event.date
          const isStart = event.date === dayStr
          const isEnd = eventEnd === dayStr
          const isContinuation = isMultiDay && !isStart
          return (
            <button
              key={event.id}
              draggable={!!onEventDrop && !event.recurrenceParentId && !isContinuation}
              onDragStart={(e) => {
                e.stopPropagation()
                e.dataTransfer.setData("text/plain", event.recurrenceParentId ?? event.id)
                e.dataTransfer.effectAllowed = "move"
              }}
              onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
              className={cn(
                "flex h-5 w-full items-center gap-1 px-1.5 text-left text-xs text-white transition-opacity hover:opacity-90",
                onEventDrop && !event.recurrenceParentId && !isContinuation && "cursor-grab active:cursor-grabbing",
                colorMap[event.color],
                "rounded-md"
              )}
            >
              {isContinuation && <span className="shrink-0 text-white/50 text-[10px]">▸</span>}
              <span className="truncate font-medium leading-none">{event.title}</span>
              {!isContinuation && event.time && !isMultiDay && (
                <span className="ml-auto shrink-0 text-white/80">{event.time}</span>
              )}
              {isMultiDay && isStart && !isEnd && (
                <span className="ml-auto shrink-0 text-white/50 text-[10px]">→</span>
              )}
              {label && !isContinuation && (
                <span
                  className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
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
