"use client"

import { useState, useEffect } from "react"
import { CalendarLabel } from "@/types/calendar"

const STORAGE_KEY = "luma-calendar-labels"

const DEFAULT_LABELS: CalendarLabel[] = [
  { id: "arbeit",       name: "Arbeit",      color: "#3b82f6" },
  { id: "privat",       name: "Privat",      color: "#22c55e" },
  { id: "geburtstage",  name: "Geburtstage", color: "#f59e0b" },
]

function loadLabels(): CalendarLabel[] {
  if (typeof window === "undefined") return DEFAULT_LABELS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LABELS
    return JSON.parse(raw)
  } catch {
    return DEFAULT_LABELS
  }
}

function saveLabels(labels: CalendarLabel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(labels))
}

export function useCalendarLabels() {
  const [labels, setLabels] = useState<CalendarLabel[]>(DEFAULT_LABELS)

  useEffect(() => {
    setLabels(loadLabels())
  }, [])

  function addLabel(name: string, color: string): CalendarLabel {
    const label: CalendarLabel = { id: crypto.randomUUID(), name: name.trim(), color }
    const updated = [...labels, label]
    setLabels(updated)
    saveLabels(updated)
    return label
  }

  function deleteLabel(id: string) {
    const updated = labels.filter((l) => l.id !== id)
    setLabels(updated)
    saveLabels(updated)
  }

  return { labels, addLabel, deleteLabel }
}
