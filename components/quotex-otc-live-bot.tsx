"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart3,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Users,
  Radio,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Snowflake,
} from "lucide-react"
import useSWR from "swr"

type Signal = "CALL" | "PUT" | "NEUTRAL"
type MarketDirection = "BULLISH" | "BEARISH" | "SIDEWAYS"
type CandleDirection = "UP" | "DOWN" | "NEUTRAL"
type CandleSize = "SMALL" | "MEDIUM" | "LARGE" | "VERY_LARGE"

interface OTCAsset {
  id: string
  name: string
  price: number
  change: number
  changePercent: number
  isOTC: boolean
  category: string
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
    stochastic: { k: number; d: number }
    atr: number
  }
  prediction: string
  winProbability: number
  timestamp: number
  nextCandleDirection: CandleDirection
  nextCandleProbability: number
  marketDirection: MarketDirection
  marketStrength: number
  momentum: number
  nextCandleSize: CandleSize
  nextCandleSizePips: number
  nextCandleRange: { low: number; high: number }
  volatility: number
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: string
  signal?: Signal
  asset?: string
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

// OTC Assets available 24/7
const OTC_ASSETS = [
  { id: "EURUSD_OTC", name: "EUR/USD (OTC)", category: "Major Forex OTC" },
  { id: "GBPUSD_OTC", name: "GBP/USD (OTC)", category: "Major Forex OTC" },
  { id: "USDJPY_OTC", name: "USD/JPY (OTC)", category: "Major Forex OTC" },
  { id: "AUDUSD_OTC", name: "AUD/USD (OTC)", category: "Major Forex OTC" },
  { id: "USDCAD_OTC", name: "USD/CAD (OTC)", category: "Major Forex OTC" },
  { id: "NZDUSD_OTC", name: "NZD/USD (OTC)", category: "Major Forex OTC" },
  { id: "EURGBP_OTC", name: "EUR/GBP (OTC)", category: "Major Forex OTC" },
  { id: "EURJPY_OTC", name: "EUR/JPY (OTC)", category: "Major Forex OTC" },
  { id: "USDARS_OTC", name: "USD/ARS (OTC)", category: "Emerging Markets OTC" },
  { id: "USDBDT_OTC", name: "USD/BDT (OTC)", category: "Emerging Markets OTC" },
  { id: "USDIDR_OTC", name: "USD/IDR (OTC)", category: "Emerging Markets OTC" },
  { id: "USDCOP_OTC", name: "USD/COP (OTC)", category: "Emerging Markets OTC" },
  { id: "USDEGP_OTC", name: "USD/EGP (OTC)", category: "Emerging Markets OTC" },
  { id: "USDDZD_OTC", name: "USD/DZD (OTC)", category: "Emerging Markets OTC" },
  { id: "BRLUSD_OTC", name: "BRL/USD (OTC)", category: "Emerging Markets OTC" },
  { id: "USDPHP_OTC", name: "USD/PHP (OTC)", category: "Emerging Markets OTC" },
  { id: "USDNGN_OTC", name: "USD/NGN (OTC)", category: "Emerging Markets OTC" },
  { id: "USDPKR_OTC", name: "USD/PKR (OTC)", category: "Emerging Markets OTC" },
  { id: "USDTRY_OTC", name: "USD/TRY (OTC)", category: "Emerging Markets OTC" },
  { id: "USDMXN_OTC", name: "USD/MXN (OTC)", category: "Emerging Markets OTC" },
  { id: "MSFT_OTC", name: "Microsoft (OTC)", category: "Stocks OTC" },
  { id: "FB_OTC", name: "Meta/Facebook (OTC)", category: "Stocks OTC" },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function QuotexOTCLiveBot() {
  const [selectedAsset, setSelectedAsset] = useState("EURUSD_OTC")
  const [tradeAmount, setTradeAmount] = useState("10")
  const [autoTrade, setAutoTrade] = useState(false)
  const [minConfidence, setMinConfidence] = useState("75")
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username, setUsername] = useState(`Trader${Math.floor(Math.random() * 10000)}`)
  const [onlineUsers, setOnlineUsers] = useState(127)
  const [notifications, setNotifications] = useState(true)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [monitoredAssets, setMonitoredAssets] = useState<string[]>(["EURUSD_OTC", "GBPUSD_OTC", "USDJPY_OTC"])
  const [assetSignals, setAssetSignals] = useState<Map<string, SignalData>>(new Map())
  const [currentRound, setCurrentRound] = useState(0)
  const [roundStartTime, setRoundStartTime] = useState<Date | null>(null)
  const [nextRoundTime, setNextRoundTime] = useState<Date | null>(null)
  const [serverTimeDiff, setServerTimeDiff] = useState(0)
  const previousSignalRef = useRef<Signal | null>(null)

  const { data: priceData, mutate } = useSWR(
    isConnected ? `/api/quotex/otc/price?asset=${selectedAsset}` : null,
    fetcher,
    {
      refreshInterval: 100,
    },
  )

  const handleConnect = async () => {
    setIsConnected(true)
    await syncWithQuotexTime()
    addSystemMessage("Connected to Quotex OTC markets - Trading 24/7")
    addSystemMessage(`Synced with Quotex Round #${currentRound}`)
    startAnalysis()
    startMultiAssetMonitoring()
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsAnalyzing(false)
    setCurrentSignal(null)
    addSystemMessage("Disconnected from Quotex OTC markets")
  }

  const playSignalAudio = (signal: Signal) => {
    if (signal === "NEUTRAL") return
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(signal === "CALL" ? "BUY" : "SELL")
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    analyzeMarket()
  }

  const analyzeMarket = async () => {
    try {
      setCurrentSignal(null)

      const response = await fetch("/api/quotex/otc/analyze", {
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

      if (signal.signal !== previousSignalRef.current && signal.signal !== "NEUTRAL") {
        playSignalAudio(signal.signal)
        previousSignalRef.current = signal.signal
      }

      if (signal.signal !== "NEUTRAL" && signal.confidence >= 70) {
        broadcastSignalToChat(signal)
      }

      if (autoTrade && signal.confidence >= Number.parseInt(minConfidence) && signal.signal !== "NEUTRAL") {
        executeTrade(signal)
      }
    } catch (error) {
      console.error("Error analyzing market:", error)
    }
  }

  const startMultiAssetMonitoring = () => {
    monitoredAssets.forEach((asset) => {
      analyzeAsset(asset)
    })
  }

  const analyzeAsset = async (asset: string) => {
    try {
      const response = await fetch("/api/quotex/otc/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          timeframe: "1m",
        }),
      })

      const signal: SignalData = await response.json()
      setAssetSignals((prev) => new Map(prev).set(asset, signal))
    } catch (error) {
      console.error(`Error analyzing ${asset}:`, error)
    }
  }

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
    addChatMessage(
      `Executed ${signal.signal} trade on ${signal.asset} @ $${signal.entryPrice.toFixed(5)}`,
      signal.signal,
      signal.asset,
    )

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

      if (notifications) {
        addChatMessage(
          `Trade ${isWin ? "WON" : "LOST"}: ${signal.asset} ${signal.signal} - ${isWin ? "+" : ""}$${profit.toFixed(2)}`,
          isWin ? "CALL" : "PUT",
        )
      }
    }, 60000)
  }

  const addSystemMessage = (message: string) => {
    const systemMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "System",
      message,
      timestamp: new Date().toLocaleTimeString(),
    }
    setChatMessages((prev) => [...prev, systemMsg])
  }

  const addChatMessage = (message: string, signal?: Signal, asset?: string) => {
    const chatMsg: ChatMessage = {
      id: Date.now().toString(),
      user: username,
      message,
      timestamp: new Date().toLocaleTimeString(),
      signal,
      asset,
    }
    setChatMessages((prev) => [...prev, chatMsg])
  }

  const broadcastSignalToChat = (signal: SignalData) => {
    const signalMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "Signal Bot",
      message: `${signal.signal} signal detected on ${signal.asset} with ${signal.confidence}% confidence`,
      timestamp: new Date().toLocaleTimeString(),
      signal: signal.signal,
      asset: signal.asset,
    }
    setChatMessages((prev) => [...prev, signalMsg])
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addChatMessage(newMessage)
      setNewMessage("")
    }
  }

  useEffect(() => {
    if (isAnalyzing && isConnected) {
      const timer = setInterval(() => {
        const secondsLeft = getSecondsUntilNextRound()
        setCountdown(secondsLeft)

        if (secondsLeft === 56 || secondsLeft === 0) {
          analyzeMarket()
          startMultiAssetMonitoring()
          syncWithQuotexTime()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isAnalyzing, isConnected, nextRoundTime])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10) - 5)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  useEffect(() => {
    if (isConnected) {
      syncWithQuotexTime()
      const syncInterval = setInterval(syncWithQuotexTime, 30000)
      return () => clearInterval(syncInterval)
    }
  }, [isConnected])

  const syncWithQuotexTime = async () => {
    try {
      const response = await fetch("/api/quotex/otc/sync")
      const data = await response.json()
      setServerTimeDiff(data.serverTime - Date.now())
      setCurrentRound(data.roundNumber)
      setRoundStartTime(new Date(data.roundStartTime))
      setNextRoundTime(new Date(data.nextRoundTime))
    } catch (error) {
      console.error("Error syncing with Quotex time:", error)
    }
  }

  const getQuotexTime = () => {
    return new Date(Date.now() + serverTimeDiff)
  }

  const getSecondsUntilNextRound = () => {
    if (!nextRoundTime) return 60
    const now = getQuotexTime()
    const diff = Math.floor((nextRoundTime.getTime() - now.getTime()) / 1000)
    return Math.max(0, diff)
  }

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

  const getMarketDirectionIcon = (direction: MarketDirection) => {
    switch (direction) {
      case "BULLISH":
        return <TrendingUp className="w-8 h-8 text-green-500" />
      case "BEARISH":
        return <TrendingDown className="w-8 h-8 text-red-500" />
      case "SIDEWAYS":
        return <Minus className="w-8 h-8 text-yellow-500" />
    }
  }

  const getMarketDirectionColor = (direction: MarketDirection) => {
    switch (direction) {
      case "BULLISH":
        return "text-green-500"
      case "BEARISH":
        return "text-red-500"
      case "SIDEWAYS":
        return "text-yellow-500"
    }
  }

  const getCandleDirectionIcon = (direction: CandleDirection) => {
    switch (direction) {
      case "UP":
        return <ArrowUp className="w-12 h-12 text-green-500" strokeWidth={4} />
      case "DOWN":
        return <ArrowDown className="w-12 h-12 text-red-500" strokeWidth={4} />
      case "NEUTRAL":
        return <Minus className="w-12 h-12 text-yellow-500" strokeWidth={4} />
    }
  }

  const getCandleSizeDisplay = (size: CandleSize) => {
    switch (size) {
      case "VERY_LARGE":
        return { text: "Very Large", color: "text-purple-500", bars: 4 }
      case "LARGE":
        return { text: "Large", color: "text-orange-500", bars: 3 }
      case "MEDIUM":
        return { text: "Medium", color: "text-yellow-500", bars: 2 }
      case "SMALL":
        return { text: "Small", color: "text-blue-500", bars: 1 }
    }
  }

  const renderCandleSizeBars = (bars: number, color: string) => {
    return (
      <div className="flex items-end gap-1 h-16">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3 rounded-t transition-all ${i < bars ? color.replace("text-", "bg-") : "bg-muted"}`}
            style={{ height: `${((i + 1) / 4) * 100}%` }}
          />
        ))}
      </div>
    )
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
                  <Radio className="w-6 h-6 text-primary" />
                  {isConnected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">Quotex OTC Markets</p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? `Live - Round #${currentRound}` : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Round #{currentRound}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="w-3 h-3" />
                      {onlineUsers} online
                    </Badge>
                  </>
                )}
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
            </div>

            {isConnected && (
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Select OTC Asset</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Major Forex OTC</div>
                      {OTC_ASSETS.filter((a) => a.category === "Major Forex OTC").map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                        Emerging Markets OTC
                      </div>
                      {OTC_ASSETS.filter((a) => a.category === "Emerging Markets OTC").map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Stocks OTC</div>
                      {OTC_ASSETS.filter((a) => a.category === "Stocks OTC").map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
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

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-xs text-muted-foreground">Trade result alerts</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Multi-Asset Monitor */}
        {isConnected && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Multi-Asset Monitor
              </h3>
              <Button variant="outline" size="sm" onClick={startMultiAssetMonitoring}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {monitoredAssets.map((assetId) => {
                const asset = OTC_ASSETS.find((a) => a.id === assetId)
                const signal = assetSignals.get(assetId)
                return (
                  <div
                    key={assetId}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                      signal ? getSignalBgColor(signal.signal) : "bg-secondary"
                    }`}
                    onClick={() => setSelectedAsset(assetId)}
                  >
                    <p className="font-semibold text-sm mb-2">{asset?.name}</p>
                    {signal && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-lg font-bold ${getSignalColor(signal.signal)}`}>{signal.signal}</span>
                          <span className="text-sm font-semibold">{signal.confidence}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">${signal.entryPrice.toFixed(5)}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Next:</span>
                          {signal.nextCandleDirection === "UP" && <ArrowUp className="w-3 h-3 text-green-500" />}
                          {signal.nextCandleDirection === "DOWN" && <ArrowDown className="w-3 h-3 text-red-500" />}
                          {signal.nextCandleDirection === "NEUTRAL" && <Minus className="w-3 h-3 text-yellow-500" />}
                          <span className="text-xs font-medium">{signal.nextCandleProbability.toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Live Price Display */}
        {isConnected && priceData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{OTC_ASSETS.find((a) => a.id === selectedAsset)?.name}</h3>
                <p className="text-sm text-muted-foreground">Real-time OTC price - Available 24/7</p>
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

        {isConnected && currentSignal && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getMarketDirectionIcon(currentSignal.marketDirection)}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Direction</p>
                  <p className={`text-3xl font-black ${getMarketDirectionColor(currentSignal.marketDirection)}`}>
                    {currentSignal.marketDirection}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Strength: {currentSignal.marketStrength.toFixed(0)}% | Momentum: {currentSignal.momentum.toFixed(0)}
                    %
                  </p>
                </div>
              </div>
              <div className="text-right">
                {currentSignal.marketStrength > 70 ? (
                  <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
                ) : currentSignal.marketStrength < 30 ? (
                  <Snowflake className="w-12 h-12 text-blue-500" />
                ) : (
                  <Activity className="w-12 h-12 text-yellow-500" />
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {currentSignal.marketStrength > 70
                    ? "Hot Market"
                    : currentSignal.marketStrength < 30
                      ? "Cold Market"
                      : "Normal"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isConnected && currentSignal && (
          <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold">Next Candle Prediction</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Direction Prediction */}
                <div className="flex flex-col items-center p-6 bg-background/50 rounded-xl border">
                  <p className="text-sm text-muted-foreground mb-4">Direction</p>
                  {getCandleDirectionIcon(currentSignal.nextCandleDirection)}
                  <p
                    className={`text-4xl font-black mt-4 ${
                      currentSignal.nextCandleDirection === "UP"
                        ? "text-green-500"
                        : currentSignal.nextCandleDirection === "DOWN"
                          ? "text-red-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {currentSignal.nextCandleDirection}
                  </p>
                  <p className="text-3xl font-bold text-purple-500 mt-2">
                    {currentSignal.nextCandleProbability.toFixed(0)}%
                  </p>
                </div>

                {/* Size Prediction */}
                <div className="flex flex-col items-center p-6 bg-background/50 rounded-xl border">
                  <p className="text-sm text-muted-foreground mb-4">Candle Size</p>
                  {renderCandleSizeBars(
                    getCandleSizeDisplay(currentSignal.nextCandleSize).bars,
                    getCandleSizeDisplay(currentSignal.nextCandleSize).color,
                  )}
                  <p className={`text-4xl font-black mt-4 ${getCandleSizeDisplay(currentSignal.nextCandleSize).color}`}>
                    {getCandleSizeDisplay(currentSignal.nextCandleSize).text.toUpperCase()}
                  </p>
                  <p className="text-2xl font-bold text-purple-500 mt-2">
                    {currentSignal.nextCandleSizePips.toFixed(1)} pips
                  </p>
                </div>
              </div>

              {/* Candle Range Prediction */}
              <div className="p-6 bg-background/50 rounded-xl border">
                <p className="text-sm text-muted-foreground text-center mb-4">Predicted Price Range</p>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Low</p>
                    <p className="text-2xl font-bold text-red-500">{currentSignal.nextCandleRange.low.toFixed(5)}</p>
                  </div>
                  <ArrowUp className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">High</p>
                    <p className="text-2xl font-bold text-green-500">{currentSignal.nextCandleRange.high.toFixed(5)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <p className="text-sm text-muted-foreground">
                    Volatility:{" "}
                    <span className="font-semibold text-purple-500">{currentSignal.volatility.toFixed(0)}%</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-sm text-muted-foreground text-center">
                  AI predicts the next 1-minute candle will close {currentSignal.nextCandleDirection.toLowerCase()} with
                  a {getCandleSizeDisplay(currentSignal.nextCandleSize).text.toLowerCase()} body size of approximately{" "}
                  {currentSignal.nextCandleSizePips.toFixed(1)} pips
                </p>
              </div>
            </div>
          </Card>
        )}

        {isAnalyzing && !currentSignal && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
              <p className="text-lg font-medium">Analyzing OTC Market Data...</p>
              <p className="text-sm text-muted-foreground">Calculating optimal entry points for 1-minute trades</p>
            </div>
          </Card>
        )}

        {currentSignal && currentSignal.signal !== "NEUTRAL" && (
          <Card
            className={`p-8 border-4 ${currentSignal.signal === "CALL" ? "border-green-500 bg-green-500/5" : "border-red-500 bg-red-500/5"} animate-pulse`}
          >
            <div className="flex items-center justify-center gap-6">
              <div className={`${currentSignal.signal === "CALL" ? "text-green-500" : "text-red-500"}`}>
                {currentSignal.signal === "CALL" ? (
                  <ArrowUp className="w-24 h-24 animate-bounce" strokeWidth={3} />
                ) : (
                  <ArrowDown className="w-24 h-24 animate-bounce" strokeWidth={3} />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">TRADE DIRECTION</p>
                <h1
                  className={`text-7xl font-black mb-2 ${currentSignal.signal === "CALL" ? "text-green-500" : "text-red-500"}`}
                >
                  {currentSignal.signal === "CALL" ? "BUY" : "SELL"}
                </h1>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {currentSignal.confidence}% Confidence
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {countdown}s
                  </Badge>
                </div>
              </div>
              <div className={`${currentSignal.signal === "CALL" ? "text-green-500" : "text-red-500"}`}>
                {currentSignal.signal === "CALL" ? (
                  <ArrowUp className="w-24 h-24 animate-bounce" strokeWidth={3} />
                ) : (
                  <ArrowDown className="w-24 h-24 animate-bounce" strokeWidth={3} />
                )}
              </div>
            </div>
          </Card>
        )}

        {currentSignal && (
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Live Quotex API Connected
                </Badge>
                <Badge variant="outline">Round #{currentRound}</Badge>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-primary mb-1">AI Market Prediction</p>
                    <p className="text-sm text-muted-foreground">{currentSignal.prediction}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 p-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border-2 border-primary/30">
                <Clock className="w-12 h-12 text-primary animate-pulse" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Next Round In</p>
                  <p className="text-6xl font-black text-primary tabular-nums">{countdown}s</p>
                  <p className="text-xs text-muted-foreground mt-2">Synced with Quotex Server</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Live Chat Sidebar */}
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Balance</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
            <div
              className={`p-3 rounded-lg ${sessionStats.profit >= 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
            >
              <p className="text-sm text-muted-foreground">Session P&L</p>
              <p className={`text-2xl font-bold ${sessionStats.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {sessionStats.profit >= 0 ? "+" : ""}${sessionStats.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

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

        {/* Live Chat Component */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Live Chat
            </h3>
            <Badge variant="outline">{onlineUsers} online</Badge>
          </div>

          <div ref={chatScrollRef} className="h-[400px] overflow-y-auto space-y-3 mb-4 p-3 bg-secondary/30 rounded-lg">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.user === "System"
                    ? "bg-primary/10 border border-primary/20"
                    : msg.user === "Signal Bot"
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-secondary"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm">{msg.user}</span>
                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-sm">{msg.message}</p>
                {msg.signal && msg.asset && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={msg.signal === "CALL" ? "default" : "destructive"} className="text-xs">
                      {msg.signal}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{msg.asset}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <Button onClick={handleSendMessage} disabled={!isConnected || !newMessage.trim()}>
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
