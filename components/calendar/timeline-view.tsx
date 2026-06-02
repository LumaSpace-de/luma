"use client"

import { format, isSameDay } from "date-fns"
import { de } from "date-fns/locale"
import { MapPin } from "lucide-react"
import { useEffect, useRef } from "react"

import { CalendarEvent } from "@/types/calendar"
import { cn } from "@/lib/utils"

const COLOR_BG: Record<string, string> = {
  blue:   "bg-blue-600/20 border-blue-500 text-blue-300",
  green:  "bg-green-700/20 border-green-600 text-green-300",
  red:    "bg-red-600/20 border-red-500 text-red-300",
  yellow: "bg-yellow-600/20 border-yellow-500 text-yellow-300",
  purple: "bg-purple-600/20 border-purple-500 text-purple-300",
}

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0 – 23
const HOUR_HEIGHT = 64 // px per hour

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m ?? 0)
}

interface TimelineViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onHourClick: (date: Date) => void
}

export function TimelineView({ currentDate, events, onEventClick, onHourClick }: TimelineViewProps) {
  const nowRef = useRef<HTMLDivElement>(null)
  const dayEvents = events.filter((e) => isSameDay(new Date(e.date), currentDate))
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const isToday = isSameDay(currentDate, now)

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [currentDate])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day header */}
      <div className="shrink-0 border-b px-4 py-2">
        <p className="text-sm font-medium">
          {format(currentDate, "EEEE, d. MMMM yyyy", { locale: de })}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>

          {/* Hour rows */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 flex cursor-pointer border-b border-border/30 hover:bg-accent/10"
              style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              onClick={() => {
                const d = new Date(currentDate)
                d.setHours(h, 0, 0, 0)
                onHourClick(d)
              }}
            >
              {/* Hour label */}
              <div className="w-16 shrink-0 pr-3 pt-1 text-right text-xs text-muted-foreground/60 select-none">
                {String(h).padStart(2, "0")}:00
              </div>
              {/* Half-hour line */}
              <div className="flex-1 border-t border-dashed border-border/20 mt-8" />
            </div>
          ))}

          {/* Current time indicator */}
          {isToday && (
            <div
              ref={nowRef}
              className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${(nowMinutes / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="w-16 shrink-0 pr-2 flex justify-end">
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 border-t-2 border-red-500" />
            </div>
          )}

          {/* Events */}
          {dayEvents.map((event) => {
            if (!event.time) return null
            const startMin = timeToMinutes(event.time)
            const endMin = event.endTime ? timeToMinutes(event.endTime) : startMin + 60
            const top = (startMin / 60) * HOUR_HEIGHT
            const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24)

            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={cn(
                  "absolute left-16 right-2 z-10 rounded-md border-l-2 px-2 py-1 text-left text-xs transition-opacity hover:opacity-80",
                  COLOR_BG[event.color] ?? COLOR_BG.blue
                )}
                style={{ top: `${top + 2}px`, height: `${height - 4}px` }}
              >
                <p className="truncate font-semibold leading-tight">{event.title}</p>
                <p className="text-[10px] opacity-70">
                  {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                </p>
                {event.location && (
                  <p className="mt-0.5 flex items-center gap-0.5 text-[10px] opacity-60 truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {event.location}
                  </p>
                )}
              </button>
            )
          })}

          {/* All-day / no-time events */}
          {dayEvents.filter((e) => !e.time).map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={cn(
                "absolute left-16 right-2 z-10 flex items-center gap-1 rounded-md border-l-2 px-2 py-0.5 text-left text-xs",
                COLOR_BG[event.color] ?? COLOR_BG.blue
              )}
              style={{ top: "4px", height: "20px" }}
            >
              <span className="truncate font-medium">{event.title}</span>
              <span className="ml-auto shrink-0 text-[10px] opacity-60">Ganztägig</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
