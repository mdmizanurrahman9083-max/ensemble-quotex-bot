"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react"
import useSWR from "swr"

type Signal = "CALL" | "PUT" | "NEUTRAL"

interface QuotexAsset {
  id: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface SignalData {
  asset: string
  signal: Signal
  confidence: number
  entryPrice: number
  expiryTime: number
  indicators: {
    rsi: number
    ema: { fast: number; slow: number }
    macd: { value: number; signal: number; histogram: number }
    bollingerBands: { upper: number; middle: number; lower: number }
  }
  prediction: string
  winProbability: number
}

interface TradeResult {
  id: string
  asset: string
  signal: Signal
  entryPrice: number
  amount: number
  result: "WIN" | "LOSS" | "PENDING"
  profit: number
  time: string
}

const QUOTEX_ASSETS = [
  { id: "EURUSD", name: "EUR/USD", category: "Forex" },
  { id: "GBPUSD", name: "GBP/USD", category: "Forex" },
  { id: "USDJPY", name: "USD/JPY", category: "Forex" },
  { id: "AUDUSD", name: "AUD/USD", category: "Forex" },
  { id: "BTCUSD", name: "Bitcoin", category: "Crypto" },
  { id: "ETHUSD", name: "Ethereum", category: "Crypto" },
  { id: "XAUUSD", name: "Gold", category: "Commodities" },
  { id: "XAGUSD", name: "Silver", category: "Commodities" },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function QuotexPowerBot() {
  const [selectedAsset, setSelectedAsset] = useState("EURUSD")
  const [tradeAmount, setTradeAmount] = useState("10")
  const [autoTrade, setAutoTrade] = useState(false)
  const [minConfidence, setMinConfidence] = useState("80")
  const [isConnected, setIsConnected] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSignal, setCurrentSignal] = useState<SignalData | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [tradeHistory, setTradeHistory] = useState<TradeResult[]>([])
  const [balance, setBalance] = useState(10000)
  const [sessionStats, setSessionStats] = useState({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    winRate: 0,
  })

  // Real-time price data using SWR
  const { data: priceData, mutate } = useSWR(isConnected ? `/api/quotex/price?asset=${selectedAsset}` : null, fetcher, {
    refreshInterval: 1000,
  })

  // Connect to Quotex
  const handleConnect = async () => {
    setIsConnected(true)
    // Start real-time analysis
    startAnalysis()
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsAnalyzing(false)
    setCurrentSignal(null)
  }

  // Start automated signal analysis
  const startAnalysis = async () => {
    setIsAnalyzing(true)
    analyzeMarket()
  }

  const analyzeMarket = async () => {
    try {
      const response = await fetch("/api/quotex/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset: selectedAsset,
          timeframe: "1m",
        }),
      })

      const signal: SignalData = await response.json()
      setCurrentSignal(signal)
      setCountdown(60)

