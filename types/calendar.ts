export type EventColor = "blue" | "green" | "red" | "yellow" | "purple"

export interface CalendarEvent {
  id: string
  title: string
  date: string
  color: EventColor
  description?: string
}
