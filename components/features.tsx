import { Brain, Target, Zap, TrendingUp, BarChart3, Shield, Clock, Activity, Layers } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "GPT-4 Vision AI",
      description: "Real AI-powered chart analysis using OpenAI's latest vision model for accurate pattern recognition",
    },
    {
      icon: TrendingUp,
      title: "Multi-Timeframe Analysis",
      description: "Analyze trends across 15m, 1h, 4h, and daily timeframes for comprehensive market view",
    },
    {
      icon: BarChart3,
      title: "Advanced Technical Indicators",
      description: "RSI, MACD, Bollinger Bands, Moving Averages, and more calculated in real-time",
    },
    {
      icon: Target,
      title: "Precise Entry & Exit Points",
      description: "Get specific entry prices, stop loss, and multiple take profit targets with risk/reward ratios",
    },
    {
      icon: Activity,
      title: "Volume & Sentiment Analysis",
      description: "Track volume trends and market sentiment from extreme fear to extreme greed",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in risk/reward calculations and key support/resistance levels for safer trading",
    },
    {
      icon: Layers,
      title: "Pattern Recognition",
      description: "Identify candlestick patterns with confidence scores and bullish/bearish classifications",
    },
    {
      icon: Clock,
      title: "Instant Analysis",
      description: "Receive comprehensive professional-grade analysis in seconds, not hours",
    },
    {
      icon: Zap,
      title: "Multiple Markets",
      description: "Support for Binary Options, Forex, Crypto, and Stock markets with tailored analysis",
    },
  ]

  return (
    <section id="features" className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-4">Professional Trading Tools</h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Everything you need for professional chart analysis and trading decisions in one powerful platform
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
