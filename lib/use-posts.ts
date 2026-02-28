"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getLegacyGenreLabel,
  getLegacyOriginFromGenre,
  type BookPost,
  type Genre,
  type GenreOption,
  type OriginOption,
} from "@/lib/data"

type DbTaxonomy = {
  id: string
  name: string
  slug: string
}

type DbPost = {
  id: string
  title: string
  author: string
  genre: string
  origin_id: string | null
  genre_id: string | null
  rating: number
  date: string
  excerpt: string
  review: string | null
  cover_image: string | null
  cover_images: string[] | null
  tags: string[] | null
  is_favorite: boolean
  instagram_url: string | null
  created_at: string
  origin?: DbTaxonomy | null
  genre_ref?: DbTaxonomy | null
}

function normalizeCoverImages(row: DbPost) {
  const fallback = row.cover_image || `/placeholder.svg?height=600&width=400`
  return row.cover_images && row.cover_images.length > 0
    ? row.cover_images
    : [fallback]
}

function toBookPost(row: DbPost): BookPost {
  const coverImages = normalizeCoverImages(row)
  const resolvedGenre = row.genre_ref?.name || getLegacyGenreLabel(row.genre)
  const resolvedOrigin = row.origin?.name || getLegacyOriginFromGenre(row.genre)

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: (resolvedGenre || row.genre) as Genre,
    originId: row.origin_id,
    genreId: row.genre_id,
    origin: row.origin
      ? { id: row.origin.id, name: row.origin.name, slug: row.origin.slug }
      : resolvedOrigin
        ? { id: row.origin_id || "", name: resolvedOrigin, slug: "" }
        : null,
    genreMeta: row.genre_ref
      ? {
          id: row.genre_ref.id,
          name: row.genre_ref.name,
          slug: row.genre_ref.slug,
        }
      : resolvedGenre
        ? { id: row.genre_id || "", name: resolvedGenre, slug: "" }
        : null,
    rating: row.rating,
    date: row.date,
    excerpt: row.excerpt,
    review: row.review || "",
    coverImage: coverImages[0],
    coverImages,
    tags: row.tags || [],
    isFavorite: row.is_favorite,
    instagramUrl: row.instagram_url || undefined,
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<BookPost[]>([])
  const [origins, setOrigins] = useState<OriginOption[]>([])
  const [genres, setGenres] = useState<GenreOption[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  const fetchTaxonomy = useCallback(async () => {
    const [{ data: originsData, error: originsError }, { data: genresData, error: genresError }] =
      await Promise.all([
        supabase.from("origins").select("id, name, slug").order("name", { ascending: true }),
        supabase.from("genres").select("id, name, slug").order("name", { ascending: true }),
      ])

    if (originsError) {
      console.error("[v0] Error fetching origins:", originsError.message)
    } else {
      setOrigins((originsData as DbTaxonomy[]).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
      })))
    }

    if (genresError) {
      console.error("[v0] Error fetching genres:", genresError.message)
    } else {
      setGenres((genresData as DbTaxonomy[]).map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
      })))
    }
  }, [supabase])

  const fetchPosts = useCallback(async () => {
    const joinedQuery = await supabase
      .from("posts")
      .select(
        "*, origin:origins(id, name, slug), genre_ref:genres(id, name, slug)"
      )
      .order("date", { ascending: false })

    let data = joinedQuery.data as DbPost[] | null
    let error = joinedQuery.error

    if (error) {
      const fallbackQuery = await supabase
        .from("posts")
        .select("*")
        .order("date", { ascending: false })
      data = fallbackQuery.data as DbPost[] | null
      error = fallbackQuery.error
    }

    if (error || !data) {
      console.error("[v0] Error fetching posts:", error?.message || "unknown")
      return
    }

    setPosts(data.map(toBookPost))
    setIsLoaded(true)
  }, [supabase])

  useEffect(() => {
    fetchTaxonomy()
    fetchPosts()
  }, [fetchTaxonomy, fetchPosts])

  const addPost = useCallback(
    async (post: Omit<BookPost, "id">) => {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: post.title,
          author: post.author,
          genre: post.genreMeta?.name || post.genre,
          origin_id: post.originId,
          genre_id: post.genreId,
          rating: post.rating,
          date: post.date,
          excerpt: post.excerpt,
          review: post.review || null,
          cover_image: post.coverImage?.startsWith("/placeholder")
            ? null
            : post.coverImage || null,
          cover_images:
            post.coverImages && post.coverImages.length > 0
              ? post.coverImages
              : null,
          tags: post.tags.length > 0 ? post.tags : null,
          is_favorite: post.isFavorite,
          instagram_url: post.instagramUrl || null,
        })
        .select("*, origin:origins(id, name, slug), genre_ref:genres(id, name, slug)")
        .single()

      if (error) {
        console.error("[v0] Error adding post:", error.message)
        throw error
      }

      const newPost = toBookPost(data as DbPost)
      setPosts((prev) => [newPost, ...prev])
      return newPost
    },
    [supabase]
  )

  const updatePost = useCallback(
    async (id: string, updates: Partial<Omit<BookPost, "id">>) => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.author !== undefined) dbUpdates.author = updates.author
      if (updates.genre !== undefined) dbUpdates.genre = updates.genre
      if (updates.originId !== undefined) dbUpdates.origin_id = updates.originId
      if (updates.genreId !== undefined) dbUpdates.genre_id = updates.genreId
      if (updates.genreMeta !== undefined)
        dbUpdates.genre = updates.genreMeta?.name || updates.genre || null
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating
      if (updates.date !== undefined) dbUpdates.date = updates.date
      if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt
      if (updates.review !== undefined)
        dbUpdates.review = updates.review || null
      if (updates.coverImages !== undefined) {
        dbUpdates.cover_image = updates.coverImages[0]?.startsWith("/placeholder")
          ? null
          : updates.coverImages[0] || null
        dbUpdates.cover_images =
          updates.coverImages.length > 0 ? updates.coverImages : null
      } else if (updates.coverImage !== undefined) {
        dbUpdates.cover_image = updates.coverImage?.startsWith("/placeholder")
          ? null
          : updates.coverImage || null
        dbUpdates.cover_images = updates.coverImage ? [updates.coverImage] : null
      }
      if (updates.tags !== undefined)
        dbUpdates.tags = updates.tags && updates.tags.length > 0 ? updates.tags : null
      if (updates.isFavorite !== undefined)
        dbUpdates.is_favorite = updates.isFavorite
      if (updates.instagramUrl !== undefined)
        dbUpdates.instagram_url = updates.instagramUrl || null

      const { error } = await supabase
        .from("posts")
        .update(dbUpdates)
        .eq("id", id)

      if (error) {
        console.error("[v0] Error updating post:", error.message)
        throw error
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const next: BookPost = { ...p, ...updates }
          if (updates.coverImages) {
            next.coverImage = updates.coverImages[0] || p.coverImage
            next.coverImages = updates.coverImages
          } else if (updates.coverImage) {
            next.coverImage = updates.coverImage
            next.coverImages = [updates.coverImage]
          }
          if (updates.genreMeta?.name) {
            next.genre = updates.genreMeta.name
          }
          return next
        })
      )
    },
    [supabase]
  )

  const deletePost = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id)

      if (error) {
        console.error("[v0] Error deleting post:", error.message)
        throw error
      }

      setPosts((prev) => prev.filter((p) => p.id !== id))
    },
    [supabase]
  )

  return {
    posts,
    origins,
    genres,
    isLoaded,
    addPost,
    updatePost,
    deletePost,
  }
}
