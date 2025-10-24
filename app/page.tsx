import { QuotexOTCLiveBot } from "@/components/quotex-otc-live-bot"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen dark">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Quotex OTC Live Signal Bot
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Real-time OTC market signals with live community chat - Trade 24/7 on OTC markets
          </p>
        </div>

        <QuotexOTCLiveBot />
      </main>
    </div>
  )
}
