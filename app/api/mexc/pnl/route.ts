import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { mexcRequest, MexcTrade } from "@/lib/mexc"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT"
  const month = req.nextUrl.searchParams.get("month")

  let startTime: number | undefined
  let endTime: number | undefined

  if (month) {
    const [y, m] = month.split("-").map(Number)
    startTime = new Date(y, m - 1, 1).getTime()
    endTime = new Date(y, m, 0, 23, 59, 59, 999).getTime()
  } else {
    const now = new Date()
    startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    endTime = now.getTime()
  }

  const params: Record<string, string> = {
    symbol,
    limit: "1000",
  }
  if (startTime) params.startTime = startTime.toString()
  if (endTime) params.endTime = endTime.toString()

  const result = await mexcRequest("/api/v3/myTrades", keys.apiKey, keys.apiSecret, params)

  if (!result.ok) {
    return NextResponse.json({ error: "Trades konnten nicht geladen werden" }, { status: 502 })
  }

  const trades = result.data as MexcTrade[]
  if (!Array.isArray(trades)) {
    return NextResponse.json({ entries: {}, trades: [] })
  }

  const dailyPnl: Record<string, number> = {}

  for (const trade of trades) {
    const date = new Date(trade.time).toISOString().split("T")[0]
    const quoteQty = parseFloat(trade.quoteQty)
    const commission = parseFloat(trade.commission)

    const pnl = trade.isBuyer ? -(quoteQty + commission) : quoteQty - commission

    dailyPnl[date] = (dailyPnl[date] ?? 0) + pnl
  }

  for (const key of Object.keys(dailyPnl)) {
    dailyPnl[key] = Math.round(dailyPnl[key] * 100) / 100
  }

  return NextResponse.json({
    entries: dailyPnl,
    tradeCount: trades.length,
    symbol,
  })
}
