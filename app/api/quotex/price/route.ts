import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const asset = searchParams.get("asset") || "EURUSD"

    // Simulate real-time Quotex price data
    // In production, this would connect to actual Quotex WebSocket API
    const basePrice = getBasePrice(asset)
    const volatility = Math.random() * 0.0002 - 0.0001 // -0.01% to +0.01%
    const price = basePrice * (1 + volatility)
    const change = price - basePrice
    const changePercent = (change / basePrice) * 100

    return NextResponse.json({
      asset,
      price,
      change,
      changePercent,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error fetching Quotex price:", error)
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 })
  }
}

function getBasePrice(asset: string): number {
  const prices: Record<string, number> = {
    EURUSD: 1.08542,
    GBPUSD: 1.26234,
    USDJPY: 149.823,
    AUDUSD: 0.65432,
    BTCUSD: 43250.5,
    ETHUSD: 2280.75,
    XAUUSD: 2045.32,
    XAGUSD: 23.45,
  }
  return prices[asset] || 1.0
}
