"use client"

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { CalendarEvent } from "@/types/calendar"

import { CalendarDay } from "./calendar-day"

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

interface CalendarGridProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDate: Date | null
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarGrid({
  currentDate,
  events,
  selectedDate,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid flex-1 grid-cols-7 divide-x divide-y divide-border border-b border-l border-border">
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            events={events.filter((e) => isSameDay(new Date(e.date), day))}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
            onClick={() => onDayClick(day)}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
