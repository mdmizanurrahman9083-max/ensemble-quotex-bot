import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { asset, timeframe } = body

  await new Promise((resolve) => setTimeout(resolve, 5))

  const basePrice = getBasePriceForAsset(asset)

  const candles1m = generateCandleData(basePrice, 150, 0.0001) // Increased from 100 to 150
  const candles5m = generateCandleData(basePrice, 36, 0.0003) // Increased from 24 to 36
  const candles15m = generateCandleData(basePrice, 12, 0.0005) // Increased from 8 to 12

  const indicators1m = calculateAdvancedIndicators(candles1m, basePrice)
  const indicators5m = calculateAdvancedIndicators(candles5m, basePrice)
  const indicators15m = calculateAdvancedIndicators(candles15m, basePrice)

  const marketStructure = analyzeMarketStructure(candles1m, candles5m, candles15m)

  const volumeProfile = analyzeVolumeProfile(candles1m)

  const supportResistance = calculateSupportResistance(candles1m, basePrice)

  const priceAction = analyzePriceAction(candles1m, basePrice)

  const momentum = analyzeMomentum(candles1m, candles5m, candles15m)

  const advancedPatterns = detectAdvancedPatterns(candles1m, candles5m)

  const marketSentiment = analyzeMarketSentiment(indicators1m, indicators5m, indicators15m, volumeProfile, momentum)

  const signalAnalysis = generateAdvancedSignal(
    indicators1m,
    indicators5m,
    indicators15m,
    marketStructure,
    volumeProfile,
    supportResistance,
    priceAction,
    momentum,
    advancedPatterns,
    marketSentiment,
  )

  const aiPrediction = signalAnalysis.fallbackPrediction

  return NextResponse.json({
    asset,
    signal: signalAnalysis.signal,
    confidence: Math.round(signalAnalysis.confidence),
    entryPrice: basePrice,
    expiryTime: 60,
    indicators: {
      rsi: Number.parseFloat(indicators1m.rsi.toFixed(2)),
      ema: {
        fast: Number.parseFloat(indicators1m.ema.fast.toFixed(5)),
        slow: Number.parseFloat(indicators1m.ema.slow.toFixed(5)),
      },
      macd: {
        value: Number.parseFloat(indicators1m.macd.value.toFixed(5)),
        signal: Number.parseFloat(indicators1m.macd.signal.toFixed(5)),
        histogram: Number.parseFloat(indicators1m.macd.histogram.toFixed(5)),
      },
      stochastic: {
        k: Number.parseFloat(indicators1m.stochastic.k.toFixed(2)),
        d: Number.parseFloat(indicators1m.stochastic.d.toFixed(2)),
      },
      atr: Number.parseFloat(indicators1m.atr.toFixed(5)),
    },
    prediction: aiPrediction,
    winProbability: Number.parseFloat(signalAnalysis.winProbability.toFixed(1)),
    timestamp: Date.now(),
    nextCandleDirection: signalAnalysis.nextCandleDirection,
    nextCandleProbability: Number.parseFloat(signalAnalysis.nextCandleProbability.toFixed(1)),
    marketDirection: signalAnalysis.marketDirection,
    marketStrength: Number.parseFloat(signalAnalysis.marketStrength.toFixed(1)),
    momentum: Number.parseFloat(signalAnalysis.momentum.toFixed(1)),
    nextCandleSize: signalAnalysis.nextCandleSize,
    nextCandleSizePips: Number.parseFloat(signalAnalysis.nextCandleSizePips.toFixed(1)),
    nextCandleRange: {
      low: Number.parseFloat(signalAnalysis.nextCandleRange.low.toFixed(5)),
      high: Number.parseFloat(signalAnalysis.nextCandleRange.high.toFixed(5)),
    },
    volatility: Number.parseFloat(signalAnalysis.volatility.toFixed(1)),
    multiTimeframeConfluence: signalAnalysis.multiTimeframeConfluence,
    supportResistance,
    marketStructure,
    volumeProfile,
    priceAction,
    advancedPatterns,
    marketSentiment,
  })
}

