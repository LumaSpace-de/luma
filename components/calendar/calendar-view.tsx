"use client"

import { addMonths, subMonths } from "date-fns"
import { useState } from "react"

import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { CalendarEvent } from "@/types/calendar"

import { CalendarGrid } from "./calendar-grid"
import { CalendarHeader } from "./calendar-header"
import { EventDialog } from "./event-dialog"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const { events, addEvent, updateEvent, deleteEvent } = useCalendarEvents()

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function handleAdd() {
    setSelectedDate(new Date())
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onPrev={() => setCurrentDate(subMonths(currentDate, 1))}
        onNext={() => setCurrentDate(addMonths(currentDate, 1))}
        onToday={() => setCurrentDate(new Date())}
        onAdd={handleAdd}
      />

      <CalendarGrid
        currentDate={currentDate}
        events={events}
        selectedDate={selectedDate}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      <EventDialog
        open={dialogOpen}
        onClose={handleClose}
        selectedDate={selectedDate}
        event={editingEvent}
        onSave={addEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  )
}
