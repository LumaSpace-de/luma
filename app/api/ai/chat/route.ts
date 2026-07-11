import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Claude AI ist nicht konfiguriert" }, { status: 402 })
  }

  const body = await req.json()
  const messages: { role: "user" | "assistant"; content: string }[] = body?.messages ?? []

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Keine Nachrichten" }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system:
      "Du bist ein hilfreicher Assistent in LumaSpace. Antworte auf Deutsch, außer der Nutzer schreibt in einer anderen Sprache.",
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
