"use client"

import {
  addDays, addMonths, addWeeks, endOfMonth, format,
  startOfMonth, startOfWeek, subDays, subMonths, subWeeks,
} from "date-fns"
import { useMemo, useState } from "react"

import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useCalendarLabels } from "@/hooks/use-calendar-labels"
import { useEventReminders } from "@/hooks/use-event-reminders"
import { expandRecurringEvents } from "@/lib/calendar-recurrence"
import { CalendarEvent } from "@/types/calendar"

import { CalendarGrid } from "./calendar-grid"
import { CalendarHeader, ViewMode } from "./calendar-header"
import { DayPanel } from "./day-panel"
import { EventDialog } from "./event-dialog"
import { SubscribeDialog } from "./subscribe-dialog"
import { TimelineView } from "./timeline-view"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [columns, setColumns] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(7)
  const [rows, setRows] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dayPanelDate, setDayPanelDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLabelIds, setActiveLabelIds] = useState<Set<string>>(new Set())

  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { labels, addLabel } = useCalendarLabels()

  useEventReminders(events)

  // Expand recurring events into virtual occurrences within the visible range
  // (generous range so navigating doesn't miss occurrences right at the edges)
  const visibleEvents = useMemo(() => {
    const rangeStart = subMonths(startOfMonth(currentDate), 1)
    const rangeEnd = addMonths(endOfMonth(currentDate), 2)
    return expandRecurringEvents(events, rangeStart, rangeEnd)
  }, [events, currentDate])

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return visibleEvents.filter((e) => {
      if (q) {
        const haystack = `${e.title} ${e.description ?? ""} ${e.location ?? ""}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (activeLabelIds.size > 0) {
        if (!e.labelId || !activeLabelIds.has(e.labelId)) return false
      }
      return true
    })
  }, [visibleEvents, searchQuery, activeLabelIds])

  function resolveBaseEvent(event: CalendarEvent): CalendarEvent {
    if (!event.recurrenceParentId) return event
    return events.find((e) => e.id === event.recurrenceParentId) ?? event
  }

  function handleDayClick(date: Date) {
    if (viewMode === "month") {
      setDayPanelDate(date)
    } else {
      setSelectedDate(date)
      setEditingEvent(null)
      setDialogOpen(true)
    }
  }

  function handleAdd() {
    setSelectedDate(viewMode !== "month" ? currentDate : new Date())
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleEventClick(event: CalendarEvent) {
    const baseEvent = resolveBaseEvent(event)
    setEditingEvent(baseEvent)
    setSelectedDate(new Date(`${event.date}T00:00:00`))
    setDialogOpen(true)
  }

  function handleNewEventForDay(date: Date) {
    setSelectedDate(date)
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleClose() {
    setDialogOpen(false)
    setEditingEvent(null)
  }

  function handleEventDrop(eventId: string, newDate: Date) {
    updateEvent(eventId, { date: format(newDate, "yyyy-MM-dd") })
  }

  function toggleLabelFilter(id: string) {
    setActiveLabelIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handlePrev() {
    if (viewMode === "timeline") {
      setCurrentDate((d) => subDays(d, 1))
    } else if (viewMode === "week") {
      setCurrentDate((d) => subWeeks(d, 1))
    } else {
      setCurrentDate((d) => subMonths(d, 1))
    }
  }

  function handleNext() {
    if (viewMode === "timeline") {
      setCurrentDate((d) => addDays(d, 1))
    } else if (viewMode === "week") {
      setCurrentDate((d) => addWeeks(d, 1))
    } else {
      setCurrentDate((d) => addMonths(d, 1))
    }
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {loading && (
        <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
          Kalender wird geladen…
        </div>
      )}
      <CalendarHeader
        currentDate={currentDate}
        columns={columns}
        rows={rows}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={() => setCurrentDate(new Date())}
        onAdd={handleAdd}
        onColumnsChange={(n) => setColumns(n as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
        onRowsChange={setRows}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        labels={labels}
        activeLabelIds={activeLabelIds}
        onToggleLabel={toggleLabelFilter}
        onClearLabelFilter={() => setActiveLabelIds(new Set())}
        onOpenSubscribe={() => setSubscribeOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {viewMode === "month" && (
          <CalendarGrid
            currentDate={currentDate}
            columns={columns}
            events={filteredEvents}
            labels={labels}
            selectedDate={dayPanelDate}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          />
        )}
        {viewMode === "week" && (
          <TimelineView
            currentDate={weekStart}
            daysCount={7}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onHourClick={handleDayClick}
          />
        )}
        {viewMode === "timeline" && (
          <TimelineView
            currentDate={currentDate}
            daysCount={rows}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onHourClick={handleDayClick}
          />
        )}

        {dayPanelDate && viewMode === "month" && (
          <DayPanel
            date={dayPanelDate}
            events={filteredEvents}
            labels={labels}
            onClose={() => setDayPanelDate(null)}
            onDateChange={setDayPanelDate}
            onEventClick={handleEventClick}
            onNewEvent={handleNewEventForDay}
          />
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={handleClose}
        selectedDate={selectedDate}
        event={editingEvent}
        labels={labels}
        onAddLabel={addLabel}
        onSave={addEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

      <SubscribeDialog open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  )
}
