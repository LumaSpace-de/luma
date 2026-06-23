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

  const [accountRes, positionsRes, historyRes, ordersRes] = await Promise.all([
    futuresRequest("/api/v1/private/account/assets", keys.apiKey, keys.apiSecret).catch(e => ({ ok: false, status: 0, data: { error: String(e) } })),
    futuresRequest("/api/v1/private/position/open_positions", keys.apiKey, keys.apiSecret).catch(e => ({ ok: false, status: 0, data: { error: String(e) } })),
    futuresRequest("/api/v1/private/position/list/history_positions", keys.apiKey, keys.apiSecret, { page_num: "1", page_size: "5" }).catch(e => ({ ok: false, status: 0, data: { error: String(e) } })),
    futuresRequest("/api/v1/private/order/list/history_orders", keys.apiKey, keys.apiSecret, { page_num: "1", page_size: "5" }).catch(e => ({ ok: false, status: 0, data: { error: String(e) } })),
  ])

  return NextResponse.json({
    account: { ok: accountRes.ok, status: accountRes.status, sample: accountRes.data },
    openPositions: { ok: positionsRes.ok, status: positionsRes.status, sample: positionsRes.data },
    historyPositions: { ok: historyRes.ok, status: historyRes.status, sample: historyRes.data },
    historyOrders: { ok: ordersRes.ok, status: ordersRes.status, sample: ordersRes.data },
  })
}
