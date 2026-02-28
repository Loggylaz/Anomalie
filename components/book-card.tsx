"use client"

import { useState } from "react"
import {
  Heart,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pencil,
  Trash2,
  Instagram,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import type { BookPost } from "@/lib/data"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

type BookCardProps = {
  post: BookPost
  onEdit?: (post: BookPost) => void
  onDelete?: (post: BookPost) => void
}

export function BookCard({ post, onEdit, onDelete }: BookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const images = post.coverImages.length > 0 ? post.coverImages : [post.coverImage]
  const [genreGroup, genreStyle = "Style"] = post.genre.split(" - ")

  function goToPreviousImage() {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  function goToNextImage() {
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md hover:border-primary/20">
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {post.instagramUrl && (
            <a
              href={post.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm transition-colors hover:bg-card"
              aria-label="Voir le post Instagram"
            >
              <Instagram className="size-4 text-foreground" />
            </a>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(post)}
              className="flex size-8 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm transition-colors hover:bg-card cursor-pointer"
              aria-label="Modifier la chronique"
            >
              <Pencil className="size-3.5 text-foreground" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(post)}
              className="flex size-8 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm transition-colors hover:bg-destructive/10 cursor-pointer"
              aria-label="Supprimer la chronique"
            >
              <Trash2 className="size-3.5 text-destructive" />
            </button>
          )}
        </div>
      )}

      <div className="relative flex items-center justify-center overflow-hidden bg-muted">
        <img
          src={images[imageIndex]}
          alt={`Couverture de ${post.title} par ${post.author}`}
          className="h-auto max-h-[440px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          crossOrigin="anonymous"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPreviousImage}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-1.5 backdrop-blur-sm hover:bg-card"
              aria-label="Image precedente"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goToNextImage}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-1.5 backdrop-blur-sm hover:bg-card"
              aria-label="Image suivante"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-card/90 px-2 py-0.5 text-xs text-foreground backdrop-blur-sm">
              {imageIndex + 1}/{images.length}
            </div>
          </>
        )}

        <div className="absolute left-3 top-3">
          <div className="flex items-center gap-1.5 rounded-full bg-card/90 p-1 backdrop-blur-sm">
            <Badge className="border-0 bg-foreground/10 text-[10px] text-foreground shadow-none">
              {genreGroup}
            </Badge>
            <Badge className="border-0 bg-primary/90 text-[10px] text-primary-foreground shadow-none">
              {genreStyle}
            </Badge>
          </div>
        </div>

        {post.isFavorite && (
          <div className="absolute left-3 bottom-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm">
              <Heart className="size-4 fill-red-500 text-red-500" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <StarRating rating={post.rating} />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
          </div>
          <h2 className="font-serif text-lg font-bold leading-snug text-balance text-foreground">
            {post.title}
          </h2>
          <p className="text-sm text-muted-foreground">{post.author}</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">{post.excerpt}</p>

        {isExpanded && post.review && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-foreground/75">
              {post.review}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {post.instagramUrl && (
            <a
              href={post.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="size-3" />
              Instagram
            </a>
          )}
        </div>

        {post.review && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-auto flex items-center gap-1.5 self-start pt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
          >
            {isExpanded ? (
              <>
                Moins <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Lire la chronique <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
