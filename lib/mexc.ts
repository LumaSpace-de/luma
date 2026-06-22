import crypto from "crypto"

const BASE_URL = "https://api.mexc.com"

function sign(queryString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(queryString).digest("hex")
}

export async function mexcRequest(
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string> = {}
): Promise<{ ok: boolean; data: unknown; status: number }> {
  const timestamp = Date.now().toString()
  const allParams = { ...params, timestamp, recvWindow: "10000" }
  const queryString = new URLSearchParams(allParams).toString()
  const signature = sign(queryString, apiSecret)
  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`

  const res = await fetch(url, {
    headers: {
      "X-MEXC-APIKEY": apiKey,
      "Content-Type": "application/json",
    },
  })

  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data, status: res.status }
}

export interface MexcBalance {
  asset: string
  free: string
  locked: string
}

export interface MexcTrade {
  symbol: string
  id: number
  orderId: string
  price: string
  qty: string
  quoteQty: string
  commission: string
  commissionAsset: string
  time: number
  isBuyer: boolean
}

export async function getMexcAccount(apiKey: string, apiSecret: string) {
  return mexcRequest("/api/v3/account", apiKey, apiSecret)
}

export async function getMexcTrades(apiKey: string, apiSecret: string, symbol: string, startTime?: number, endTime?: number) {
  const params: Record<string, string> = { symbol }
  if (startTime) params.startTime = startTime.toString()
  if (endTime) params.endTime = endTime.toString()
  params.limit = "1000"
  return mexcRequest("/api/v3/myTrades", apiKey, apiSecret, params)
}

export async function getMexcTicker() {
  const res = await fetch(`${BASE_URL}/api/v3/ticker/price`)
  if (!res.ok) return []
  return res.json()
}
