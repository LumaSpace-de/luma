"use client"

import { format } from "date-fns"
import { Bell, FileText, MapPin, Plus, Repeat, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarEvent, CalendarLabel, EventColor, RecurrenceFrequency } from "@/types/calendar"
import { cn } from "@/lib/utils"

interface PageOption {
  id: string
  title: string
  workspaceName: string
}

const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "none",    label: "Einmalig" },
  { value: "daily",   label: "Täglich" },
  { value: "weekly",  label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
  { value: "yearly",  label: "Jährlich" },
]

const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 0,    label: "Keine Erinnerung" },
  { value: 5,    label: "5 Minuten vorher" },
  { value: 15,   label: "15 Minuten vorher" },
  { value: 30,   label: "30 Minuten vorher" },
  { value: 60,   label: "1 Stunde vorher" },
  { value: 1440, label: "1 Tag vorher" },
]

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
  allEvents?: CalendarEvent[]
  labels: CalendarLabel[]
  onAddLabel: (name: string, color: string) => CalendarLabel
  onSave: (data: {
    title: string
    date: string
    endDate?: string
    time?: string
    endTime?: string
    location?: string
    color: EventColor
    description?: string
    labelId?: string
    recurrence?: RecurrenceFrequency
    pageId?: string
    pageTitle?: string
    reminderMinutes?: number
  }) => void
  onUpdate: (id: string, data: Partial<Omit<CalendarEvent, "id">>) => void
  onDelete: (id: string) => void
}

