"use client"

import { useEffect, useRef } from "react"

import { CalendarEvent } from "@/types/calendar"

const CHECK_INTERVAL_MS = 30_000

export function useEventReminders(events: CalendarEvent[]) {
  const notified = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    function checkReminders() {
      if (Notification.permission !== "granted") return
      const now = new Date()

      for (const event of events) {
        if (!event.reminderMinutes || !event.time) continue
        const key = `${event.id}-${event.date}-${event.time}`
        if (notified.current.has(key)) continue

        const [h, m] = event.time.split(":").map(Number)
        const eventDate = new Date(`${event.date}T00:00:00`)
        eventDate.setHours(h, m ?? 0, 0, 0)
        const remindAt = new Date(eventDate.getTime() - event.reminderMinutes * 60_000)

        if (now >= remindAt && now < eventDate) {
          notified.current.add(key)
          new Notification(event.title, {
            body: `${event.time} Uhr${event.location ? ` · ${event.location}` : ""}`,
            tag: key,
          })
        }
      }
    }

    checkReminders()
    const interval = setInterval(checkReminders, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [events])
}
