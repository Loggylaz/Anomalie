export const genreGroups = {
  "Litterature Belge": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noel)",
    "Feel Good",
    "Young Adult",
  ],
  "Litterature Francaise": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noel)",
    "Feel Good",
    "Young Adult",
  ],
  "Litterature Etrangere": [
    "Thriller",
    "Cosy Mystery",
    "Jeunesse",
    "BD",
    "Romance (Noel)",
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
