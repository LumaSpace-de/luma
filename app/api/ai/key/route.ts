import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getAnthropicApiKey, removeAnthropicApiKey, setAnthropicApiKey } from "@/lib/users-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const key = await getAnthropicApiKey(session.user.id)
  return NextResponse.json({ connected: !!key })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const body = await req.json()
  const apiKey = body?.apiKey?.trim()

  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "Ungültiger Anthropic API Key (muss mit sk-ant- beginnen)" }, { status: 400 })
  }

  await setAnthropicApiKey(session.user.id, apiKey)
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  await removeAnthropicApiKey(session.user.id)
  return NextResponse.json({ success: true })
}
