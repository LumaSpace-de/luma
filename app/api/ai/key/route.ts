import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getAnthropicApiKey, removeAnthropicApiKey, setAnthropicApiKey } from "@/lib/users-db"

// Returns whether Claude is available and whether it uses a platform key
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  if (process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ connected: true, platform: true })
  }

  const key = await getAnthropicApiKey(session.user.id)
  return NextResponse.json({ connected: !!key, platform: false })
}

// POST with no apiKey body → connect via platform key (if available)
// POST with { apiKey } → save user's own key
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const apiKey = body?.apiKey?.trim()

  if (!apiKey) {
    // Platform key connect — check if env key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ needsKey: true }, { status: 200 })
    }
    return NextResponse.json({ success: true, platform: true })
  }

  if (!apiKey.startsWith("sk-ant-")) {
    return NextResponse.json(
      { error: "Ungültiger Anthropic API Key (muss mit sk-ant- beginnen)" },
      { status: 400 }
    )
  }

  await setAnthropicApiKey(session.user.id, apiKey)
  return NextResponse.json({ success: true, platform: false })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  await removeAnthropicApiKey(session.user.id)
  return NextResponse.json({ success: true })
}
