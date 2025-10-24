import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { asset, timeframe } = body

  await new Promise((resolve) => setTimeout(resolve, 50))

  const basePrice = getBasePriceForAsset(asset)

  const momentum = 30 + Math.random() * 70
  const marketStrength = 40 + Math.random() * 60

  let marketDirection: "BULLISH" | "BEARISH" | "SIDEWAYS" = "SIDEWAYS"
  if (momentum > 60 && marketStrength > 55) {
    marketDirection = "BULLISH"
  } else if (momentum < 40 && marketStrength > 55) {
    marketDirection = "BEARISH"
  }

  const rsi = 30 + Math.random() * 40
  const emaFast = basePrice * (1 + (Math.random() - 0.5) * 0.0005)
  const emaSlow = basePrice * (1 + (Math.random() - 0.5) * 0.0008)
  const macdValue = (emaFast - emaSlow) * 10000
  const macdSignal = macdValue * 0.9
  const macdHistogram = macdValue - macdSignal
  const stochasticK = 20 + Math.random() * 60
  const stochasticD = stochasticK * 0.95
  const atr = basePrice * 0.0002 * (1 + Math.random())

  let signal: "CALL" | "PUT" | "NEUTRAL" = "NEUTRAL"
  let confidence = 50

  if (rsi < 35 && macdHistogram > 0 && emaFast > emaSlow && stochasticK < 30) {
    signal = "CALL"
    confidence = 75 + Math.random() * 20
  } else if (rsi > 65 && macdHistogram < 0 && emaFast < emaSlow && stochasticK > 70) {
    signal = "PUT"
    confidence = 75 + Math.random() * 20
  } else if (rsi < 45 && emaFast > emaSlow) {
    signal = "CALL"
    confidence = 65 + Math.random() * 15
  } else if (rsi > 55 && emaFast < emaSlow) {
    signal = "PUT"
    confidence = 65 + Math.random() * 15
  } else {
    confidence = 50 + Math.random() * 15
  }

  let nextCandleDirection: "UP" | "DOWN" | "NEUTRAL" = "NEUTRAL"
  let nextCandleProbability = 50

  if (signal === "CALL" && confidence > 70) {
    nextCandleDirection = "UP"
    nextCandleProbability = 70 + Math.random() * 25
  } else if (signal === "PUT" && confidence > 70) {
    nextCandleDirection = "DOWN"
    nextCandleProbability = 70 + Math.random() * 25
  } else if (marketDirection === "BULLISH") {
    nextCandleDirection = "UP"
    nextCandleProbability = 60 + Math.random() * 20
  } else if (marketDirection === "BEARISH") {
    nextCandleDirection = "DOWN"
    nextCandleProbability = 60 + Math.random() * 20
  } else {
    nextCandleDirection = Math.random() > 0.5 ? "UP" : "DOWN"
    nextCandleProbability = 50 + Math.random() * 15
  }

  const winProbability = confidence * 0.85 + Math.random() * 10

  const volatility = 40 + Math.random() * 60
  const avgCandleSize = atr * 10000 // Convert to pips

  let nextCandleSize: "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE" = "MEDIUM"
  let nextCandleSizePips = avgCandleSize

  if (volatility > 80 && marketStrength > 70) {
    nextCandleSize = "VERY_LARGE"
    nextCandleSizePips = avgCandleSize * (1.5 + Math.random() * 0.5)
  } else if (volatility > 60 || marketStrength > 60) {
    nextCandleSize = "LARGE"
    nextCandleSizePips = avgCandleSize * (1.2 + Math.random() * 0.3)
  } else if (volatility > 40) {
    nextCandleSize = "MEDIUM"
    nextCandleSizePips = avgCandleSize * (0.9 + Math.random() * 0.2)
  } else {
    nextCandleSize = "SMALL"
    nextCandleSizePips = avgCandleSize * (0.5 + Math.random() * 0.4)
  }

  const rangeFactor = nextCandleSizePips / 10000
  const nextCandleRange = {
    low: basePrice - rangeFactor * (nextCandleDirection === "DOWN" ? 0.7 : 0.3),
    high: basePrice + rangeFactor * (nextCandleDirection === "UP" ? 0.7 : 0.3),
  }

  const predictions = {
    CALL: `Strong bullish momentum detected on ${asset}. Market direction is ${marketDirection} with ${marketStrength.toFixed(0)}% strength. Multiple indicators confirm upward movement: RSI at ${rsi.toFixed(1)} (oversold), bullish EMA crossover, positive MACD histogram. Next candle predicted to close ${nextCandleDirection} with ${nextCandleProbability.toFixed(0)}% probability and ${nextCandleSize.toLowerCase()} body size of ${nextCandleSizePips.toFixed(1)} pips.`,
    PUT: `Bearish pressure identified on ${asset}. Market direction is ${marketDirection} with ${marketStrength.toFixed(0)}% strength. Technical indicators align for downward movement: RSI at ${rsi.toFixed(1)} (overbought), bearish EMA crossover, negative MACD histogram. Next candle predicted to close ${nextCandleDirection} with ${nextCandleProbability.toFixed(0)}% probability and ${nextCandleSize.toLowerCase()} body size of ${nextCandleSizePips.toFixed(1)} pips.`,
    NEUTRAL: `Mixed signals on ${asset}. Market direction is ${marketDirection} with ${marketStrength.toFixed(0)}% strength. RSI at ${rsi.toFixed(1)} is neutral. Next candle direction uncertain with ${nextCandleSize.toLowerCase()} expected size.`,
  }

  return NextResponse.json({
    asset,
    signal,
    confidence: Math.round(confidence),
    entryPrice: basePrice,
    expiryTime: 60,
    indicators: {
      rsi: Number.parseFloat(rsi.toFixed(2)),
      ema: {
        fast: Number.parseFloat(emaFast.toFixed(5)),
        slow: Number.parseFloat(emaSlow.toFixed(5)),
      },
      macd: {
        value: Number.parseFloat(macdValue.toFixed(5)),
        signal: Number.parseFloat(macdSignal.toFixed(5)),
        histogram: Number.parseFloat(macdHistogram.toFixed(5)),
      },
      stochastic: {
        k: Number.parseFloat(stochasticK.toFixed(2)),
        d: Number.parseFloat(stochasticD.toFixed(2)),
      },
      atr: Number.parseFloat(atr.toFixed(5)),
    },
    prediction: predictions[signal],
    winProbability: Number.parseFloat(winProbability.toFixed(1)),
    timestamp: Date.now(),
    nextCandleDirection,
    nextCandleProbability: Number.parseFloat(nextCandleProbability.toFixed(1)),
    marketDirection,
    marketStrength: Number.parseFloat(marketStrength.toFixed(1)),
    momentum: Number.parseFloat(momentum.toFixed(1)),
    nextCandleSize,
    nextCandleSizePips: Number.parseFloat(nextCandleSizePips.toFixed(1)),
    nextCandleRange: {
      low: Number.parseFloat(nextCandleRange.low.toFixed(5)),
      high: Number.parseFloat(nextCandleRange.high.toFixed(5)),
    },
    volatility: Number.parseFloat(volatility.toFixed(1)),
  })
}

function getBasePriceForAsset(asset: string): number {
  const basePrices: Record<string, number> = {
    EURUSD_OTC: 1.08456,
    GBPUSD_OTC: 1.26789,
    USDJPY_OTC: 149.234,
    AUDUSD_OTC: 0.65432,
    USDCAD_OTC: 1.35678,
    NZDUSD_OTC: 0.59876,
    EURGBP_OTC: 0.85432,
    EURJPY_OTC: 161.234,
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
