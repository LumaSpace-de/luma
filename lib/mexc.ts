import crypto from "crypto"

const SPOT_BASE = "https://api.mexc.com"
const FUTURES_BASE = "https://contract.mexc.com"

function sign(queryString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(queryString).digest("hex")
}

export async function mexcRequest(
  path: string,
  apiKey: string,
  apiSecret: string,
  params: Record<string, string> = {},
  base = SPOT_BASE
): Promise<{ ok: boolean; data: unknown; status: number }> {
  const timestamp = Date.now().toString()
  const allParams = { ...params, timestamp, recvWindow: "10000" }
  const queryString = new URLSearchParams(allParams).toString()
  const signature = sign(queryString, apiSecret)
  const url = `${base}${path}?${queryString}&signature=${signature}`

  const res = await fetch(url, {
    headers: {
      "X-MEXC-APIKEY": apiKey,
      "Content-Type": "application/json",
      ApiKey: apiKey,
      "Request-Time": timestamp,
      Signature: signature,
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

export interface MexcFuturesPosition {
  symbol: string
  positionType: number
  openType: number
  state: number
  holdVol: number
  frozenVol: number
  closeVol: number
  holdAvgPrice: number
  openAvgPrice: number
  closeAvgPrice: number
  liquidatePrice: number
  opiCanCancel: number
  opiVol: number
  opiAllVol: number
  adlLevel: number
  im: number
  holdFee: number
  realised: number
  leverage: number
  createTime: number
  updateTime: number
  autoAddIm: boolean
}

// Spot
export async function getMexcAccount(apiKey: string, apiSecret: string) {
  return mexcRequest("/api/v3/account", apiKey, apiSecret)
}

export async function getMexcSpotTrades(apiKey: string, apiSecret: string, symbol: string, startTime?: number, endTime?: number) {
  const params: Record<string, string> = { symbol, limit: "1000" }
  if (startTime) params.startTime = startTime.toString()
  if (endTime) params.endTime = endTime.toString()
  return mexcRequest("/api/v3/myTrades", apiKey, apiSecret, params)
}

export async function getMexcTicker() {
  const res = await fetch(`${SPOT_BASE}/api/v3/ticker/price`)
  if (!res.ok) return []
  return res.json()
}

// Futures
export async function getMexcFuturesAccount(apiKey: string, apiSecret: string) {
  return mexcRequest("/api/v1/private/account/assets", apiKey, apiSecret, {}, FUTURES_BASE)
}

export async function getMexcFuturesPositions(apiKey: string, apiSecret: string) {
  return mexcRequest("/api/v1/private/position/open_positions", apiKey, apiSecret, {}, FUTURES_BASE)
}

export async function getMexcFuturesTrades(apiKey: string, apiSecret: string, symbol: string, startTime?: number, endTime?: number) {
  const params: Record<string, string> = { symbol, page_num: "1", page_size: "100" }
  if (startTime) params.start_time = Math.floor(startTime / 1000).toString()
  if (endTime) params.end_time = Math.floor(endTime / 1000).toString()
  return mexcRequest("/api/v1/private/order/list/history_orders", apiKey, apiSecret, params, FUTURES_BASE)
}
