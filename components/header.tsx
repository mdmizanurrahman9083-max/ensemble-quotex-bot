"use client"

import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Trade Sniper AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm hover:text-primary transition-colors">
            Features
          </a>
          <a href="#reviews" className="text-sm hover:text-primary transition-colors">
            Reviews
          </a>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  )
}
