import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { futuresRequest } from "@/lib/mexc"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const [accountRes, positionsRes] = await Promise.all([
    futuresRequest("/api/v1/private/account/assets", keys.apiKey, keys.apiSecret),
    futuresRequest("/api/v1/private/position/open_positions", keys.apiKey, keys.apiSecret),
  ])

  return NextResponse.json({
    account: { ok: accountRes.ok, status: accountRes.status, data: accountRes.data },
    positions: { ok: positionsRes.ok, status: positionsRes.status, data: positionsRes.data },
  })
}
