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

  const market = req.nextUrl.searchParams.get("market") ?? "futures"
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1")

  interface TradeEntry {
    id: string
    symbol: string
    side: string
    size: number
    entryPrice: number
    closePrice: number
    pnl: number
    leverage: number
    time: number
    market: string
  }

  const trades: TradeEntry[] = []

  if (market === "futures" || market === "all") {
    try {
      const result = await futuresRequest(
        "/api/v1/private/position/list/history_positions",
        keys.apiKey, keys.apiSecret,
        { page_num: page.toString(), page_size: "100" }
      )

      if (result.ok) {
        const raw = result.data as Record<string, unknown>
        const positions = (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []) as Record<string, unknown>[]

        for (const pos of positions) {
          const ts = Number(pos.updateTime ?? pos.update_time ?? pos.createTime ?? pos.create_time ?? 0)
          const msTs = ts > 1e12 ? ts : ts * 1000

          trades.push({
            id: String(pos.id ?? pos.positionId ?? pos.position_id ?? msTs),
            symbol: String(pos.symbol ?? ""),
            side: Number(pos.positionType ?? pos.position_type ?? 1) === 1 ? "Long" : "Short",
            size: Number(pos.holdVol ?? pos.hold_vol ?? pos.closeVol ?? pos.close_vol ?? 0),
            entryPrice: Number(pos.openAvgPrice ?? pos.open_avg_price ?? pos.holdAvgPrice ?? pos.hold_avg_price ?? 0),
            closePrice: Number(pos.closeAvgPrice ?? pos.close_avg_price ?? 0),
            pnl: Number(pos.closeProfitLoss ?? pos.close_profit_loss ?? pos.realised ?? pos.profit ?? 0),
            leverage: Number(pos.leverage ?? 1),
            time: msTs,
            market: "futures",
          })
        }
      }
    } catch {}
  }

  if (market === "spot" || market === "all") {
    const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT"
    try {
      const result = await spotRequest("/api/v3/myTrades", keys.apiKey, keys.apiSecret, {
        symbol,
        limit: "100",
      })

      if (result.ok) {
        const raw = result.data as MexcTrade[]
        if (Array.isArray(raw)) {
          for (const t of raw) {
            const quoteQty = parseFloat(t.quoteQty)
            const commission = parseFloat(t.commission)
            trades.push({
              id: String(t.id),
              symbol: t.symbol,
              side: t.isBuyer ? "Buy" : "Sell",
              size: parseFloat(t.qty),
              entryPrice: parseFloat(t.price),
              closePrice: 0,
              pnl: t.isBuyer ? -(quoteQty + commission) : quoteQty - commission,
              leverage: 1,
              time: t.time,
              market: "spot",
            })
          }
        }
      }
    } catch {}
  }

  trades.sort((a, b) => b.time - a.time)

  return NextResponse.json({ trades, page, market })
}
