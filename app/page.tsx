import { OneMinuteSignalBot } from "@/components/one-minute-signal-bot"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen dark">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">1-Minute Signal Bot</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Real-time AI-powered trading signals for 1-minute charts with precise entry and exit points
          </p>
        </div>

        <OneMinuteSignalBot />
      </main>
    </div>
  )
}
