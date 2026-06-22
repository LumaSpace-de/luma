import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { getMexcAccount, getMexcFuturesAccount, getMexcFuturesPositions, getMexcTicker } from "@/lib/mexc"

interface TickerPrice {
  symbol: string
  price: string
}

interface FuturesAsset {
  currency: string
  availableBalance: number
  frozenBalance: number
  positionMargin: number
  bonus: number
}

interface FuturesPosition {
  symbol: string
  positionType: number
  holdVol: number
  holdAvgPrice: number
  realised: number
  leverage: number
  liquidatePrice: number
  state: number
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

  // Spot balances
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

  // Futures balances
  let futuresBalances: { currency: string; available: number; frozen: number; equity: number }[] = []
  let futuresTotal = 0

  if (futuresResult.ok) {
    const fData = futuresResult.data as { data?: FuturesAsset[] } | FuturesAsset[]
    const fAssets = Array.isArray(fData) ? fData : (fData?.data ?? [])
    futuresBalances = fAssets
      .filter((a) => a.availableBalance > 0 || a.frozenBalance > 0 || a.positionMargin > 0)
      .map((a) => ({
        currency: a.currency,
        available: a.availableBalance,
        frozen: a.frozenBalance,
        equity: a.availableBalance + a.frozenBalance + a.positionMargin,
      }))
    futuresTotal = futuresBalances.reduce((s, b) => s + b.equity, 0)
  }

  // Futures positions
  let positions: { symbol: string; side: string; size: number; entryPrice: number; pnl: number; leverage: number; liqPrice: number }[] = []

  if (positionsResult.ok) {
    const pData = positionsResult.data as { data?: FuturesPosition[] } | FuturesPosition[]
    const pList = Array.isArray(pData) ? pData : (pData?.data ?? [])
    positions = pList
      .filter((p) => p.holdVol > 0)
      .map((p) => ({
        symbol: p.symbol,
        side: p.positionType === 1 ? "Long" : "Short",
        size: p.holdVol,
        entryPrice: p.holdAvgPrice,
        pnl: p.realised,
        leverage: p.leverage,
        liqPrice: p.liquidatePrice,
      }))
  }

  return NextResponse.json({
    spot: { balances: spotBalances, total: Math.round(spotTotal * 100) / 100 },
    futures: { balances: futuresBalances, total: Math.round(futuresTotal * 100) / 100, positions },
    totalUsd: Math.round((spotTotal + futuresTotal) * 100) / 100,
  })
}
