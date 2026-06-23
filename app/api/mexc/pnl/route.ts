import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { futuresRequest, spotRequest, MexcTrade } from "@/lib/mexc"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const month = req.nextUrl.searchParams.get("month")
  const market = req.nextUrl.searchParams.get("market") ?? "futures"

  let startTime: number
  let endTime: number

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
    // Try history positions first (closed positions with PnL)
    let gotData = false

    try {
      const result = await futuresRequest(
        "/api/v1/private/position/list/history_positions",
        keys.apiKey, keys.apiSecret,
        { page_num: "1", page_size: "200" }
      )

      if (result.ok) {
        const raw = result.data as Record<string, unknown>
        const positions = (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []) as Record<string, unknown>[]

        for (const pos of positions) {
          const ts = Number(pos.updateTime ?? pos.update_time ?? pos.createTime ?? pos.create_time ?? 0)
          if (ts === 0) continue
          const msTs = ts > 1e12 ? ts : ts * 1000
          if (msTs < startTime || msTs > endTime) continue

          const profit = Number(pos.closeProfitLoss ?? pos.close_profit_loss ?? pos.realised ?? pos.profit ?? 0)
          if (profit === 0) continue

          const date = new Date(msTs).toISOString().split("T")[0]
          dailyPnl[date] = (dailyPnl[date] ?? 0) + profit
          tradeCount++
        }

        if (tradeCount > 0) gotData = true
      }
    } catch {}

    // Fallback: try history orders if positions didn't work
    if (!gotData) {
      try {
        const startSec = Math.floor(startTime / 1000)
        const endSec = Math.floor(endTime / 1000)

        const result = await futuresRequest(
          "/api/v1/private/order/list/history_orders",
          keys.apiKey, keys.apiSecret,
          { page_num: "1", page_size: "200", start_time: startSec.toString(), end_time: endSec.toString() }
        )

        if (result.ok) {
          const raw = result.data as Record<string, unknown>
          const orders = (Array.isArray(raw?.data) ? raw.data : []) as Record<string, unknown>[]

          for (const order of orders) {
            const state = Number(order.state ?? 0)
            if (state !== 3) continue

            const ts = Number(order.updateTime ?? order.update_time ?? order.createTime ?? order.create_time ?? 0)
            if (ts === 0) continue
            const msTs = ts > 1e12 ? ts : ts * 1000

            const profit = Number(order.profit ?? order.realised ?? order.dealAvgPrice ?? 0)
            if (profit === 0) continue

            const date = new Date(msTs).toISOString().split("T")[0]
            dailyPnl[date] = (dailyPnl[date] ?? 0) + profit
            tradeCount++
          }
        }
      } catch {}
    }
  } else {
    // Spot trades
    const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT"
    const params: Record<string, string> = { symbol, limit: "1000" }
    params.startTime = startTime.toString()
    params.endTime = endTime.toString()

    try {
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
    } catch {}
  }

  for (const key of Object.keys(dailyPnl)) {
    dailyPnl[key] = Math.round(dailyPnl[key] * 100) / 100
  }

  return NextResponse.json({
    entries: dailyPnl,
    tradeCount,
    market,
  })
}
