import { NextResponse } from "next/server"

export async function GET() {
  // Simulate Quotex server time synchronization
  const serverTime = Date.now()

  // Calculate current round number (rounds start every minute on the minute)
  const currentMinute = Math.floor(serverTime / 60000)
  const roundNumber = currentMinute % 10000 // Keep round numbers manageable

  // Calculate round start and next round times
  const roundStartTime = currentMinute * 60000
  const nextRoundTime = (currentMinute + 1) * 60000

  // Calculate seconds until next round
  const secondsUntilNextRound = Math.floor((nextRoundTime - serverTime) / 1000)

  return NextResponse.json({
    serverTime,
    roundNumber,
    roundStartTime,
    nextRoundTime,
    secondsUntilNextRound,
    timezone: "UTC",
    status: "synchronized",
  })
}
