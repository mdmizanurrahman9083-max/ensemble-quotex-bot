"use client"

import type React from "react"

import { useState } from "react"
import {
  Upload,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Shield,
  DollarSign,
  BarChart3,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

type TradingType = "Binary Options" | "Forex" | "Crypto" | "Stocks"
type Timeframe = "15m" | "1h" | "4h" | "1d"

interface AnalysisResult {
  trend: {
    direction: "BULLISH" | "BEARISH" | "NEUTRAL"
    strength: number
    description: string
  }
  technicalIndicators: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number
    }
    bollingerBands: {
      upper: string
      middle: string
      lower: string
    }
    movingAverages: {
      sma20: string
      sma50: string
      ema12: string
      ema26: string
    }
  }
  supportLevels: string[]
  resistanceLevels: string[]
  patterns: Array<{
    name: string
    confidence: number
    type: "BULLISH" | "BEARISH" | "NEUTRAL"
  }>
  signal: {
    action: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL"
    confidence: number
    entryPrice: string
    stopLoss: string
    takeProfit: string[]
    riskRewardRatio: string
  }
  timeframeAnalysis: {
    m15: "BULLISH" | "BEARISH" | "NEUTRAL"
    h1: "BULLISH" | "BEARISH" | "NEUTRAL"
    h4: "BULLISH" | "BEARISH" | "NEUTRAL"
    d1: "BULLISH" | "BEARISH" | "NEUTRAL"
  }
  volumeAnalysis: {
    trend: "INCREASING" | "DECREASING" | "STABLE"
    strength: number
    description: string
  }
  marketSentiment: {
    score: number
    label: "EXTREME_FEAR" | "FEAR" | "NEUTRAL" | "GREED" | "EXTREME_GREED"
  }
  keyLevels: Array<{
    price: string
    type: "SUPPORT" | "RESISTANCE" | "PIVOT"
    strength: "WEAK" | "MODERATE" | "STRONG"
  }>
  recommendation: string
}

