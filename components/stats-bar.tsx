import { BookOpen, Heart, Star, Tags } from "lucide-react"
import type { BookPost } from "@/lib/data"

export function StatsBar({ posts }: { posts: BookPost[] }) {
  const totalBooks = posts.length
  const favorites = posts.filter((p) => p.isFavorite).length
  const avgRating =
    posts.length > 0
      ? (posts.reduce((acc, p) => acc + p.rating, 0) / posts.length).toFixed(1)
      : "0"
  const usedGenres = new Set(posts.map((p) => p.genre)).size

  const stats = [
    { icon: BookOpen, label: "Chroniques", value: totalBooks },
    { icon: Heart, label: "Coups de coeur", value: favorites },
    { icon: Star, label: "Note moyenne", value: avgRating },
    { icon: Tags, label: "Genres", value: usedGenres },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
            <stat.icon className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground leading-tight">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
