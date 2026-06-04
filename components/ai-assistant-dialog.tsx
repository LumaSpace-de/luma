"use client"

import { useChat } from "@ai-sdk/react"
import { ArrowUp, Bot, Loader2, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Schreibe eine Sprint-Planung",
  "Erstelle eine Meeting-Agenda",
  "Gib mir eine Vorlage für Wochenziele",
  "Wie plane ich meine Aufgaben?",
]

interface Props {
  open: boolean
  onClose: () => void
}

export function AIAssistantDialog({ open, onClose }: Props) {
  const { messages, sendMessage, stop, status } = useChat({
    api: "/api/ai",
  })

  const [input, setInput] = useState("")
  const isLoading = status === "submitted" || status === "streaming"

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    sendMessage({ role: "user", content: text })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10vh] z-50 mx-auto flex max-h-[80vh] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b px-4 py-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">LumaSpace AI</p>
            <p className="text-xs text-muted-foreground">Powered by Claude</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20">
                <Bot className="size-6 text-violet-400" />
              </div>
              <p className="font-medium">Wie kann ich dir helfen?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stell mir eine Frage oder gib mir eine Aufgabe.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s)
                      setTimeout(() => inputRef.current?.focus(), 0)
                    }}
                    className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex gap-3", m.role === "user" && "justify-end")}
                >
                  {m.role === "assistant" && (
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-600">
                      <Sparkles className="size-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted/60 text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">
                      {m.parts
                        ? m.parts
                            .filter((p) => p.type === "text")
                            .map((p) => (p as { type: "text"; text: string }).text)
                            .join("")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-600">
                    <Sparkles className="size-3 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 rounded-full bg-muted-foreground/40"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Frag mich etwas… (Enter zum Senden)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = "auto"
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`
              }}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-accent"
              >
                <Loader2 className="size-4 animate-spin" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!input.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
            Shift+Enter für neue Zeile · Esc zum Schließen
          </p>
        </div>

      </div>
    </>
  )
}
