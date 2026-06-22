import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { getMexcAccount, getMexcFuturesAccount, getMexcFuturesPositions, getMexcTicker } from "@/lib/mexc"

interface TickerPrice {
  symbol: string
  price: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const [accountResult, futuresResult, positionsResult, tickerData] = await Promise.all([
    getMexcAccount(keys.apiKey, keys.apiSecret),
    getMexcFuturesAccount(keys.apiKey, keys.apiSecret).catch(() => ({ ok: false, data: {}, status: 0 })),
    getMexcFuturesPositions(keys.apiKey, keys.apiSecret).catch(() => ({ ok: false, data: {}, status: 0 })),
    getMexcTicker(),
  ])

  if (!accountResult.ok) {
    return NextResponse.json({ error: "MEXC API-Fehler" }, { status: 502 })
  }

  // --- Spot balances ---
  const account = accountResult.data as { balances?: { asset: string; free: string; locked: string }[] }
  const spotBalances = (account.balances ?? [])
    .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
    .map((b) => {
      const free = parseFloat(b.free)
      const locked = parseFloat(b.locked)
      const total = free + locked

      let usdValue = 0
      if (b.asset === "USDT" || b.asset === "USDC" || b.asset === "BUSD") {
        usdValue = total
      } else {
        const ticker = (tickerData as TickerPrice[]).find(
          (t) => t.symbol === `${b.asset}USDT`
        )
        if (ticker) usdValue = total * parseFloat(ticker.price)
      }

      return {
        asset: b.asset,
        free,
        locked,
        total,
        usdValue: Math.round(usdValue * 100) / 100,
      }
    })
    .sort((a, b) => b.usdValue - a.usdValue)

  const spotTotal = spotBalances.reduce((s, b) => s + b.usdValue, 0)

  // --- Futures ---
  let futuresBalances: { currency: string; available: number; frozen: number; equity: number }[] = []
  let futuresTotal = 0
  let positions: { symbol: string; side: string; size: number; entryPrice: number; pnl: number; leverage: number; liqPrice: number }[] = []
  let futuresDebug = { ok: futuresResult.ok, status: futuresResult.status, posOk: positionsResult.ok, posStatus: positionsResult.status }

  // Futures API wraps response in { success, code, data }
  if (futuresResult.ok) {
    const raw = futuresResult.data as Record<string, unknown>
    const fAssets = (raw?.data ?? raw) as Record<string, unknown>[] | Record<string, unknown>

    const assetList = Array.isArray(fAssets) ? fAssets : []
    futuresBalances = assetList
      .filter((a) => {
        const avail = Number(a.availableBalance ?? a.available_balance ?? 0)
        const frozen = Number(a.frozenBalance ?? a.frozen_balance ?? 0)
        const margin = Number(a.positionMargin ?? a.position_margin ?? 0)
        return avail > 0 || frozen > 0 || margin > 0
      })
      .map((a) => {
        const available = Number(a.availableBalance ?? a.available_balance ?? 0)
        const frozen = Number(a.frozenBalance ?? a.frozen_balance ?? 0)
        const margin = Number(a.positionMargin ?? a.position_margin ?? 0)
        return {
          currency: String(a.currency ?? "USDT"),
          available,
          frozen,
          equity: available + frozen + margin,
        }
      })
    futuresTotal = futuresBalances.reduce((s, b) => s + b.equity, 0)
  }

  if (positionsResult.ok) {
    const raw = positionsResult.data as Record<string, unknown>
    const pList = (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []) as Record<string, unknown>[]

    positions = pList
      .filter((p) => Number(p.holdVol ?? p.hold_vol ?? 0) > 0)
      .map((p) => ({
        symbol: String(p.symbol ?? ""),
        side: Number(p.positionType ?? p.position_type ?? 1) === 1 ? "Long" : "Short",
        size: Number(p.holdVol ?? p.hold_vol ?? 0),
        entryPrice: Number(p.holdAvgPrice ?? p.hold_avg_price ?? p.openAvgPrice ?? p.open_avg_price ?? 0),
        pnl: Number(p.realised ?? 0),
        leverage: Number(p.leverage ?? 1),
        liqPrice: Number(p.liquidatePrice ?? p.liquidate_price ?? 0),
      }))
  }

  return NextResponse.json({
    spot: { balances: spotBalances, total: Math.round(spotTotal * 100) / 100 },
    futures: { balances: futuresBalances, total: Math.round(futuresTotal * 100) / 100, positions, debug: futuresDebug },
    totalUsd: Math.round((spotTotal + futuresTotal) * 100) / 100,
  })
}
