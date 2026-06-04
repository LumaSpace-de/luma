"use client"

import { addDays, addMonths, subDays, subMonths } from "date-fns"
import { useState } from "react"

import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useCalendarLabels } from "@/hooks/use-calendar-labels"
import { CalendarEvent } from "@/types/calendar"

import { CalendarGrid } from "./calendar-grid"
import { CalendarHeader, ViewMode } from "./calendar-header"
import { EventDialog } from "./event-dialog"
import { TimelineView } from "./timeline-view"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [columns, setColumns] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(7)
  const [rows, setRows] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarEvents()
  const { labels, addLabel } = useCalendarLabels()

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleAdd() {
    setSelectedDate(viewMode === "timeline" ? currentDate : new Date())
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event)
    setSelectedDate(new Date(event.date))
    setDialogOpen(true)
  }

  function handleClose() {
    setDialogOpen(false)
    setEditingEvent(null)
  }

  function handlePrev() {
    if (viewMode === "timeline") {
      setCurrentDate((d) => subDays(d, 1))
    } else {
      setCurrentDate((d) => subMonths(d, 1))
    }
  }

  function handleNext() {
    if (viewMode === "timeline") {
      setCurrentDate((d) => addDays(d, 1))
    } else {
      setCurrentDate((d) => addMonths(d, 1))
    }
  }

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
      />

      {viewMode === "month" ? (
        <CalendarGrid
          currentDate={currentDate}
          columns={columns}
          events={events}
          labels={labels}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      ) : (
        <TimelineView
          currentDate={currentDate}
          daysCount={rows}
          events={events}
          onEventClick={handleEventClick}
          onHourClick={handleDayClick}
        />
      )}

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
    </div>
  )
}
