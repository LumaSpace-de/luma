"use client"

import { useEffect, useRef, useState } from "react"

import { CalendarEvent, EventColor } from "@/types/calendar"

const LEGACY_KEY = "luma-calendar-events"

async function migrateLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    const local: CalendarEvent[] = JSON.parse(raw)
    if (local.length === 0) {
      localStorage.removeItem(LEGACY_KEY)
      return
    }
    await Promise.all(
      local.map((e) =>
        fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e),
        })
      )
    )
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // migration errors are non-fatal
  }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    async function init() {
      await migrateLocalStorage()
      const res = await fetch("/api/calendar/events")
      if (res.ok && mounted.current) {
        setEvents(await res.json())
      }
      if (mounted.current) setLoading(false)
    }
    init()
    return () => { mounted.current = false }
  }, [])

  async function addEvent(data: {
    title: string
    date: string
    time?: string
    endTime?: string
    location?: string
    color: EventColor
    description?: string
    allDay?: boolean
  }) {
    const optimistic: CalendarEvent = { id: crypto.randomUUID(), ...data }
    setEvents((prev) => [...prev, optimistic])

    const res = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optimistic),
    })

    if (res.ok) {
      const created: CalendarEvent = await res.json()
      setEvents((prev) => prev.map((e) => (e.id === optimistic.id ? created : e)))
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== optimistic.id))
    }
  }

  async function updateEvent(id: string, data: Partial<Omit<CalendarEvent, "id">>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)))

    await fetch(`/api/calendar/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  }

  async function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    await fetch(`/api/calendar/events/${id}`, { method: "DELETE" })
  }

  return { events, loading, addEvent, updateEvent, deleteEvent }
}
