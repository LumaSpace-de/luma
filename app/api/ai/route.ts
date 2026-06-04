import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: `Du bist der KI-Assistent von LumaSpace – einem modernen Produktivitäts-Workspace mit Kalender, Seiten-Editor und Workspaces.
Du hilfst Nutzern beim Schreiben von Seiteninhalten, bei der Planung, beim Organisieren und bei allen Fragen rund um ihre Arbeit.
Antworte präzise und hilfreich. Formatiere Antworten mit Markdown wenn es hilft (Listen, Überschriften, Code).
Antworte auf Deutsch, außer der Nutzer schreibt in einer anderen Sprache.`,
    messages,
  })

  return result.toDataStreamResponse()
}
