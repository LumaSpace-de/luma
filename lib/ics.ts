import { addDays, format, parseISO } from "date-fns"

import { CalendarEvent, RecurrenceFrequency } from "@/types/calendar"

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function foldLine(line: string): string {
  // RFC 5545: lines longer than 75 octets should be folded with CRLF + space
  if (line.length <= 75) return line
  let result = ""
  let rest = line
  while (rest.length > 75) {
    result += rest.slice(0, 75) + "\r\n "
    rest = rest.slice(75)
  }
  return result + rest
}

const RRULE_FREQ: Record<Exclude<RecurrenceFrequency, "none">, string> = {
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
  yearly: "YEARLY",
}

function eventToVEvent(event: CalendarEvent, stamp: string): string {
  const lines: string[] = []
  lines.push("BEGIN:VEVENT")
  lines.push(`UID:${event.id}@lumaspace.de`)
  lines.push(`DTSTAMP:${stamp}`)

  const baseDate = parseISO(event.date)

  if (event.time) {
    const [h, m] = event.time.split(":").map(Number)
    const startStr = `${format(baseDate, "yyyyMMdd")}T${String(h).padStart(2, "0")}${String(m ?? 0).padStart(2, "0")}00`
    lines.push(`DTSTART:${startStr}`)

    if (event.endTime) {
      const [eh, em] = event.endTime.split(":").map(Number)
      const endStr = `${format(baseDate, "yyyyMMdd")}T${String(eh).padStart(2, "0")}${String(em ?? 0).padStart(2, "0")}00`
      lines.push(`DTEND:${endStr}`)
    }
  } else {
    lines.push(`DTSTART;VALUE=DATE:${format(baseDate, "yyyyMMdd")}`)
    lines.push(`DTEND;VALUE=DATE:${format(addDays(baseDate, 1), "yyyyMMdd")}`)
  }

  if (event.recurrence && event.recurrence !== "none") {
    lines.push(`RRULE:FREQ=${RRULE_FREQ[event.recurrence]}`)
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`)
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`)
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`)

  lines.push("END:VEVENT")
  return lines.map(foldLine).join("\r\n")
}

export function eventsToICS(events: CalendarEvent[], calendarName: string): string {
  const stamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'")

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LumaSpace//Calendar//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    ...events.map((e) => eventToVEvent(e, stamp)),
    "END:VCALENDAR",
  ]

  return lines.join("\r\n") + "\r\n"
}
