import { addDays, addMonths, addWeeks, addYears, format, isAfter, isBefore, parseISO } from "date-fns"

import { CalendarEvent } from "@/types/calendar"

const MAX_OCCURRENCES = 366

/**
 * Expands recurring events into virtual occurrences that fall within [rangeStart, rangeEnd].
 * Virtual occurrences get an id of `${event.id}::${date}` and carry `recurrenceParentId`
 * so the UI can resolve edits/deletes back to the base event.
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const result: CalendarEvent[] = []

  for (const event of events) {
    if (!event.recurrence || event.recurrence === "none") {
      result.push(event)
      continue
    }

    const baseDate = parseISO(event.date)
    let occurrence = baseDate
    let count = 0

    while (!isAfter(occurrence, rangeEnd) && count < MAX_OCCURRENCES) {
      if (!isBefore(occurrence, rangeStart) || isSameDay(occurrence, baseDate)) {
        if (!isBefore(occurrence, baseDate)) {
          const dateStr = format(occurrence, "yyyy-MM-dd")
          result.push({
            ...event,
            id: occurrence === baseDate ? event.id : `${event.id}::${dateStr}`,
            date: dateStr,
            recurrenceParentId: event.id,
          })
        }
      }

      switch (event.recurrence) {
        case "daily":   occurrence = addDays(occurrence, 1); break
        case "weekly":  occurrence = addWeeks(occurrence, 1); break
        case "monthly": occurrence = addMonths(occurrence, 1); break
        case "yearly":  occurrence = addYears(occurrence, 1); break
        default: count = MAX_OCCURRENCES
      }
      count++
    }
  }

  return result
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
