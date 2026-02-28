export const genreGroups = {
  "Littérature Belge": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noël)",
    "Feel Good",
    "Young Adult",
  ],
  "Littérature Française": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noël)",
    "Feel Good",
    "Young Adult",
  ],
  "Littérature Étrangère": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noël)",
    "Feel Good",
    "Young Adult",
  ],
} as const

export type GenreGroup = keyof typeof genreGroups
type GenreSubcategory = (typeof genreGroups)[GenreGroup][number]
export type Genre = `${GenreGroup} - ${GenreSubcategory}`

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
  coverImages: string[]
  tags: string[]
  isFavorite: boolean
  instagramUrl?: string
}

export const genres: Genre[] = Object.entries(genreGroups).flatMap(
  ([group, subcategories]) =>
    subcategories.map((subcategory) => `${group} - ${subcategory}` as Genre)
)
