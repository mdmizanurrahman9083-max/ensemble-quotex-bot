import { generateObject } from "ai"
import { z } from "zod"

const analysisSchema = z.object({
  trend: z.object({
    direction: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    strength: z.number().min(0).max(100),
    description: z.string(),
  }),
  technicalIndicators: z.object({
    rsi: z.number().min(0).max(100),
    macd: z.object({
      value: z.number(),
      signal: z.number(),
      histogram: z.number(),
    }),
    bollingerBands: z.object({
      upper: z.string(),
      middle: z.string(),
      lower: z.string(),
    }),
    movingAverages: z.object({
      sma20: z.string(),
      sma50: z.string(),
      ema12: z.string(),
      ema26: z.string(),
    }),
  }),
  supportLevels: z.array(z.string()).min(3).max(5),
  resistanceLevels: z.array(z.string()).min(3).max(5),
  patterns: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(100),
      type: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    }),
  ),
  signal: z.object({
    action: z.enum(["STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"]),
    confidence: z.number().min(0).max(100),
    entryPrice: z.string(),
    stopLoss: z.string(),
    takeProfit: z.array(z.string()),
    riskRewardRatio: z.string(),
  }),
  timeframeAnalysis: z.object({
    m15: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    h1: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    h4: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
    d1: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  }),
  volumeAnalysis: z.object({
    trend: z.enum(["INCREASING", "DECREASING", "STABLE"]),
    strength: z.number().min(0).max(100),
    description: z.string(),
  }),
  marketSentiment: z.object({
    score: z.number().min(0).max(100),
    label: z.enum(["EXTREME_FEAR", "FEAR", "NEUTRAL", "GREED", "EXTREME_GREED"]),
  }),
  keyLevels: z.array(
    z.object({
      price: z.string(),
      type: z.enum(["SUPPORT", "RESISTANCE", "PIVOT"]),
      strength: z.enum(["WEAK", "MODERATE", "STRONG"]),
    }),
  ),
  recommendation: z.string(),
})

export async function POST(req: Request) {
  try {
    const { imageData, tradingType, timeframe } = await req.json()

    if (!imageData) {
      return Response.json({ error: "No image data provided" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: analysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert trading analyst with 20+ years of experience in ${tradingType} trading. Analyze this ${timeframe} trading chart image in extreme detail.

Provide a comprehensive technical analysis including:
1. Overall trend direction and strength
2. All major technical indicators (RSI, MACD, Bollinger Bands, Moving Averages)
3. Support and resistance levels with specific price points
4. Candlestick patterns with confidence scores
5. Multi-timeframe analysis (15m, 1h, 4h, 1d)
6. Volume analysis and trends
7. Market sentiment score
8. Key price levels with strength ratings
9. Specific trading signal with entry, stop loss, and take profit levels
10. Risk/reward ratio calculation
11. Detailed recommendation

Be specific with price levels and provide actionable insights. Consider the current market context and provide realistic analysis.`,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return Response.json({ error: "Failed to analyze chart" }, { status: 500 })
  }
}
