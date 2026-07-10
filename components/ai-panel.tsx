"use client"

import { Bot, Key, Loader2, Send, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AiPanel({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"loading" | "disconnected" | "connecting" | "connected">("loading")
  const [platform, setPlatform] = useState(false)
  const [showKeyForm, setShowKeyForm] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [keyError, setKeyError] = useState("")
  const [keyLoading, setKeyLoading] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch("/api/ai/key")
      .then((r) => r.json())
      .then((d) => {
        setPlatform(!!d.platform)
        setStatus(d.connected ? "connected" : "disconnected")
      })
      .catch(() => setStatus("disconnected"))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleConnect() {
    setStatus("connecting")
    setKeyError("")
    const res = await fetch("/api/ai/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const data = await res.json()

    if (data.needsKey) {
      setStatus("disconnected")
      setShowKeyForm(true)
      return
    }
    if (res.ok && data.success) {
      setPlatform(!!data.platform)
      setStatus("connected")
      return
    }
    setStatus("disconnected")
  }

  async function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    setKeyError("")
    setKeyLoading(true)
    const res = await fetch("/api/ai/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setApiKey("")
      setShowKeyForm(false)
      setPlatform(false)
      setStatus("connected")
    } else {
      setKeyError(data.error ?? "Fehler beim Verbinden")
    }
    setKeyLoading(false)
  }

  async function handleDisconnect() {
    if (platform) return
    await fetch("/api/ai/key", { method: "DELETE" })
    setStatus("disconnected")
    setShowKeyForm(false)
    setMessages([])
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    const newMessages: Message[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Fehler" }))
        setMessages((prev) => {
          const u = [...prev]
          u[u.length - 1] = { role: "assistant", content: `Fehler: ${err.error ?? "Unbekannt"}` }
          return u
        })
        setStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages((prev) => {
          const u = [...prev]
          u[u.length - 1] = { role: "assistant", content: u[u.length - 1].content + chunk }
          return u
        })
      }
    } catch {
      setMessages((prev) => {
        const u = [...prev]
        u[u.length - 1] = { role: "assistant", content: "Verbindungsfehler" }
        return u
      })
    }

    setStreaming(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/20 to-violet-600/20">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <span className="flex-1 text-sm font-semibold">Claude AI</span>
        {status === "connected" && !platform && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            trennen
          </button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : status !== "connected" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20">
            <Sparkles className="h-7 w-7 text-violet-400" />
          </div>

          {!showKeyForm ? (
            <>
              <div className="text-center">
                <p className="text-sm font-semibold">Claude AI</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verbinde Claude AI, um direkt in LumaSpace mit dem KI-Assistenten zu chatten.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleConnect}
                disabled={status === "connecting"}
              >
                {status === "connecting" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Mit Claude AI verbinden
              </Button>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm font-semibold">API Key eingeben</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Erstelle einen Key unter{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>
              <form onSubmit={handleKeySubmit} className="flex w-full flex-col gap-2">
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                    autoFocus
                  />
                </div>
                {keyError && <p className="text-[11px] text-destructive">{keyError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1 gap-2" disabled={keyLoading || !apiKey.trim()}>
                    {keyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Verbinden
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyForm(false)}
                  >
                    Zurück
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                <Bot className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-center text-xs text-muted-foreground">Wie kann ich dir helfen?</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      streaming && i === messages.length - 1 && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-end gap-2 border-t p-3">
            <textarea
              ref={inputRef}
              placeholder="Nachricht eingeben… (Enter zum Senden)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e as unknown as React.FormEvent)
                }
              }}
              rows={1}
              className="min-h-[36px] max-h-24 flex-1 resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={streaming || !input.trim()}
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