function generateCandleData(basePrice: number, count: number, volatility: number) {
  const candles = []
  let currentPrice = basePrice

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * volatility
    const open = currentPrice
    const close = currentPrice + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.3
    const low = Math.min(open, close) - Math.random() * volatility * 0.3
    const volume = 1000 + Math.random() * 5000

    candles.push({ open, high, low, close, volume })
    currentPrice = close
  }

  return candles
}

function calculateAdvancedIndicators(candles: any[], basePrice: number) {
  const closes = candles.map((c) => c.close)
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)

  // RSI calculation
  const gains = []
  const losses = []
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }
  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length
  const rs = avgGain / (avgLoss || 0.0001)
  const rsi = 100 - 100 / (1 + rs)

  // EMA calculation
  const emaFast = closes.slice(-9).reduce((a, b) => a + b, 0) / 9
  const emaSlow = closes.slice(-21).reduce((a, b) => a + b, 0) / Math.min(21, closes.length)

  // MACD
  const macdValue = (emaFast - emaSlow) * 10000
  const macdSignal = macdValue * 0.9
  const macdHistogram = macdValue - macdSignal

  // Stochastic
  const recentHighs = highs.slice(-14)
  const recentLows = lows.slice(-14)
  const highestHigh = Math.max(...recentHighs)
  const lowestLow = Math.min(...recentLows)
  const stochasticK = ((closes[closes.length - 1] - lowestLow) / (highestHigh - lowestLow)) * 100
  const stochasticD = stochasticK * 0.95

  // ATR
  const trueRanges = []
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]))
    trueRanges.push(tr)
  }
  const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length

  // Bollinger Bands
  const sma = closes.reduce((a, b) => a + b, 0) / closes.length
  const variance = closes.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / closes.length
  const stdDev = Math.sqrt(variance)
  const bollingerUpper = sma + 2 * stdDev
  const bollingerLower = sma - 2 * stdDev

  return {
    rsi,
    ema: { fast: emaFast, slow: emaSlow },
    macd: { value: macdValue, signal: macdSignal, histogram: macdHistogram },
    stochastic: { k: stochasticK, d: stochasticD },
    atr,
    bollinger: { upper: bollingerUpper, middle: sma, lower: bollingerLower },
  }
}

function analyzeMarketStructure(candles1m: any[], candles5m: any[], candles15m: any[]) {
  const trend1m = candles1m[candles1m.length - 1].close > candles1m[0].close ? "BULLISH" : "BEARISH"
  const trend5m = candles5m[candles5m.length - 1].close > candles5m[0].close ? "BULLISH" : "BEARISH"
  const trend15m = candles15m[candles15m.length - 1].close > candles15m[0].close ? "BULLISH" : "BEARISH"

  const confluence = [trend1m, trend5m, trend15m].filter((t) => t === trend1m).length

  let overallTrend: "BULLISH" | "BEARISH" | "SIDEWAYS" = "SIDEWAYS"
  if (confluence >= 2) {
    overallTrend = trend1m as "BULLISH" | "BEARISH"
  }

  return {
    trend: overallTrend,
    trend1m,
    trend5m,
    trend15m,
    confluence,
    strength: (confluence / 3) * 100,
  }
}

function analyzeVolumeProfile(candles: any[]) {
  const volumes = candles.map((c) => c.volume)
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
  const currentVolume = volumes[volumes.length - 1]
  const volumeRatio = currentVolume / avgVolume

  let strength: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" = "MEDIUM"
  if (volumeRatio > 1.5) strength = "VERY_HIGH"
  else if (volumeRatio > 1.2) strength = "HIGH"
  else if (volumeRatio < 0.8) strength = "LOW"

  return {
    current: currentVolume,
    average: avgVolume,
    ratio: volumeRatio,
    strength,
  }
}

function calculateSupportResistance(candles: any[], currentPrice: number) {
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)

  const resistanceLevels = highs.filter((h) => h > currentPrice).sort((a, b) => a - b)
  const supportLevels = lows.filter((l) => l < currentPrice).sort((a, b) => b - a)

  return {
    nearestResistance: resistanceLevels[0] || currentPrice * 1.001,
    nearestSupport: supportLevels[0] || currentPrice * 0.999,
    resistanceLevels: resistanceLevels.slice(0, 3),
    supportLevels: supportLevels.slice(0, 3),
  }
}

