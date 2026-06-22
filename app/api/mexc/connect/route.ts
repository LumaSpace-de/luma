import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { setMexcKeys } from "@/lib/users-db"
import { getMexcAccount } from "@/lib/mexc"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const { apiKey, apiSecret } = await req.json()
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "API Key und Secret sind erforderlich" }, { status: 400 })
  }

  const result = await getMexcAccount(apiKey.trim(), apiSecret.trim())
  if (!result.ok) {
    return NextResponse.json({ error: "Ungültige API-Daten. Prüfe Key und Secret." }, { status: 400 })
  }

  await setMexcKeys(session.user.id, apiKey.trim(), apiSecret.trim())
  return NextResponse.json({ connected: true })
}
