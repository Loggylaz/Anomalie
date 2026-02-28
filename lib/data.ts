export type Genre = string

export type OriginOption = {
  id: string
  slug: string
  name: string
}

export type GenreOption = {
  id: string
  slug: string
  name: string
}

export type BookPost = {
  id: string
  title: string
  author: string
  genre: Genre
  originId: string | null
  genreId: string | null
  origin: OriginOption | null
  genreMeta: GenreOption | null
  rating: number
  date: string
  excerpt: string
  review: string
  coverImage: string
  coverImages: string[]
  tags: string[]
  isFavorite: boolean
  instagramUrl?: string
}

export const fallbackOrigins: OriginOption[] = [
  { id: "fallback-belge", slug: "belge", name: "Belge" },
  { id: "fallback-francaise", slug: "francaise", name: "Francaise" },
  { id: "fallback-etrangere", slug: "etrangere", name: "Etrangere" },
]

export const fallbackGenres: GenreOption[] = [
  { id: "fallback-thriller", slug: "thriller", name: "Thriller" },
  { id: "fallback-cosy-mystery", slug: "cosy-mystery", name: "Cosy Mystery" },
  { id: "fallback-jeunesse", slug: "jeunesse", name: "Jeunesse" },
  { id: "fallback-bd", slug: "bd", name: "BD" },
  { id: "fallback-romance-noel", slug: "romance-noel", name: "Romance (Noel)" },
  { id: "fallback-feel-good", slug: "feel-good", name: "Feel Good" },
  { id: "fallback-young-adult", slug: "young-adult", name: "Young Adult" },
]

export function getLegacyOriginFromGenre(genre: string): string | null {
  const [prefix] = genre.split(" - ")
  if (!prefix || prefix === genre) return null
  const normalized = prefix.toLowerCase()
  if (normalized.includes("belge")) return "Belge"
  if (normalized.includes("franc")) return "Francaise"
  if (normalized.includes("etrang")) return "Etrangere"
  return prefix
}

export function getLegacyGenreLabel(genre: string): string {
  const parts = genre.split(" - ")
  return parts.length > 1 ? parts.slice(1).join(" - ") : genre
}
