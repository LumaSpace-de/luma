"use client"

import { addDays, format, isSameDay } from "date-fns"
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

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 64

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m ?? 0)
}

interface TimelineViewProps {
  currentDate: Date
  daysCount: number
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onHourClick: (date: Date) => void
}

export function TimelineView({ currentDate, daysCount, events, onEventClick, onHourClick }: TimelineViewProps) {
  const nowRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const days = Array.from({ length: daysCount }, (_, i) => addDays(currentDate, i))

  useEffect(() => {
    nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [currentDate])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day headers */}
      <div
        className="shrink-0 border-b"
        style={{ display: "grid", gridTemplateColumns: `4rem repeat(${daysCount}, minmax(0,1fr))` }}
      >
        <div /> {/* spacer for hour labels */}
        {days.map((day) => {
          const isToday = isSameDay(day, now)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border-l py-2 text-center text-xs font-medium",
                isToday ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className={cn(
                "inline-block rounded-full px-1.5 py-0.5",
                isToday && "bg-primary text-primary-foreground"
              )}>
                {format(day, "EEE d", { locale: de })}
              </span>
            </div>
          )
        })}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: `4rem repeat(${daysCount}, minmax(0,1fr))`,
            height: `${HOURS.length * HOUR_HEIGHT}px`,
          }}
        >
          {/* Hour labels column */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-b border-border/30"
                style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span className="absolute right-2 top-1 text-[10px] text-muted-foreground/60 select-none">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const isToday = isSameDay(day, now)
            const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day))
            const timedEvents = dayEvents.filter((e) => e.time)
            const allDayEvents = dayEvents.filter((e) => !e.time)

            return (
              <div key={day.toISOString()} className="relative border-l border-border/50">
                {/* Hour slots (clickable) */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 cursor-pointer border-b border-border/20 hover:bg-accent/10"
                    style={{ top: `${h * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                    onClick={() => {
                      const d = new Date(day)
                      d.setHours(h, 0, 0, 0)
                      onHourClick(d)
                    }}
                  >
                    {/* Half-hour dashed line */}
                    <div className="absolute bottom-0 left-0 right-0 top-1/2 border-t border-dashed border-border/20" />
                  </div>
                ))}

                {/* Current time indicator */}
                {isToday && (
                  <div
                    ref={nowRef}
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: `${(nowMinutes / 60) * HOUR_HEIGHT}px` }}
                  >
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="flex-1 border-t-2 border-red-500" />
                  </div>
                )}

                {/* All-day events strip */}
                {allDayEvents.map((event, i) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "absolute left-0.5 right-0.5 z-10 truncate rounded border-l-2 px-1 py-0.5 text-left text-[10px] font-medium",
                      COLOR_BG[event.color] ?? COLOR_BG.blue
                    )}
                    style={{ top: `${2 + i * 18}px`, height: "16px" }}
                  >
                    {event.title}
                  </button>
                ))}

                {/* Timed events */}
                {timedEvents.map((event) => {
                  const startMin = timeToMinutes(event.time!)
                  const endMin = event.endTime ? timeToMinutes(event.endTime) : startMin + 60
                  const top = (startMin / 60) * HOUR_HEIGHT
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20)

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "absolute left-0.5 right-0.5 z-10 overflow-hidden rounded border-l-2 px-1.5 py-1 text-left text-xs transition-opacity hover:opacity-80",
                        COLOR_BG[event.color] ?? COLOR_BG.blue
                      )}
                      style={{ top: `${top + 1}px`, height: `${height - 2}px` }}
                    >
                      <p className="truncate font-semibold leading-tight">{event.title}</p>
                      {height >= 36 && (
                        <p className="text-[10px] opacity-70">
                          {event.time}{event.endTime ? `–${event.endTime}` : ""}
                        </p>
                      )}
                      {height >= 52 && event.location && (
                        <p className="flex items-center gap-0.5 text-[10px] opacity-60 truncate">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {event.location}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
