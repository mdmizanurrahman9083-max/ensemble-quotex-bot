"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Upload, TrendingUp, TrendingDown, Minus, Clock, Activity, Target, AlertTriangle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

type Signal = "BUY" | "SELL" | "NEUTRAL"

interface SignalData {
  signal: Signal
  confidence: number
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskReward: string
  momentum: string
  volatility: string
  trend: string
  timeRemaining: number
}

export function OneMinuteSignalBot() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [signalData, setSignalData] = useState<SignalData | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [signalHistory, setSignalHistory] = useState<Array<{ time: string; signal: Signal; confidence: number }>>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        analyzeChart(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    multiple: false,
  })

  const analyzeChart = async (imageData: string) => {
    setIsAnalyzing(true)
    setSignalData(null)

    try {
      const response = await fetch("/api/analyze-1min", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await response.json()
      setSignalData(data)

      // Add to signal history
      const newSignal = {
        time: new Date().toLocaleTimeString(),
        signal: data.signal,
        confidence: data.confidence,
      }
      setSignalHistory((prev) => [newSignal, ...prev].slice(0, 10))

      // Reset countdown
      setCountdown(60)
    } catch (error) {
      console.error("[v0] Error analyzing chart:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (signalData && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Auto re-analyze when countdown reaches 0
            if (uploadedImage) {
              analyzeChart(uploadedImage)
            }
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [signalData, countdown, uploadedImage])

  const getSignalColor = (signal: Signal) => {
    switch (signal) {
      case "BUY":
        return "text-green-500"
      case "SELL":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getSignalIcon = (signal: Signal) => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="w-12 h-12" />
      case "SELL":
        return <TrendingDown className="w-12 h-12" />
      default:
        return <Minus className="w-12 h-12" />
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Signal Display */}
      <div className="lg:col-span-2 space-y-6">
        {/* Upload Area */}
        <Card className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Upload 1-Minute Chart</p>
            <p className="text-sm text-muted-foreground">Drag and drop your chart image or click to browse</p>
          </div>

          {uploadedImage && (
            <div className="mt-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image src={uploadedImage || "/placeholder.svg"} alt="Uploaded chart" fill className="object-contain" />
              </div>
            </div>
          )}
        </Card>

        {/* Signal Display */}
        {isAnalyzing && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
              <p className="text-lg font-medium">Analyzing 1-Minute Chart...</p>
              <p className="text-sm text-muted-foreground">Calculating real-time signals</p>
            </div>
          </Card>
        )}

        {signalData && !isAnalyzing && (
          <Card className="p-8">
            <div className="space-y-6">
              {/* Main Signal */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className={`${getSignalColor(signalData.signal)}`}>{getSignalIcon(signalData.signal)}</div>
                </div>
                <h2 className={`text-5xl font-bold mb-2 ${getSignalColor(signalData.signal)}`}>{signalData.signal}</h2>
                <p className="text-2xl text-muted-foreground">Confidence: {signalData.confidence}%</p>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-3 p-4 bg-secondary rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Next Signal In</p>
                  <p className="text-3xl font-bold text-primary">{countdown}s</p>
                </div>
              </div>

              {/* Trading Levels */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <p className="text-sm font-medium text-green-500">Entry Price</p>
                  </div>
                  <p className="text-2xl font-bold">${signalData.entryPrice.toFixed(2)}</p>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-500">Stop Loss</p>
                  </div>
                  <p className="text-2xl font-bold">${signalData.stopLoss.toFixed(2)}</p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <p className="text-sm font-medium text-blue-500">Take Profit</p>
                  </div>
                  <p className="text-2xl font-bold">${signalData.takeProfit.toFixed(2)}</p>
                </div>
              </div>

              {/* Market Conditions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Momentum</p>
                  <p className="text-lg font-bold">{signalData.momentum}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Volatility</p>
                  <p className="text-lg font-bold">{signalData.volatility}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <p className="text-lg font-bold">{signalData.trend}</p>
                </div>
              </div>

              {/* Risk/Reward */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Risk/Reward Ratio</p>
                <p className="text-3xl font-bold text-primary">{signalData.riskReward}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Live Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Activity className="w-6 h-6 text-primary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="font-semibold">Live Analysis</p>
              <p className="text-sm text-muted-foreground">Real-time signals</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeframe:</span>
              <span className="font-medium">1 Minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Update Interval:</span>
              <span className="font-medium">60 seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Model:</span>
              <span className="font-medium">GPT-4 Vision</span>
            </div>
          </div>
        </Card>

        {/* Signal History */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Signal History</h3>
          <div className="space-y-3">
            {signalHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No signals yet. Upload a chart to start.</p>
            ) : (
              signalHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`${getSignalColor(item.signal)}`}>
                      {item.signal === "BUY" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : item.signal === "SELL" ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <Minus className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${getSignalColor(item.signal)}`}>{item.signal}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.confidence}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">1-Minute Trading Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Wait for high confidence signals (80%+)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Always use stop loss orders</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Trade during high volume periods</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Monitor multiple timeframes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Practice risk management</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