      // Auto-trade if enabled and confidence meets threshold
      if (autoTrade && signal.confidence >= Number.parseInt(minConfidence) && signal.signal !== "NEUTRAL") {
        executeTrade(signal)
      }
    } catch (error) {
      console.error("Error analyzing market:", error)
    }
  }

  // Execute trade
  const executeTrade = async (signal: SignalData) => {
    const amount = Number.parseFloat(tradeAmount)
    const newTrade: TradeResult = {
      id: Date.now().toString(),
      asset: signal.asset,
      signal: signal.signal,
      entryPrice: signal.entryPrice,
      amount,
      result: "PENDING",
      profit: 0,
      time: new Date().toLocaleTimeString(),
    }

    setTradeHistory((prev) => [newTrade, ...prev])

    // Simulate trade result after 60 seconds
    setTimeout(() => {
      const isWin = Math.random() * 100 < signal.winProbability
      const profit = isWin ? amount * 0.85 : -amount

      setTradeHistory((prev) =>
        prev.map((trade) => (trade.id === newTrade.id ? { ...trade, result: isWin ? "WIN" : "LOSS", profit } : trade)),
      )

      setBalance((prev) => prev + profit)
      setSessionStats((prev) => ({
        totalTrades: prev.totalTrades + 1,
        wins: prev.wins + (isWin ? 1 : 0),
        losses: prev.losses + (isWin ? 0 : 1),
        profit: prev.profit + profit,
        winRate: ((prev.wins + (isWin ? 1 : 0)) / (prev.totalTrades + 1)) * 100,
      }))
    }, 60000)
  }

  // Countdown timer and auto-refresh
  useEffect(() => {
    if (isAnalyzing && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            analyzeMarket()
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isAnalyzing, countdown, selectedAsset])

  const getSignalColor = (signal: Signal) => {
    switch (signal) {
      case "CALL":
        return "text-green-500"
      case "PUT":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getSignalBgColor = (signal: Signal) => {
    switch (signal) {
      case "CALL":
        return "bg-green-500/10 border-green-500/20"
      case "PUT":
        return "bg-red-500/10 border-red-500/20"
      default:
        return "bg-yellow-500/10 border-yellow-500/20"
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Trading Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Connection & Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-6 h-6 text-primary" />
                  {isConnected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">Quotex Connection</p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? "Connected to live market" : "Not connected"}
                  </p>
                </div>
              </div>
              {!isConnected ? (
                <Button onClick={handleConnect} className="gap-2">
                  <Play className="w-4 h-4" />
                  Connect
                </Button>
              ) : (
                <Button onClick={handleDisconnect} variant="destructive" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Disconnect
                </Button>
              )}
            </div>

            {isConnected && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Select Asset</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTEX_ASSETS.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trade Amount ($)</Label>
                  <Input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min Confidence (%)</Label>
                  <Input
                    type="number"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(e.target.value)}
                    min="50"
                    max="100"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Auto Trading</Label>
                    <p className="text-xs text-muted-foreground">Execute trades automatically</p>
                  </div>
                  <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Live Price Display */}
        {isConnected && priceData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{QUOTEX_ASSETS.find((a) => a.id === selectedAsset)?.name}</h3>
                <p className="text-sm text-muted-foreground">Real-time Quotex price</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => mutate()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-bold">${priceData.price.toFixed(5)}</p>
              <div className={`flex items-center gap-1 ${priceData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {priceData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-xl font-semibold">{priceData.changePercent.toFixed(2)}%</span>
              </div>
            </div>
          </Card>
        )}

        {/* Signal Display */}
        {isAnalyzing && !currentSignal && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
              <p className="text-lg font-medium">Analyzing Market Data...</p>
              <p className="text-sm text-muted-foreground">Calculating optimal entry points</p>
            </div>
          </Card>
        )}

        {currentSignal && (
          <Card className="p-8">
            <div className="space-y-6">
              {/* Main Signal */}
              <div className={`p-6 rounded-lg border ${getSignalBgColor(currentSignal.signal)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`${getSignalColor(currentSignal.signal)}`}>
                      {currentSignal.signal === "CALL" ? (
                        <TrendingUp className="w-12 h-12" />
                      ) : currentSignal.signal === "PUT" ? (
                        <TrendingDown className="w-12 h-12" />
                      ) : (
                        <Activity className="w-12 h-12" />
                      )}
                    </div>
                    <div>
                      <h2 className={`text-4xl font-bold ${getSignalColor(currentSignal.signal)}`}>
                        {currentSignal.signal}
                      </h2>
                      <p className="text-muted-foreground">1-Minute Expiry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{currentSignal.confidence}%</p>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Entry Price</p>
                    <p className="text-2xl font-bold">${currentSignal.entryPrice.toFixed(5)}</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Win Probability</p>
                    <p className="text-2xl font-bold text-green-500">{currentSignal.winProbability.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-3 p-6 bg-secondary rounded-lg">
                <Clock className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Next Signal In</p>
                  <p className="text-4xl font-bold text-primary">{countdown}s</p>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Technical Indicators
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">RSI (14)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{currentSignal.indicators.rsi.toFixed(2)}</p>
                      <span
                        className={`text-sm font-medium ${
                          currentSignal.indicators.rsi > 70
                            ? "text-red-500"
                            : currentSignal.indicators.rsi < 30
                              ? "text-green-500"
                              : "text-yellow-500"
                        }`}
                      >
                        {currentSignal.indicators.rsi > 70
                          ? "Overbought"
                          : currentSignal.indicators.rsi < 30
                            ? "Oversold"
                            : "Neutral"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">MACD</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Value:</span>
                        <span className="font-medium">{currentSignal.indicators.macd.value.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Signal:</span>
                        <span className="font-medium">{currentSignal.indicators.macd.signal.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Histogram:</span>
                        <span
                          className={`font-medium ${currentSignal.indicators.macd.histogram > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {currentSignal.indicators.macd.histogram.toFixed(5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">EMA</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Fast (9):</span>
                        <span className="font-medium">{currentSignal.indicators.ema.fast.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Slow (21):</span>
                        <span className="font-medium">{currentSignal.indicators.ema.slow.toFixed(5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Bollinger Bands</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Upper:</span>
                        <span className="font-medium">{currentSignal.indicators.bollingerBands.upper.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Middle:</span>
                        <span className="font-medium">{currentSignal.indicators.bollingerBands.middle.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Lower:</span>
                        <span className="font-medium">{currentSignal.indicators.bollingerBands.lower.toFixed(5)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-primary mb-1">AI Prediction</p>
                    <p className="text-sm text-muted-foreground">{currentSignal.prediction}</p>
                  </div>
                </div>
              </div>

              {/* Manual Trade Button */}
              {!autoTrade && currentSignal.signal !== "NEUTRAL" && (
                <Button onClick={() => executeTrade(currentSignal)} className="w-full gap-2" size="lg">
                  <Target className="w-5 h-5" />
                  Execute {currentSignal.signal} Trade (${tradeAmount})
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Account Balance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${sessionStats.profit >= 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
          >
            <p className="text-sm text-muted-foreground">Session P&L</p>
            <p className={`text-2xl font-bold ${sessionStats.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {sessionStats.profit >= 0 ? "+" : ""}${sessionStats.profit.toFixed(2)}
            </p>
          </div>
        </Card>

        {/* Session Statistics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Session Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Trades</span>
              <span className="font-semibold">{sessionStats.totalTrades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="font-semibold text-green-500">{sessionStats.wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Losses</span>
              <span className="font-semibold text-red-500">{sessionStats.losses}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="text-xl font-bold text-primary">{sessionStats.winRate.toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        {/* Trade History */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Trades</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tradeHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No trades yet</p>
            ) : (
              tradeHistory.map((trade) => (
                <div key={trade.id} className="p-3 bg-secondary rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {trade.signal === "CALL" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-semibold text-sm">{trade.asset}</span>
                    </div>
                    {trade.result === "WIN" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {trade.result === "LOSS" && <XCircle className="w-5 h-5 text-red-500" />}
                    {trade.result === "PENDING" && <Clock className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{trade.time}</span>
                    <span>${trade.amount}</span>
                  </div>
                  {trade.result !== "PENDING" && (
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Risk Warning */}
        <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-yellow-500">Risk Warning</p>
              <p className="text-xs text-muted-foreground">
                Trading binary options involves substantial risk. Only trade with money you can afford to lose. Past
                performance does not guarantee future results.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