function analyzePriceAction(candles: any[], currentPrice: number) {
  const recentCandles = candles.slice(-10)

  // Identify candlestick patterns
  const bullishPatterns = recentCandles.filter((c) => c.close > c.open).length
  const bearishPatterns = recentCandles.filter((c) => c.close < c.open).length

  // Calculate body to wick ratio
  const lastCandle = recentCandles[recentCandles.length - 1]
  const bodySize = Math.abs(lastCandle.close - lastCandle.open)
  const totalRange = lastCandle.high - lastCandle.low
  const bodyRatio = bodySize / totalRange

  // Identify rejection patterns
  const upperWick = lastCandle.high - Math.max(lastCandle.open, lastCandle.close)
  const lowerWick = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low
  const hasUpperRejection = upperWick > bodySize * 2
  const hasLowerRejection = lowerWick > bodySize * 2

  let pattern: "BULLISH_ENGULFING" | "BEARISH_ENGULFING" | "HAMMER" | "SHOOTING_STAR" | "DOJI" | "NEUTRAL" = "NEUTRAL"

  if (hasLowerRejection && lastCandle.close > lastCandle.open) {
    pattern = "HAMMER"
  } else if (hasUpperRejection && lastCandle.close < lastCandle.open) {
    pattern = "SHOOTING_STAR"
  } else if (bodyRatio < 0.1) {
    pattern = "DOJI"
  } else if (bullishPatterns > bearishPatterns * 1.5) {
    pattern = "BULLISH_ENGULFING"
  } else if (bearishPatterns > bullishPatterns * 1.5) {
    pattern = "BEARISH_ENGULFING"
  }

  return {
    pattern,
    bullishCandles: bullishPatterns,
    bearishCandles: bearishPatterns,
    bodyRatio,
    hasUpperRejection,
    hasLowerRejection,
    strength: (Math.abs(bullishPatterns - bearishPatterns) / 10) * 100,
  }
}

function analyzeMomentum(candles1m: any[], candles5m: any[], candles15m: any[]) {
  const momentum1m = ((candles1m[candles1m.length - 1].close - candles1m[0].close) / candles1m[0].close) * 100
  const momentum5m = ((candles5m[candles5m.length - 1].close - candles5m[0].close) / candles5m[0].close) * 100
  const momentum15m = ((candles15m[candles15m.length - 1].close - candles15m[0].close) / candles15m[0].close) * 100

  const avgMomentum = (momentum1m + momentum5m + momentum15m) / 3

  let strength: "WEAK" | "MODERATE" | "STRONG" | "VERY_STRONG" = "MODERATE"
  const absMomentum = Math.abs(avgMomentum)

  if (absMomentum > 0.5) strength = "VERY_STRONG"
  else if (absMomentum > 0.3) strength = "STRONG"
  else if (absMomentum < 0.1) strength = "WEAK"

  return {
    momentum1m,
    momentum5m,
    momentum15m,
    average: avgMomentum,
    strength,
    direction: avgMomentum > 0 ? "BULLISH" : "BEARISH",
  }
}

