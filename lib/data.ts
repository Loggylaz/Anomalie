export type Genre =
  | "Roman"
  | "Fantasy"
  | "Science-Fiction"
  | "Thriller"
  | "Classique"
  | "Poesie"
  | "BD & Manga"
  | "Contemporain"
  | "Jeunesse"

export type BookPost = {
  id: string
  title: string
  author: string
  genre: Genre
  rating: number
  date: string
  excerpt: string
  review: string
  coverImage: string
  tags: string[]
  isFavorite: boolean
  instagramUrl?: string
}

export const genres: Genre[] = [
  "Roman",
  "Fantasy",
  "Science-Fiction",
  "Thriller",
  "Classique",
  "Poesie",
  "BD & Manga",
  "Contemporain",
  "Jeunesse",
]
