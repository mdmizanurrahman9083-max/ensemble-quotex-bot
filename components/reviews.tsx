"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Reviews() {
  const reviews = [
    {
      name: "Alex Johnson",
      rating: 5,
      comment: "Incredible accuracy! This AI has transformed my trading strategy.",
      initials: "AJ",
    },
    {
      name: "Sarah Chen",
      rating: 5,
      comment: "The analysis is detailed and easy to understand. Highly recommend!",
      initials: "SC",
    },
    {
      name: "Mike Rodriguez",
      rating: 4,
      comment: "Great tool for both beginners and experienced traders.",
      initials: "MR",
    },
  ]

  return (
    <section id="reviews" className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{review.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