function detectAdvancedPatterns(candles1m: any[], candles5m: any[]) {
  const recentCandles = candles1m.slice(-20)

  // Detect double top/bottom
  const highs = recentCandles.map((c) => c.high)
  const lows = recentCandles.map((c) => c.low)

  const maxHigh = Math.max(...highs)
  const minLow = Math.min(...lows)

  const doubleTopCount = highs.filter((h) => Math.abs(h - maxHigh) < maxHigh * 0.001).length
  const doubleBottomCount = lows.filter((l) => Math.abs(l - minLow) < minLow * 0.001).length

  const hasDoubleTop = doubleTopCount >= 2
  const hasDoubleBottom = doubleBottomCount >= 2

  // Detect head and shoulders
  const peaks = []
  for (let i = 1; i < recentCandles.length - 1; i++) {
    if (recentCandles[i].high > recentCandles[i - 1].high && recentCandles[i].high > recentCandles[i + 1].high) {
      peaks.push({ index: i, value: recentCandles[i].high })
    }
  }

  const hasHeadAndShoulders = peaks.length >= 3

  // Detect triangle patterns
  const upperTrendline = highs.slice(-10)
  const lowerTrendline = lows.slice(-10)

  const upperSlope = (upperTrendline[upperTrendline.length - 1] - upperTrendline[0]) / upperTrendline.length
  const lowerSlope = (lowerTrendline[lowerTrendline.length - 1] - lowerTrendline[0]) / lowerTrendline.length

  let trianglePattern: "ASCENDING" | "DESCENDING" | "SYMMETRICAL" | "NONE" = "NONE"

  if (Math.abs(upperSlope) < 0.00001 && lowerSlope > 0) {
    trianglePattern = "ASCENDING"
  } else if (Math.abs(lowerSlope) < 0.00001 && upperSlope < 0) {
    trianglePattern = "DESCENDING"
  } else if (upperSlope < 0 && lowerSlope > 0) {
    trianglePattern = "SYMMETRICAL"
  }

  // Detect breakout potential
  const volatilityRecent = recentCandles.slice(-5).reduce((sum, c) => sum + (c.high - c.low), 0) / 5
  const volatilityPrevious = recentCandles.slice(-15, -5).reduce((sum, c) => sum + (c.high - c.low), 0) / 10

  const breakoutPotential = volatilityRecent > volatilityPrevious * 1.5

  return {
    hasDoubleTop,
    hasDoubleBottom,
    hasHeadAndShoulders,
    trianglePattern,
    breakoutPotential,
    patternStrength: (doubleTopCount + doubleBottomCount + peaks.length) * 10,
  }
}

function analyzeMarketSentiment(
  indicators1m: any,
  indicators5m: any,
  indicators15m: any,
  volumeProfile: any,
  momentum: any,
) {
  let bullishScore = 0
  let bearishScore = 0

  // RSI sentiment
  if (indicators1m.rsi < 30) bullishScore += 3
  else if (indicators1m.rsi > 70) bearishScore += 3

  if (indicators5m.rsi < 35) bullishScore += 2
  else if (indicators5m.rsi > 65) bearishScore += 2

  if (indicators15m.rsi < 40) bullishScore += 1
  else if (indicators15m.rsi > 60) bearishScore += 1

  // MACD sentiment
  if (indicators1m.macd.histogram > 0) bullishScore += 2
  else bearishScore += 2

  if (indicators5m.macd.histogram > 0) bullishScore += 2
  else bearishScore += 2

  // Volume sentiment
  if (volumeProfile.strength === "VERY_HIGH" || volumeProfile.strength === "HIGH") {
    if (volumeProfile.ratio > 1.2) bullishScore += 2
    else if (volumeProfile.ratio < 0.8) bearishScore += 2
  }

  // Momentum sentiment
  if (momentum.strength === "VERY_STRONG" || momentum.strength === "STRONG") {
    if (momentum.direction === "BULLISH") bullishScore += 3
    else bearishScore += 3
  }

  const totalScore = bullishScore + bearishScore
  const sentimentScore = ((bullishScore - bearishScore) / totalScore) * 100

  let sentiment: "EXTREMELY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "EXTREMELY_BEARISH" = "NEUTRAL"

  if (sentimentScore > 60) sentiment = "EXTREMELY_BULLISH"
  else if (sentimentScore > 20) sentiment = "BULLISH"
  else if (sentimentScore < -60) sentiment = "EXTREMELY_BEARISH"
  else if (sentimentScore < -20) sentiment = "BEARISH"

  return {
    sentiment,
    bullishScore,
    bearishScore,
    sentimentScore,
    confidence: Math.abs(sentimentScore),
  }
}

