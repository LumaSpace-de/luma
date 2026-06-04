"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { MapPin, Plus, Trash2, X } from "lucide-react"
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
import { CalendarEvent, CalendarLabel, EventColor } from "@/types/calendar"
import { cn } from "@/lib/utils"

const COLORS: { value: EventColor; label: string; bg: string }[] = [
  { value: "blue",   label: "Blau",  bg: "bg-blue-600" },
  { value: "green",  label: "Grün",  bg: "bg-green-700" },
  { value: "red",    label: "Rot",   bg: "bg-red-600" },
  { value: "yellow", label: "Gelb",  bg: "bg-yellow-600" },
  { value: "purple", label: "Lila",  bg: "bg-purple-600" },
]

const LABEL_COLORS = [
  "#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7",
  "#ec4899","#14b8a6","#f97316","#6366f1","#84cc16",
]

// 30-minute steps, 00:00 – 23:30
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0")
  const m = i % 2 === 0 ? "00" : "30"
  return `${h}:${m}`
})

interface EventDialogProps {
  open: boolean
  onClose: () => void
  selectedDate: Date | null
  event?: CalendarEvent | null
  labels: CalendarLabel[]
  onAddLabel: (name: string, color: string) => CalendarLabel
  onSave: (data: {
    title: string
    date: string
    time?: string
    endTime?: string
    location?: string
    color: EventColor
    description?: string
    labelId?: string
  }) => void
  onUpdate: (id: string, data: Partial<Omit<CalendarEvent, "id">>) => void
  onDelete: (id: string) => void
}

export function EventDialog({
  open, onClose, selectedDate, event, labels, onAddLabel, onSave, onUpdate, onDelete,
}: EventDialogProps) {
  const [title, setTitle]           = useState("")
  const [color, setColor]           = useState<EventColor>("blue")
  const [time, setTime]             = useState("09:00")
  const [endTime, setEndTime]       = useState("10:00")
  const [location, setLocation]     = useState("")
  const [description, setDescription] = useState("")
  const [labelId, setLabelId]       = useState<string | undefined>(undefined)
  const [geoLoading, setGeoLoading] = useState(false)

  // New label creation state
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setColor(event.color)
      setTime(event.time ?? "09:00")
      setEndTime(event.endTime ?? "10:00")
      setLocation(event.location ?? "")
      setDescription(event.description ?? "")
      setLabelId(event.labelId)
    } else {
      setTitle("")
      setColor("blue")
      setTime("09:00")
      setEndTime("10:00")
      setLocation("")
      setDescription("")
      setLabelId(undefined)
    }
    setShowNewLabel(false)
    setNewLabelName("")
    setNewLabelColor(LABEL_COLORS[0])
  }, [event, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      title,
      color,
      time:        time || undefined,
      endTime:     endTime || undefined,
      location:    location.trim() || undefined,
      description: description.trim() || undefined,
      labelId:     labelId || undefined,
    }

    if (event) {
      onUpdate(event.id, payload)
    } else if (selectedDate) {
      onSave({ ...payload, date: format(selectedDate, "yyyy-MM-dd") })
    }
    onClose()
  }

  function handleCreateLabel() {
    if (!newLabelName.trim()) return
    const label = onAddLabel(newLabelName.trim(), newLabelColor)
    setLabelId(label.id)
    setShowNewLabel(false)
    setNewLabelName("")
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "de" } }
          )
          const data = await res.json()
          const addr = data.address
          const place = addr.city ?? addr.town ?? addr.village ?? addr.county ?? ""
          const road = addr.road ? `${addr.road}${addr.house_number ? " " + addr.house_number : ""}` : ""
          setLocation([road, place].filter(Boolean).join(", ") || `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        } catch {
          setLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        }
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  const dateLabel = selectedDate
    ? format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })
    : ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Event bearbeiten" : "Neues Event"}</DialogTitle>
          {dateLabel && <p className="text-sm text-muted-foreground">{dateLabel}</p>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
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

          {/* Labels */}
          <div className="flex flex-col gap-1.5">
            <Label>Label</Label>
            <div className="flex flex-wrap gap-1.5">
              {/* No label option */}
              <button
                type="button"
                onClick={() => setLabelId(undefined)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  !labelId
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                Kein Label
              </button>

              {labels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLabelId(l.id === labelId ? undefined : l.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    labelId === l.id
                      ? "border-transparent font-medium text-white"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                  style={labelId === l.id ? { backgroundColor: l.color, borderColor: l.color } : {}}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.name}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowNewLabel((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
              >
                <Plus className="h-3 w-3" />
                Neu
              </button>
            </div>

            {/* Inline new label form */}
            {showNewLabel && (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium">Neues Label erstellen</p>
                <div className="flex gap-2">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label-Name"
                    className="h-8 text-xs"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateLabel() } }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewLabel(false)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewLabelColor(c)}
                      className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c, outline: newLabelColor === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!newLabelName.trim()}
                  onClick={handleCreateLabel}
                >
                  Label erstellen
                </Button>
              </div>
            )}
          </div>

          {/* Time range */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="event-time">Von</Label>
              <select
                id="event-time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value)
                  if (e.target.value >= endTime) {
                    const idx = TIME_OPTIONS.indexOf(e.target.value)
                    setEndTime(TIME_OPTIONS[Math.min(idx + 2, TIME_OPTIONS.length - 1)])
                  }
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="event-endtime">Bis</Label>
              <select
                id="event-endtime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TIME_OPTIONS.filter((t) => t > time).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-location">Standort (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="event-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ort oder Adresse"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGeolocate}
                disabled={geoLoading}
                title="Aktuellen Standort verwenden"
              >
                <MapPin className={`h-4 w-4 ${geoLoading ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Color */}
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

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-desc">Notizen (optional)</Label>
            <Input
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Notiz…"
            />
          </div>

          <div className="flex justify-between gap-2 pt-2">
            {event && (
              <Button type="button" variant="destructive" size="sm"
                onClick={() => { onDelete(event.id); onClose() }}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Löschen
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
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
