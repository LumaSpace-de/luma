export type EventColor = "blue" | "green" | "red" | "yellow" | "purple"

export type RecurrenceFrequency = "none" | "daily" | "weekly" | "monthly" | "yearly"

export interface CalendarLabel {
  id: string
  name: string
  color: string // hex color e.g. "#3b82f6"
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  endTime?: string
  location?: string
  color: EventColor
  description?: string
  allDay?: boolean
  labelId?: string
  recurrence?: RecurrenceFrequency
  recurrenceParentId?: string
  pageId?: string
  pageTitle?: string
  reminderMinutes?: number
}