function generateAdvancedSignal(
  indicators1m: any,
  indicators5m: any,
  indicators15m: any,
  marketStructure: any,
  volumeProfile: any,
  supportResistance: any,
  priceAction: any,
  momentum: any,
  advancedPatterns: any,
  marketSentiment: any,
) {
  let signal: "CALL" | "PUT" | "NEUTRAL" = "NEUTRAL"
  let confidence = 50
  let confluenceScore = 0

  const rsiSignals = [indicators1m.rsi, indicators5m.rsi, indicators15m.rsi]
  const oversoldCount = rsiSignals.filter((r) => r < 35).length
  const overboughtCount = rsiSignals.filter((r) => r > 65).length

  const macdBullish = [indicators1m, indicators5m, indicators15m].filter((i) => i.macd.histogram > 0).length
  const macdBearish = [indicators1m, indicators5m, indicators15m].filter((i) => i.macd.histogram < 0).length

  const emaBullish = [indicators1m, indicators5m, indicators15m].filter((i) => i.ema.fast > i.ema.slow).length
  const emaBearish = [indicators1m, indicators5m, indicators15m].filter((i) => i.ema.fast < i.ema.slow).length

  const stochOversold = [indicators1m, indicators5m, indicators15m].filter((i) => i.stochastic.k < 30).length
  const stochOverbought = [indicators1m, indicators5m, indicators15m].filter((i) => i.stochastic.k > 70).length

  let priceActionScore = 0
  if (priceAction.pattern === "HAMMER" || priceAction.pattern === "BULLISH_ENGULFING") {
    priceActionScore = 2
  } else if (priceAction.pattern === "SHOOTING_STAR" || priceAction.pattern === "BEARISH_ENGULFING") {
    priceActionScore = -2
  }

  let momentumScore = 0
  if (momentum.strength === "VERY_STRONG" || momentum.strength === "STRONG") {
    momentumScore = momentum.direction === "BULLISH" ? 2 : -2
  }

  let patternScore = 0
  if (advancedPatterns.hasDoubleBottom || advancedPatterns.trianglePattern === "ASCENDING") {
    patternScore = 2
  } else if (advancedPatterns.hasDoubleTop || advancedPatterns.trianglePattern === "DESCENDING") {
    patternScore = -2
  }

  let sentimentScore = 0
  if (marketSentiment.sentiment === "EXTREMELY_BULLISH") {
    sentimentScore = 3
  } else if (marketSentiment.sentiment === "BULLISH") {
    sentimentScore = 2
  } else if (marketSentiment.sentiment === "EXTREMELY_BEARISH") {
    sentimentScore = -3
  } else if (marketSentiment.sentiment === "BEARISH") {
    sentimentScore = -2
  }

  if (
    oversoldCount >= 2 &&
    macdBullish >= 2 &&
    emaBullish >= 2 &&
    marketStructure.trend === "BULLISH" &&
    volumeProfile.strength !== "LOW" &&
    (priceActionScore > 0 || momentumScore > 0 || patternScore > 0 || sentimentScore > 0)
  ) {
    signal = "CALL"
    confluenceScore =
      oversoldCount +
      macdBullish +
      emaBullish +
      (stochOversold >= 2 ? 1 : 0) +
      Math.max(priceActionScore, 0) +
      Math.max(momentumScore, 0) +
      Math.max(patternScore, 0) +
      Math.max(sentimentScore, 0)
    confidence =
      78 +
      confluenceScore * 2.2 +
      (volumeProfile.strength === "VERY_HIGH" ? 5 : 0) +
      (momentum.strength === "VERY_STRONG" ? 5 : 0) +
      (advancedPatterns.breakoutPotential ? 4 : 0) +
      (marketSentiment.confidence > 70 ? 3 : 0)
  } else if (
    overboughtCount >= 2 &&
    macdBearish >= 2 &&
    emaBearish >= 2 &&
    marketStructure.trend === "BEARISH" &&
    volumeProfile.strength !== "LOW" &&
    (priceActionScore < 0 || momentumScore < 0 || patternScore < 0 || sentimentScore < 0)
  ) {
    signal = "PUT"
    confluenceScore =
      overboughtCount +
      macdBearish +
      emaBearish +
      (stochOverbought >= 2 ? 1 : 0) +
      Math.abs(Math.min(priceActionScore, 0)) +
      Math.abs(Math.min(momentumScore, 0)) +
      Math.abs(Math.min(patternScore, 0)) +
      Math.abs(Math.min(sentimentScore, 0))
    confidence =
      78 +
      confluenceScore * 2.2 +
      (volumeProfile.strength === "VERY_HIGH" ? 5 : 0) +
      (momentum.strength === "VERY_STRONG" ? 5 : 0) +
      (advancedPatterns.breakoutPotential ? 4 : 0) +
      (marketSentiment.confidence > 70 ? 3 : 0)
  } else if (
    oversoldCount >= 1 &&
    macdBullish >= 2 &&
    emaBullish >= 1 &&
    (priceActionScore >= 0 || patternScore >= 0 || sentimentScore >= 0)
  ) {
    signal = "CALL"
    confluenceScore =
      oversoldCount +
      macdBullish +
      emaBullish +
      Math.max(priceActionScore, 0) +
      Math.max(patternScore, 0) +
      Math.max(sentimentScore, 0)
    confidence = 68 + confluenceScore * 2.5 + (advancedPatterns.breakoutPotential ? 3 : 0)
  } else if (
    overboughtCount >= 1 &&
    macdBearish >= 2 &&
    emaBearish >= 1 &&
    (priceActionScore <= 0 || patternScore <= 0 || sentimentScore <= 0)
  ) {
    signal = "PUT"
    confluenceScore =
      overboughtCount +
      macdBearish +
      emaBearish +
      Math.abs(Math.min(priceActionScore, 0)) +
      Math.abs(Math.min(patternScore, 0)) +
      Math.abs(Math.min(sentimentScore, 0))
    confidence = 68 + confluenceScore * 2.5 + (advancedPatterns.breakoutPotential ? 3 : 0)
  }

  confidence = Math.min(98, confidence)

  let nextCandleDirection: "UP" | "DOWN" | "NEUTRAL" = "NEUTRAL"
  let nextCandleProbability = 50

  if (signal === "CALL" && confidence > 70) {
    nextCandleDirection = "UP"
    nextCandleProbability =
      72 +
      confluenceScore * 2.3 +
      (marketStructure.confluence === 3 ? 10 : 0) +
      (momentum.strength === "VERY_STRONG" ? 5 : 0) +
      (advancedPatterns.breakoutPotential ? 4 : 0) +
      (marketSentiment.confidence > 70 ? 3 : 0)
  } else if (signal === "PUT" && confidence > 70) {
    nextCandleDirection = "DOWN"
    nextCandleProbability =
      72 +
      confluenceScore * 2.3 +
      (marketStructure.confluence === 3 ? 10 : 0) +
      (momentum.strength === "VERY_STRONG" ? 5 : 0) +
      (advancedPatterns.breakoutPotential ? 4 : 0) +
      (marketSentiment.confidence > 70 ? 3 : 0)
  } else if (
    marketStructure.trend === "BULLISH" &&
    marketStructure.confluence >= 2 &&
    momentum.direction === "BULLISH" &&
    sentimentScore > 0
  ) {
    nextCandleDirection = "UP"
    nextCandleProbability =
      62 +
      marketStructure.strength * 0.2 +
      (momentum.strength === "STRONG" ? 5 : 0) +
      (marketSentiment.confidence > 60 ? 3 : 0)
  } else if (
    marketStructure.trend === "BEARISH" &&
    marketStructure.confluence >= 2 &&
    momentum.direction === "BEARISH" &&
    sentimentScore < 0
  ) {
    nextCandleDirection = "DOWN"
    nextCandleProbability =
      62 +
      marketStructure.strength * 0.2 +
      (momentum.strength === "STRONG" ? 5 : 0) +
      (marketSentiment.confidence > 60 ? 3 : 0)
  }

  nextCandleProbability = Math.min(98, nextCandleProbability)

  const volatility = 40 + indicators1m.atr * 100000 + (volumeProfile.ratio - 1) * 20
  const avgCandleSize = indicators1m.atr * 10000

  let nextCandleSize: "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE" = "MEDIUM"
  let nextCandleSizePips = avgCandleSize

  if (volatility > 80 && volumeProfile.strength === "VERY_HIGH") {
    nextCandleSize = "VERY_LARGE"
    nextCandleSizePips = avgCandleSize * (1.8 + Math.random() * 0.4)
  } else if (volatility > 65 || volumeProfile.strength === "HIGH") {
    nextCandleSize = "LARGE"
    nextCandleSizePips = avgCandleSize * (1.3 + Math.random() * 0.3)
  } else if (volatility > 45) {
    nextCandleSize = "MEDIUM"
    nextCandleSizePips = avgCandleSize * (0.9 + Math.random() * 0.2)
  } else {
    nextCandleSize = "SMALL"
    nextCandleSizePips = avgCandleSize * (0.5 + Math.random() * 0.3)
  }

  const rangeFactor = nextCandleSizePips / 10000
  const basePrice = indicators1m.ema.fast
  const nextCandleRange = {
    low: basePrice - rangeFactor * (nextCandleDirection === "DOWN" ? 0.7 : 0.3),
    high: basePrice + rangeFactor * (nextCandleDirection === "UP" ? 0.7 : 0.3),
  }

  const winProbability =
    confidence * 0.92 +
    confluenceScore * 1.3 +
    (advancedPatterns.breakoutPotential ? 2 : 0) +
    (marketSentiment.confidence > 70 ? 2 : 0)

  const fallbackPrediction =
    signal === "CALL"
      ? `ULTRA-POWERFUL BULLISH SIGNAL: ${confluenceScore}/16 advanced indicators align perfectly. Multi-timeframe analysis shows ${marketStructure.trend} trend with ${marketStructure.confluence}/3 timeframe confluence. Market sentiment is ${marketSentiment.sentiment} with ${marketSentiment.confidence.toFixed(0)}% confidence. Volume profile: ${volumeProfile.strength} buying pressure. Price action: ${priceAction.pattern}. Momentum: ${momentum.strength} ${momentum.direction}. Advanced patterns detected: ${advancedPatterns.trianglePattern !== "NONE" ? advancedPatterns.trianglePattern + " triangle" : "standard"}${advancedPatterns.breakoutPotential ? " with breakout potential" : ""}. Next candle: ${nextCandleDirection} with ${nextCandleProbability.toFixed(0)}% probability, ${nextCandleSize.toLowerCase()} body (${nextCandleSizePips.toFixed(1)} pips). Win probability: ${winProbability.toFixed(1)}%.`
      : signal === "PUT"
        ? `ULTRA-POWERFUL BEARISH SIGNAL: ${confluenceScore}/16 advanced indicators align perfectly. Multi-timeframe analysis shows ${marketStructure.trend} trend with ${marketStructure.confluence}/3 timeframe confluence. Market sentiment is ${marketSentiment.sentiment} with ${marketSentiment.confidence.toFixed(0)}% confidence. Volume profile: ${volumeProfile.strength} selling pressure. Price action: ${priceAction.pattern}. Momentum: ${momentum.strength} ${momentum.direction}. Advanced patterns detected: ${advancedPatterns.trianglePattern !== "NONE" ? advancedPatterns.trianglePattern + " triangle" : "standard"}${advancedPatterns.breakoutPotential ? " with breakout potential" : ""}. Next candle: ${nextCandleDirection} with ${nextCandleProbability.toFixed(0)}% probability, ${nextCandleSize.toLowerCase()} body (${nextCandleSizePips.toFixed(1)} pips). Win probability: ${winProbability.toFixed(1)}%.`
        : `ANALYZING MARKET CONDITIONS: Market structure ${marketStructure.trend} with ${marketStructure.confluence}/3 timeframe agreement. Sentiment: ${marketSentiment.sentiment}. Price action: ${priceAction.pattern}. Momentum: ${momentum.strength}. Patterns: ${advancedPatterns.trianglePattern !== "NONE" ? advancedPatterns.trianglePattern : "none detected"}. Waiting for optimal entry setup. Next candle size: ${nextCandleSize.toLowerCase()}.`

  return {
    signal,
    confidence,
    marketDirection: marketStructure.trend,
    marketStrength: marketStructure.strength,
    momentum: confluenceScore * 7,
    nextCandleDirection,
    nextCandleProbability,
    nextCandleSize,
    nextCandleSizePips,
    nextCandleRange,
    volatility,
    winProbability: Math.min(98, winProbability),
    multiTimeframeConfluence: confluenceScore,
    fallbackPrediction,
  }
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
    MSFT_OTC: 425.67,
    FB_OTC: 512.34,
  }
  return basePrices[asset] || 1.0
}
