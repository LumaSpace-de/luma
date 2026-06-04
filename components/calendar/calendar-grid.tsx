"use client"

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { CalendarEvent, CalendarLabel } from "@/types/calendar"

import { CalendarDay } from "./calendar-day"

const ALL_WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

interface CalendarGridProps {
  currentDate: Date
  columns: number
  events: CalendarEvent[]
  labels: CalendarLabel[]
  selectedDate: Date | null
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarGrid({
  currentDate,
  columns,
  events,
  labels,
  selectedDate,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Build days: for each week in the month range, take only the first `columns` days
  const days: Date[] = []
  let weekStart = gridStart
  while (weekStart <= gridEnd) {
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, columns - 1),
    })
    days.push(...weekDays)
    weekStart = addDays(weekStart, 7)
  }

  const headers = ALL_WEEKDAYS.slice(0, columns)

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
      {/* Weekday headers */}
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {headers.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        className="grid flex-1 divide-x divide-y divide-border border-b border-l border-border overflow-auto"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            events={events.filter((e) => isSameDay(new Date(e.date), day))}
            labels={labels}
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
