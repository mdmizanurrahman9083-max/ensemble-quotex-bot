import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const asset = searchParams.get("asset") || "EURUSD_OTC"

  // Simulate real-time OTC price data with WebSocket-like updates
  const basePrice = getBasePriceForAsset(asset)
  const volatility = 0.0001
  const randomChange = (Math.random() - 0.5) * volatility
  const price = basePrice + randomChange

  const change = randomChange
  const changePercent = (change / basePrice) * 100

  return NextResponse.json({
    asset,
    price,
    change,
    changePercent,
    timestamp: Date.now(),
    isOTC: true,
  })
}

function getBasePriceForAsset(asset: string): number {
  const basePrices: Record<string, number> = {
    // Major Forex OTC
    EURUSD_OTC: 1.08456,
    GBPUSD_OTC: 1.26789,
    USDJPY_OTC: 149.234,
    AUDUSD_OTC: 0.65432,
    USDCAD_OTC: 1.35678,
    NZDUSD_OTC: 0.59876,
    EURGBP_OTC: 0.85432,
    EURJPY_OTC: 161.234,
    // Emerging Markets OTC
    USDARS_OTC: 850.45,
    USDBDT_OTC: 109.85,
    USDIDR_OTC: 15678.9,
    USDCOP_OTC: 3950.25,
    USDEGP_OTC: 48.75,
    USDDZD_OTC: 134.5,
    BRLUSD_OTC: 0.2,
    USDPHP_OTC: 56.45,
    USDNGN_OTC: 1450.8,
    USDPKR_OTC: 278.9,
    USDTRY_OTC: 32.15,
    USDMXN_OTC: 17.25,
  }
  return basePrices[asset] || 1.0
}
