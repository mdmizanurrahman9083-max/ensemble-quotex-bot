"use client"

import type React from "react"

import { useState } from "react"
import { Upload, ImageIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type TradingType = "binary" | "forex" | "crypto"
type Signal = "BUY" | "SELL" | "NEUTRAL"

interface AnalysisResult {
  trend: string
  support: string[]
  resistance: string[]
  patterns: string[]
  signal: Signal
  confidence: number
}

export function ChartAnalyzer() {
  const [tradingType, setTradingType] = useState<TradingType>("binary")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeChart = async () => {
    if (!imagePreview) return

    setAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const signals: Signal[] = ["BUY", "SELL", "NEUTRAL"]
    const randomSignal = signals[Math.floor(Math.random() * signals.length)]

    setAnalysis({
      trend: "Bullish momentum detected with strong upward pressure",
      support: ["$42,150", "$41,800", "$41,200"],
      resistance: ["$43,500", "$44,200", "$45,000"],
      patterns: ["Ascending Triangle", "Higher Lows", "Volume Increase"],
      signal: randomSignal,
      confidence: Math.floor(Math.random() * 30) + 70,
    })

    setAnalyzing(false)
  }

  const getSignalColor = (signal: Signal) => {
    switch (signal) {
      case "BUY":
        return "text-accent"
      case "SELL":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getSignalIcon = (signal: Signal) => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="h-8 w-8" />
      case "SELL":
        return <TrendingDown className="h-8 w-8" />
      default:
        return <Minus className="h-8 w-8" />
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-16">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Trading Type</CardTitle>
            <CardDescription>Choose your trading market</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={tradingType} onValueChange={(v) => setTradingType(v as TradingType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="binary" id="binary" />
                <Label htmlFor="binary" className="cursor-pointer">
                  Binary Option
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="forex" id="forex" />
                <Label htmlFor="forex" className="cursor-pointer">
                  Forex
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto" className="cursor-pointer">
                  Crypto
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Your Chart</CardTitle>
            <CardDescription>Drag & drop or click to browse</CardDescription>
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
                {analyzing ? "Analyzing..." : "Analyze Chart"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {analyzing && (
          <Card>
            <CardHeader>
              <CardTitle>Analyzing Chart...</CardTitle>
              <CardDescription>AI is processing your chart</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={66} className="w-full" />
            </CardContent>
          </Card>
        )}

        {analysis && !analyzing && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Trading Signal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-3 ${getSignalColor(analysis.signal)}`}>
                    {getSignalIcon(analysis.signal)}
                    <span className="text-4xl font-bold">{analysis.signal}</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {analysis.confidence}% Confidence
                  </Badge>
                </div>
                <Progress value={analysis.confidence} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      1
                    </span>
                    Trend Detection
                  </h3>
                  <p className="text-sm text-muted-foreground pl-8">{analysis.trend}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      2
                    </span>
                    Support/Resistance Levels
                  </h3>
                  <div className="pl-8 space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Support Levels:</p>
                      <div className="flex gap-2">
                        {analysis.support.map((level, i) => (
                          <Badge key={i} variant="outline" className="text-accent border-accent">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Resistance Levels:</p>
                      <div className="flex gap-2">
                        {analysis.resistance.map((level, i) => (
                          <Badge key={i} variant="outline" className="text-destructive border-destructive">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      3
                    </span>
                    Candlestick Pattern Recognition
                  </h3>
                  <div className="pl-8 flex flex-wrap gap-2">
                    {analysis.patterns.map((pattern, i) => (
                      <Badge key={i} variant="secondary">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

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
          </>
        )}

        {!imagePreview && !analyzing && !analysis && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Upload a chart to get started with AI analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
