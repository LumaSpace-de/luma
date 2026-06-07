"use client"

import { format, isToday, addDays, subDays } from "date-fns"
import { de } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, FileText, MapPin, Plus, Repeat, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { CalendarEvent, CalendarLabel } from "@/types/calendar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const COLOR_DOT: Record<string, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-600",
  red:    "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
}
const COLOR_BORDER: Record<string, string> = {
  blue:   "border-blue-500",
  green:  "border-green-600",
  red:    "border-red-500",
  yellow: "border-yellow-500",
  purple: "border-purple-500",
}
const COLOR_BG: Record<string, string> = {
  blue:   "bg-blue-600/10",
  green:  "bg-green-600/10",
  red:    "bg-red-500/10",
  yellow: "bg-yellow-500/10",
  purple: "bg-purple-500/10",
}

interface DayPanelProps {
  date: Date
  events: CalendarEvent[]
  labels: CalendarLabel[]
  onClose: () => void
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onNewEvent: (date: Date) => void
}

export function DayPanel({
  date,
  events,
  labels,
  onClose,
  onDateChange,
  onEventClick,
  onNewEvent,
}: DayPanelProps) {
  const router = useRouter()
  const today = isToday(date)

  const dayEvents = events
    .filter((e) => e.date === format(date, "yyyy-MM-dd"))
    .sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return -1
      if (!b.time) return 1
      return a.time.localeCompare(b.time)
    })

  return (
    <div className="flex w-72 shrink-0 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center gap-1 border-b px-3 py-2.5">
        <button
          onClick={() => onDateChange(subDays(date, 1))}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-1 flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {format(date, "EEEE", { locale: de })}
          </span>
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold",
              today ? "bg-primary text-primary-foreground" : "text-foreground"
            )}
          >
            {format(date, "d")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(date, "MMMM yyyy", { locale: de })}
          </span>
        </div>

        <button
          onClick={() => onDateChange(addDays(date, 1))}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onClose}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* New event button */}
      <div className="border-b px-3 py-2">
        <Button size="sm" className="w-full gap-1.5 text-xs" onClick={() => onNewEvent(date)}>
          <Plus className="h-3.5 w-3.5" />
          Neues Event
        </Button>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-auto p-3">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-2 text-3xl opacity-30">📅</div>
            <p className="text-sm font-medium text-muted-foreground">Keine Events</p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">
              Klick auf „Neues Event&rdquo; um loszulegen.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => {
              const label = event.labelId ? labels.find((l) => l.id === event.labelId) : null
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg border-l-[3px] p-2.5 text-left transition-colors hover:bg-accent/30",
                    COLOR_BORDER[event.color] ?? "border-blue-500",
                    COLOR_BG[event.color] ?? "bg-blue-600/10"
                  )}
                >
                  {/* Color dot */}
                  <span
                    className={cn(
                      "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                      COLOR_DOT[event.color] ?? "bg-blue-500"
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">
                      {event.title}
                    </p>

                    {/* Time */}
                    {event.time && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          {event.time}
                          {event.endTime && ` – ${event.endTime}`}
                        </span>
                      </div>
                    )}
                    {!event.time && (
                      <p className="mt-0.5 text-xs text-muted-foreground">Ganztägig</p>
                    )}

                    {/* Location */}
                    {event.location && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* Label */}
                    {label && (
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-[10px] text-muted-foreground">{label.name}</span>
                      </div>
                    )}

                    {/* Recurrence */}
                    {event.recurrence && event.recurrence !== "none" && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Repeat className="h-3 w-3 shrink-0" />
                        <span>
                          {{ daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich", yearly: "Jährlich" }[event.recurrence]}
                        </span>
                      </div>
                    )}

                    {/* Linked page */}
                    {event.pageId && event.pageTitle && (
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); router.push(`/pages/${event.pageId}`) }}
                        className="mt-1 flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.pageTitle}</span>
                      </span>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground/70">
                        {event.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
