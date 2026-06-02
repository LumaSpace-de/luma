"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarEvent, EventColor } from "@/types/calendar"

const COLORS: { value: EventColor; label: string; bg: string }[] = [
  { value: "blue", label: "Blau", bg: "bg-blue-600" },
  { value: "green", label: "Grün", bg: "bg-green-700" },
  { value: "red", label: "Rot", bg: "bg-red-600" },
  { value: "yellow", label: "Gelb", bg: "bg-yellow-600" },
  { value: "purple", label: "Lila", bg: "bg-purple-600" },
]

interface EventDialogProps {
  open: boolean
  onClose: () => void
  selectedDate: Date | null
  event?: CalendarEvent | null
  onSave: (data: {
    title: string
    date: string
    time?: string
    color: EventColor
    description?: string
  }) => void
  onUpdate: (id: string, data: Partial<Omit<CalendarEvent, "id">>) => void
  onDelete: (id: string) => void
}

export function EventDialog({
  open,
  onClose,
  selectedDate,
  event,
  onSave,
  onUpdate,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [color, setColor] = useState<EventColor>("blue")
  const [time, setTime] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setColor(event.color)
      setTime(event.time ?? "")
      setDescription(event.description ?? "")
    } else {
      setTitle("")
      setColor("blue")
      setTime("")
      setDescription("")
    }
  }, [event, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      title,
      color,
      time: time || undefined,
      description: description || undefined,
    }

    if (event) {
      onUpdate(event.id, payload)
    } else if (selectedDate) {
      onSave({ ...payload, date: format(selectedDate, "yyyy-MM-dd") })
    }
    onClose()
  }

  const dateLabel = selectedDate
    ? format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })
    : ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Event bearbeiten" : "Neues Event"}</DialogTitle>
          {dateLabel && (
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-title">Titel</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event-Titel"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="event-time">Uhrzeit (optional)</Label>
              <Input
                id="event-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Farbe</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full ${c.bg} ring-offset-background transition-all hover:scale-110 ${
                    color === c.value ? "ring-2 ring-ring ring-offset-2" : ""
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-desc">Beschreibung (optional)</Label>
            <Input
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Notiz..."
            />
          </div>

          <div className="flex justify-between gap-2 pt-2">
            {event && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(event.id)
                  onClose()
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Löschen
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                {event ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