export function EventDialog({
  open, onClose, selectedDate, event, allEvents, labels, onAddLabel, onSave, onUpdate, onDelete,
}: EventDialogProps) {
  const [title, setTitle]           = useState("")
  const [color, setColor]           = useState<EventColor>("blue")
  const [startDate, setStartDate]   = useState("")
  const [endDate, setEndDate]       = useState("")
  const [time, setTime]             = useState("09:00")
  const [endTime, setEndTime]       = useState("10:00")
  const [location, setLocation]     = useState("")
  const [description, setDescription] = useState("")
  const [labelId, setLabelId]       = useState<string | undefined>(undefined)
  const [geoLoading, setGeoLoading] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>("none")
  const [reminderMinutes, setReminderMinutes] = useState(0)
  const [pageId, setPageId]         = useState<string | undefined>(undefined)
  const [pageTitle, setPageTitle]   = useState<string | undefined>(undefined)
  const [showPagePicker, setShowPagePicker] = useState(false)
  const [pageOptions, setPageOptions] = useState<PageOption[]>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pageSearch, setPageSearch] = useState("")

  // New label creation state
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [addressResults, setAddressResults] = useState<string[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const addressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchAddress = useCallback((query: string) => {
    if (addressTimer.current) clearTimeout(addressTimer.current)
    if (query.trim().length < 3) { setAddressResults([]); return }
    setAddressLoading(true)
    addressTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=de`,
          { headers: { "Accept-Language": "de" } }
        )
        const data = await res.json()
        const results = (data as { address: Record<string, string> }[]).map((item) => {
          const a = item.address
          const road = a.road ? `${a.road}${a.house_number ? " " + a.house_number : ""}` : ""
          const plz = a.postcode ?? ""
          const place = a.city ?? a.town ?? a.village ?? a.county ?? ""
          return [road, [plz, place].filter(Boolean).join(" ")].filter(Boolean).join(", ")
        }).filter((v, i, arr) => v && arr.indexOf(v) === i)
        setAddressResults(results)
      } catch {
        setAddressResults([])
      }
      setAddressLoading(false)
    }, 350)
  }, [])

  const titleSuggestions = useMemo(() => {
    if (!allEvents?.length || !title.trim()) return []
    const q = title.toLowerCase()
    const seen = new Set<string>()
    return allEvents
      .filter((e) => {
        const t = e.title.toLowerCase()
        if (seen.has(t) || !t.includes(q) || t === q) return false
        seen.add(t)
        return true
      })
      .map((e) => ({ title: e.title, color: e.color, labelId: e.labelId, time: e.time, endTime: e.endTime, location: e.location }))
      .slice(0, 5)
  }, [allEvents, title])

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setColor(event.color)
      setStartDate(event.date)
      setEndDate(event.endDate ?? event.date)
      setTime(event.time ?? "09:00")
      setEndTime(event.endTime ?? "10:00")
      setLocation(event.location ?? "")
      setDescription(event.description ?? "")
      setLabelId(event.labelId)
      setRecurrence(event.recurrence ?? "none")
      setReminderMinutes(event.reminderMinutes ?? 0)
      setPageId(event.pageId)
      setPageTitle(event.pageTitle)
    } else {
      setTitle("")
      setColor("blue")
      const d = selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd")
      setStartDate(d)
      setEndDate(d)
      setTime("09:00")
      setEndTime("10:00")
      setLocation("")
      setDescription("")
      setLabelId(undefined)
      setRecurrence("none")
      setReminderMinutes(0)
      setPageId(undefined)
      setPageTitle(undefined)
    }
    setShowNewLabel(false)
    setNewLabelName("")
    setNewLabelColor(LABEL_COLORS[0])
    setShowPagePicker(false)
    setPageSearch("")
  }, [event, open, selectedDate])

  useEffect(() => {
    if (!showPagePicker || pageOptions.length > 0 || pagesLoading) return
    setPagesLoading(true)
    ;(async () => {
      try {
        const wsRes = await fetch("/api/workspaces")
        const workspaces: { id: string; name: string }[] = wsRes.ok ? await wsRes.json() : []
        const lists = await Promise.all(
          workspaces.map(async (ws) => {
            const r = await fetch(`/api/pages?workspaceId=${ws.id}`)
            if (!r.ok) return []
            const pages: { id: string; title: string }[] = await r.json()
            return pages.map((p) => ({ id: p.id, title: p.title || "Ohne Titel", workspaceName: ws.name }))
          })
        )
        setPageOptions(lists.flat())
      } catch {
        setPageOptions([])
      }
      setPagesLoading(false)
    })()
  }, [showPagePicker, pageOptions.length, pagesLoading])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const isMultiDay = endDate > startDate
    const payload = {
      title,
      color,
      date:        startDate,
      endDate:     isMultiDay ? endDate : undefined,
      time:        time || undefined,
      endTime:     endTime || undefined,
      location:    location.trim() || undefined,
      description: description.trim() || undefined,
      labelId:     labelId || undefined,
      recurrence,
      reminderMinutes: reminderMinutes || undefined,
      pageId:      pageId || undefined,
      pageTitle:   pageId ? pageTitle : undefined,
    }

    if (event) {
      onUpdate(event.id, payload)
    } else {
      onSave(payload)
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
          const road = addr.road ? `${addr.road}${addr.house_number ? " " + addr.house_number : ""}` : ""
          const plz = addr.postcode ?? ""
          const place = addr.city ?? addr.town ?? addr.village ?? addr.county ?? ""
          const cityPart = [plz, place].filter(Boolean).join(" ")
          setLocation([road, cityPart].filter(Boolean).join(", ") || `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        } catch {
          setLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`)
        }
        setGeoLoading(false)
      },
      () => setGeoLoading(false)
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Event bearbeiten" : "Neues Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title with autocomplete */}
          <div className="relative flex flex-col gap-1.5">
            <Label htmlFor="event-title">Titel</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Event-Titel"
              autoComplete="off"
              autoFocus
            />
            {showSuggestions && titleSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover shadow-lg">
                {titleSuggestions.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setTitle(s.title)
                      setColor(s.color)
                      if (s.labelId) setLabelId(s.labelId)
                      if (s.time) setTime(s.time)
                      if (s.endTime) setEndTime(s.endTime)
                      if (s.location) setLocation(s.location)
                      setShowSuggestions(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", COLORS.find((c) => c.value === s.color)?.bg ?? "bg-blue-600")} />
                    <span className="truncate">{s.title}</span>
                    {s.time && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{s.time}</span>}
                  </button>
                ))}
              </div>
            )}
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

          {/* Date + Time range */}
          <div className="flex flex-col gap-2">
            {/* Start */}
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="event-start-date">Von</Label>
                <input
                  id="event-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate < e.target.value) setEndDate(e.target.value)
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="event-time">&nbsp;</Label>
                <select
                  id="event-time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value)
                    if (startDate === endDate && e.target.value >= endTime) {
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
            </div>

            {/* End */}
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="event-end-date">Bis</Label>
                <input
                  id="event-end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="event-endtime">&nbsp;</Label>
                <select
                  id="event-endtime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {(startDate === endDate ? TIME_OPTIONS.filter((t) => t > time) : TIME_OPTIONS).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration hint */}
            {startDate && endDate && (() => {
              if (endDate > startDate) {
                const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
                return <span className="text-xs text-muted-foreground">= {days} Tage</span>
              }
              if (time && endTime && endTime > time) {
                const [sh, sm] = time.split(":").map(Number)
                const [eh, em] = endTime.split(":").map(Number)
                const diff = (eh * 60 + em - sh * 60 - sm) / 60
                const label = diff % 1 === 0 ? `${diff}h` : `${diff.toFixed(1).replace(".", ",")}h`
                return <span className="text-xs text-muted-foreground">= {label} Dauer</span>
              }
              return null
            })()}
          </div>

          {/* Location with address search */}
          <div className="relative flex flex-col gap-1.5">
            <Label htmlFor="event-location">Standort (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="event-location"
                value={location}
                onChange={(e) => { setLocation(e.target.value); searchAddress(e.target.value); setShowLocationSuggestions(true) }}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                placeholder="Adresse suchen…"
                autoComplete="off"
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
            {showLocationSuggestions && (addressResults.length > 0 || addressLoading) && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover shadow-lg">
                {addressLoading && addressResults.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Suche…</div>
                )}
                {addressResults.map((addr) => (
                  <button
                    key={addr}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setLocation(addr)
                      setShowLocationSuggestions(false)
                      setAddressResults([])
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{addr}</span>
                  </button>
                ))}
              </div>
            )}
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

          {/* Recurrence + Reminder */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="event-recurrence" className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5" />
                Wiederholung
              </Label>
              <select
                id="event-recurrence"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceFrequency)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {RECURRENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="event-reminder" className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Erinnerung
              </Label>
              <select
                id="event-reminder"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked page */}
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Verknüpfte Seite (optional)
            </Label>
            {pageId && pageTitle ? (
              <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="truncate">{pageTitle}</span>
                <button
                  type="button"
                  onClick={() => { setPageId(undefined); setPageTitle(undefined) }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPagePicker((v) => !v)}
                className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5" />
                Seite verknüpfen…
              </button>
            )}

            {showPagePicker && !pageId && (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border bg-muted/30 p-2">
                <Input
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="Seite suchen…"
                  className="h-8 text-xs"
                  autoFocus
                />
                <div className="max-h-40 overflow-auto">
                  {pagesLoading ? (
                    <p className="px-2 py-2 text-xs text-muted-foreground">Lädt…</p>
                  ) : (
                    pageOptions
                      .filter((p) => p.title.toLowerCase().includes(pageSearch.toLowerCase()))
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPageId(p.id)
                            setPageTitle(p.title)
                            setShowPagePicker(false)
                          }}
                          className="flex w-full flex-col items-start rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                        >
                          <span className="truncate font-medium">{p.title}</span>
                          <span className="truncate text-[10px] text-muted-foreground">{p.workspaceName}</span>
                        </button>
                      ))
                  )}
                  {!pagesLoading && pageOptions.length === 0 && (
                    <p className="px-2 py-2 text-xs text-muted-foreground">Keine Seiten gefunden.</p>
                  )}
                </div>
              </div>
            )}
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
