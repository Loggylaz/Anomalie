"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { BookPost, Genre } from "@/lib/data"

type DbPost = {
  id: string
  title: string
  author: string
  genre: string
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
}

function normalizeCoverImages(row: DbPost) {
  const fallback = row.cover_image || `/placeholder.svg?height=600&width=400`
  return row.cover_images && row.cover_images.length > 0
    ? row.cover_images
    : [fallback]
}

function toBookPost(row: DbPost): BookPost {
  const coverImages = normalizeCoverImages(row)

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre as Genre,
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
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching posts:", error.message)
      return
    }

    setPosts((data as DbPost[]).map(toBookPost))
    setIsLoaded(true)
  }, [supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const addPost = useCallback(
    async (post: Omit<BookPost, "id">) => {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: post.title,
          author: post.author,
          genre: post.genre,
          rating: post.rating,
          date: post.date,
          excerpt: post.excerpt,
          review: post.review || null,
          cover_image: post.coverImages[0]?.startsWith("/placeholder")
            ? null
            : post.coverImages[0] || null,
          cover_images: post.coverImages.length > 0 ? post.coverImages : null,
          tags: post.tags.length > 0 ? post.tags : null,
          is_favorite: post.isFavorite,
          instagram_url: post.instagramUrl || null,
        })
        .select()
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
      }
      if (updates.tags !== undefined)
        dbUpdates.tags =
          updates.tags && updates.tags.length > 0 ? updates.tags : null
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
          const next = { ...p, ...updates }
          if (updates.coverImages) {
            next.coverImage = updates.coverImages[0] || p.coverImage
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

  return { posts, isLoaded, addPost, updatePost, deletePost }
}
