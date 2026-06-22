import crypto from "crypto"

const SPOT_BASE = "https://api.mexc.com"
const FUTURES_BASE = "https://contract.mexc.com"

function hmac(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex")
}

// Spot API — signature = HMAC(queryString)
export async function spotRequest(
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string> = {}
): Promise<{ ok: boolean; data: unknown; status: number }> {
  const timestamp = Date.now().toString()
  const allParams = { ...params, timestamp, recvWindow: "10000" }
  const queryString = new URLSearchParams(allParams).toString()
  const signature = hmac(apiSecret, queryString)
  const url = `${SPOT_BASE}${path}?${queryString}&signature=${signature}`

  const res = await fetch(url, {
    headers: { "X-MEXC-APIKEY": apiKey },
  })

  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data, status: res.status }
}

// Futures API — signature = HMAC(apiKey + timestamp [+ params])
export async function futuresRequest(
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string> = {}
): Promise<{ ok: boolean; data: unknown; status: number }> {
  const timestamp = Date.now().toString()
  const queryString = Object.keys(params).length > 0
    ? new URLSearchParams(params).toString()
    : ""
  const signInput = apiKey + timestamp + (queryString || "")
  const signature = hmac(apiSecret, signInput)
  const url = queryString
    ? `${FUTURES_BASE}${path}?${queryString}`
    : `${FUTURES_BASE}${path}`

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ApiKey: apiKey,
      "Request-Time": timestamp,
      Signature: signature,
    },
  })

  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data, status: res.status }
}

// Keep backward compat alias
export const mexcRequest = spotRequest

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

// Spot endpoints
export async function getMexcAccount(apiKey: string, apiSecret: string) {
  return spotRequest("/api/v3/account", apiKey, apiSecret)
}

export async function getMexcSpotTrades(apiKey: string, apiSecret: string, symbol: string, startTime?: number, endTime?: number) {
  const params: Record<string, string> = { symbol, limit: "1000" }
  if (startTime) params.startTime = startTime.toString()
  if (endTime) params.endTime = endTime.toString()
  return spotRequest("/api/v3/myTrades", apiKey, apiSecret, params)
}

export async function getMexcTicker() {
  const res = await fetch(`${SPOT_BASE}/api/v3/ticker/price`)
  if (!res.ok) return []
  return res.json()
}

// Futures endpoints
export async function getMexcFuturesAccount(apiKey: string, apiSecret: string) {
  return futuresRequest("/api/v1/private/account/assets", apiKey, apiSecret)
}

export async function getMexcFuturesPositions(apiKey: string, apiSecret: string) {
  return futuresRequest("/api/v1/private/position/open_positions", apiKey, apiSecret)
}

export async function getMexcFuturesHistory(apiKey: string, apiSecret: string, symbol: string, pageNum = 1, pageSize = 100) {
  const params: Record<string, string> = {
    symbol,
    page_num: pageNum.toString(),
    page_size: pageSize.toString(),
  }
  return futuresRequest("/api/v1/private/order/list/history_orders", apiKey, apiSecret, params)
}
