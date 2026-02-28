import { Star } from "lucide-react"

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div className="flex items-center gap-0.5" aria-label={`Note : ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < rating
              ? "fill-amber-500 text-amber-500"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}
