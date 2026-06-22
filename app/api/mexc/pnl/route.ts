import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { spotRequest, futuresRequest, MexcTrade } from "@/lib/mexc"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT"
  const month = req.nextUrl.searchParams.get("month")
  const market = req.nextUrl.searchParams.get("market") ?? "spot"

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

  const dailyPnl: Record<string, number> = {}
  let tradeCount = 0

  if (market === "futures") {
    // Futures symbol format: BTC_USDT instead of BTCUSDT
    const futSymbol = symbol.includes("_") ? symbol : symbol.replace("USDT", "_USDT")
    const params: Record<string, string> = {
      symbol: futSymbol,
      page_num: "1",
      page_size: "100",
    }
    if (startTime) params.start_time = Math.floor(startTime / 1000).toString()
    if (endTime) params.end_time = Math.floor(endTime / 1000).toString()

    const result = await futuresRequest(
      "/api/v1/private/order/list/history_orders",
      keys.apiKey, keys.apiSecret, params
    )

    if (result.ok) {
      const raw = result.data as Record<string, unknown>
      const orders = (Array.isArray(raw?.data) ? raw.data : []) as Record<string, unknown>[]
      tradeCount = orders.length

      for (const order of orders) {
        const state = Number(order.state ?? 0)
        if (state !== 3) continue
        const ts = Number(order.createTime ?? order.create_time ?? 0)
        const date = new Date(ts > 1e12 ? ts : ts * 1000).toISOString().split("T")[0]
        const profit = Number(order.profit ?? order.realised ?? 0)
        dailyPnl[date] = (dailyPnl[date] ?? 0) + profit
      }
    }
  } else {
    const params: Record<string, string> = { symbol, limit: "1000" }
    if (startTime) params.startTime = startTime.toString()
    if (endTime) params.endTime = endTime.toString()

    const result = await spotRequest("/api/v3/myTrades", keys.apiKey, keys.apiSecret, params)

    if (result.ok) {
      const trades = result.data as MexcTrade[]
      if (Array.isArray(trades)) {
        tradeCount = trades.length
        for (const trade of trades) {
          const date = new Date(trade.time).toISOString().split("T")[0]
          const quoteQty = parseFloat(trade.quoteQty)
          const commission = parseFloat(trade.commission)
          const pnl = trade.isBuyer ? -(quoteQty + commission) : quoteQty - commission
          dailyPnl[date] = (dailyPnl[date] ?? 0) + pnl
        }
      }
    }
  }

  for (const key of Object.keys(dailyPnl)) {
    dailyPnl[key] = Math.round(dailyPnl[key] * 100) / 100
  }

  return NextResponse.json({
    entries: dailyPnl,
    tradeCount,
    symbol,
    market,
  })
}