export function AdvancedChartAnalyzer() {
  const [tradingType, setTradingType] = useState<TradingType>("Crypto")
  const [timeframe, setTimeframe] = useState<Timeframe>("1h")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setAnalysis(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeChart = async () => {
    if (!imagePreview) return

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: imagePreview,
          tradingType,
          timeframe,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError("Failed to analyze chart. Please try again.")
      console.error("[v0] Analysis error:", err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getSignalColor = (action: string) => {
    if (action.includes("BUY")) return "text-emerald-500"
    if (action.includes("SELL")) return "text-red-500"
    return "text-muted-foreground"
  }

  const getSignalBgColor = (action: string) => {
    if (action.includes("BUY")) return "bg-emerald-500/10 border-emerald-500/20"
    if (action.includes("SELL")) return "bg-red-500/10 border-red-500/20"
    return "bg-muted"
  }

  const getTrendColor = (trend: string) => {
    if (trend === "BULLISH") return "text-emerald-500"
    if (trend === "BEARISH") return "text-red-500"
    return "text-muted-foreground"
  }

  const getSentimentColor = (label: string) => {
    if (label.includes("GREED")) return "text-emerald-500"
    if (label.includes("FEAR")) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-16">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Configuration</CardTitle>
            <CardDescription>Select your market and timeframe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Trading Type</Label>
              <RadioGroup value={tradingType} onValueChange={(v) => setTradingType(v as TradingType)}>
                <div className="grid grid-cols-2 gap-3">
                  {(["Binary Options", "Forex", "Crypto", "Stocks"] as TradingType[]).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-3 block">Timeframe</Label>
              <RadioGroup value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                <div className="grid grid-cols-4 gap-3">
                  {(["15m", "1h", "4h", "1d"] as Timeframe[]).map((tf) => (
                    <div key={tf} className="flex items-center space-x-2">
                      <RadioGroupItem value={tf} id={tf} />
                      <Label htmlFor={tf} className="cursor-pointer">
                        {tf}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Chart</CardTitle>
            <CardDescription>Upload a clear trading chart image</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or JPEG (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </CardContent>
        </Card>

        {imagePreview && (
          <Card>
            <CardHeader>
              <CardTitle>Chart Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Chart preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button className="w-full mt-4" onClick={analyzeChart} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Chart with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-6">
        {analyzing && (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis in Progress</CardTitle>
              <CardDescription>Processing chart with advanced algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Detecting patterns...</span>
                  <span className="text-muted-foreground">33%</span>
                </div>
                <Progress value={33} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calculating indicators...</span>
                  <span className="text-muted-foreground">66%</span>
                </div>
                <Progress value={66} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating signals...</span>
                  <span className="text-muted-foreground">99%</span>
                </div>
                <Progress value={99} />
              </div>
            </CardContent>
          </Card>
        )}

        {analysis && !analyzing && (
          <Tabs defaultValue="signal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="signal">Signal</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="signal" className="space-y-4">
              <Card className={getSignalBgColor(analysis.signal.action)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trading Signal</span>
                    <Badge variant="secondary" className="text-base">
                      {analysis.signal.confidence}% Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center gap-4 mb-6 ${getSignalColor(analysis.signal.action)}`}>
                    {analysis.signal.action.includes("BUY") ? (
                      <TrendingUp className="h-12 w-12" />
                    ) : (
                      <TrendingDown className="h-12 w-12" />
                    )}
                    <span className="text-5xl font-bold">{analysis.signal.action.replace("_", " ")}</span>
                  </div>
                  <Progress value={analysis.signal.confidence} className="h-3 mb-6" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Entry Price
                      </div>
                      <div className="text-2xl font-bold">{analysis.signal.entryPrice}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Stop Loss
                      </div>
                      <div className="text-2xl font-bold text-red-500">{analysis.signal.stopLoss}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Take Profit Targets
                    </div>
                    <div className="flex gap-2">
                      {analysis.signal.takeProfit.map((tp, i) => (
                        <Badge key={i} variant="outline" className="text-emerald-500 border-emerald-500">
                          TP{i + 1}: {tp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Risk/Reward Ratio</div>
                    <div className="text-xl font-bold">{analysis.signal.riskRewardRatio}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-2xl font-bold ${getTrendColor(analysis.trend.direction)}`}>
                      {analysis.trend.direction}
                    </span>
                    <Badge variant="secondary">{analysis.trend.strength}% Strength</Badge>
                  </div>
                  <Progress value={analysis.trend.strength} className="mb-4" />
                  <p className="text-sm text-muted-foreground">{analysis.trend.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{analysis.recommendation}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">RSI (Relative Strength Index)</span>
                      <span className="text-sm font-bold">{analysis.technicalIndicators.rsi.toFixed(2)}</span>
                    </div>
                    <Progress value={analysis.technicalIndicators.rsi} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Oversold (30)</span>
                      <span>Overbought (70)</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-3">MACD</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Value</div>
                        <div className="font-bold">{analysis.technicalIndicators.macd.value.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Signal</div>
                        <div className="font-bold">{analysis.technicalIndicators.macd.signal.toFixed(2)}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Histogram</div>
                        <div className="font-bold">{analysis.technicalIndicators.macd.histogram.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-3">Bollinger Bands</div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-muted-foreground">Upper</span>
                        <span className="font-mono font-bold">{analysis.technicalIndicators.bollingerBands.upper}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-muted-foreground">Middle</span>
                        <span className="font-mono font-bold">
                          {analysis.technicalIndicators.bollingerBands.middle}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm text-muted-foreground">Lower</span>
                        <span className="font-mono font-bold">{analysis.technicalIndicators.bollingerBands.lower}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-3">Moving Averages</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">SMA 20</div>
                        <div className="font-mono font-bold">{analysis.technicalIndicators.movingAverages.sma20}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">SMA 50</div>
                        <div className="font-mono font-bold">{analysis.technicalIndicators.movingAverages.sma50}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">EMA 12</div>
                        <div className="font-mono font-bold">{analysis.technicalIndicators.movingAverages.ema12}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">EMA 26</div>
                        <div className="font-mono font-bold">{analysis.technicalIndicators.movingAverages.ema26}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pattern Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.patterns.map((pattern, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={pattern.type === "BULLISH" ? "default" : "destructive"}
                            className={
                              pattern.type === "BULLISH"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }
                          >
                            {pattern.type}
                          </Badge>
                          <span className="font-medium">{pattern.name}</span>
                        </div>
                        <span className="text-sm font-bold">{pattern.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="levels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Support Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.supportLevels.map((level, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg">
                        <span className="text-sm text-muted-foreground">Support {i + 1}</span>
                        <span className="font-mono font-bold text-emerald-500">{level}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resistance Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.resistanceLevels.map((level, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg">
                        <span className="text-sm text-muted-foreground">Resistance {i + 1}</span>
                        <span className="font-mono font-bold text-red-500">{level}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Price Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.keyLevels.map((level, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{level.type}</Badge>
                          <span className="font-mono font-bold">{level.price}</span>
                        </div>
                        <Badge
                          variant={
                            level.strength === "STRONG"
                              ? "default"
                              : level.strength === "MODERATE"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {level.strength}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Timeframe Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysis.timeframeAnalysis).map(([tf, trend]) => (
                      <div key={tf} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{tf.toUpperCase()}</span>
                        </div>
                        <span className={`text-lg font-bold ${getTrendColor(trend)}`}>{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{analysis.volumeAnalysis.trend}</span>
                    </div>
                    <Badge variant="secondary">{analysis.volumeAnalysis.strength}% Strength</Badge>
                  </div>
                  <Progress value={analysis.volumeAnalysis.strength} className="mb-4" />
                  <p className="text-sm text-muted-foreground">{analysis.volumeAnalysis.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-2xl font-bold ${getSentimentColor(analysis.marketSentiment.label)}`}>
                      {analysis.marketSentiment.label.replace(/_/g, " ")}
                    </span>
                    <Badge variant="secondary">{analysis.marketSentiment.score}/100</Badge>
                  </div>
                  <Progress value={analysis.marketSentiment.score} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Extreme Fear</span>
                    <span>Neutral</span>
                    <span>Extreme Greed</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {analysis && (
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              setImagePreview(null)
              setAnalysis(null)
            }}
          >
            New Analysis
          </Button>
        )}
      </div>
    </div>
  )
}
