"use client"

import { useEffect, useState } from "react"

import { CalendarEvent, EventColor } from "@/types/calendar"

const STORAGE_KEY = "luma-calendar-events"

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setEvents(JSON.parse(stored))
    } catch {
      // ignore parse errors
    }
  }, [])

  function persist(next: CalendarEvent[]) {
    setEvents(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function addEvent(data: {
    title: string
    date: string
    color: EventColor
    description?: string
  }) {
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      ...data,
    }
    persist([...events, event])
  }

  function updateEvent(id: string, data: Partial<Omit<CalendarEvent, "id">>) {
    persist(events.map((e) => (e.id === id ? { ...e, ...data } : e)))
  }

  function deleteEvent(id: string) {
    persist(events.filter((e) => e.id !== id))
  }

  return { events, addEvent, updateEvent, deleteEvent }
}
