import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getMexcKeys } from "@/lib/users-db"
import { getMexcAccount, getMexcTicker } from "@/lib/mexc"

interface TickerPrice {
  symbol: string
  price: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const keys = await getMexcKeys(session.user.id)
  if (!keys) return NextResponse.json({ error: "MEXC nicht verbunden" }, { status: 400 })

  const [accountResult, tickerData] = await Promise.all([
    getMexcAccount(keys.apiKey, keys.apiSecret),
    getMexcTicker(),
  ])

  if (!accountResult.ok) {
    return NextResponse.json({ error: "MEXC API-Fehler" }, { status: 502 })
  }

  const account = accountResult.data as { balances?: { asset: string; free: string; locked: string }[] }
  const balances = (account.balances ?? [])
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

  const totalUsd = balances.reduce((s, b) => s + b.usdValue, 0)

  return NextResponse.json({ balances, totalUsd: Math.round(totalUsd * 100) / 100 })
}
