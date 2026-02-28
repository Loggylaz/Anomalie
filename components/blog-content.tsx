"use client"

import { useState, useMemo } from "react"
import { BookX, Plus } from "lucide-react"
import {
  fallbackGenres,
  fallbackOrigins,
  getLegacyOriginFromGenre,
  type BookPost,
} from "@/lib/data"
import { usePosts } from "@/lib/use-posts"
import { FilterBar } from "@/components/filter-bar"
import { BookCard } from "@/components/book-card"
import { StatsBar } from "@/components/stats-bar"
import { PostFormDialog } from "@/components/post-form-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc"

interface BlogContentProps {
  isAdmin: boolean
}

export function BlogContent({ isAdmin }: BlogContentProps) {
  const { posts, origins, genres, addPost, updatePost, deletePost } = usePosts()
  const originOptions = origins.length > 0 ? origins : fallbackOrigins
  const genreOptions = genres.length > 0 ? genres : fallbackGenres

  const [search, setSearch] = useState("")
  const [selectedOriginIds, setSelectedOriginIds] = useState<string[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BookPost | null>(null)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingPost, setDeletingPost] = useState<BookPost | null>(null)

  const filteredPosts = useMemo(() => {
    let result = [...posts]
    const selectedOriginNames = originOptions
      .filter((origin) => selectedOriginIds.includes(origin.id))
      .map((origin) => origin.name)
    const selectedGenreNames = genreOptions
      .filter((genre) => selectedGenreIds.includes(genre.id))
      .map((genre) => genre.name)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (selectedOriginIds.length > 0) {
      result = result.filter((post) => {
        if (post.originId) return selectedOriginIds.includes(post.originId)
        const fallbackOrigin = post.origin?.name || getLegacyOriginFromGenre(post.genre)
        return fallbackOrigin ? selectedOriginNames.includes(fallbackOrigin) : false
      })
    }

    if (selectedGenreIds.length > 0) {
      result = result.filter((post) => {
        if (post.genreId) return selectedGenreIds.includes(post.genreId)
        const fallbackGenre = post.genreMeta?.name || post.genre
        return selectedGenreNames.includes(fallbackGenre)
      })
    }

    if (favoritesOnly) {
      result = result.filter((post) => post.isFavorite)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "rating-desc":
          return b.rating - a.rating
        case "rating-asc":
          return a.rating - b.rating
        default:
          return 0
      }
    })

    return result
  }, [
    favoritesOnly,
    genreOptions,
    originOptions,
    posts,
    search,
    selectedGenreIds,
    selectedOriginIds,
    sortBy,
  ])

  function handleOriginToggle(originId: string) {
    setSelectedOriginIds((prev) =>
      prev.includes(originId)
        ? prev.filter((id) => id !== originId)
        : [...prev, originId]
    )
  }

  function handleGenreToggle(genreId: string) {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
  }

  function handleClearFilters() {
    setSearch("")
    setSelectedOriginIds([])
    setSelectedGenreIds([])
    setFavoritesOnly(false)
    setSortBy("date-desc")
  }

  function handleAdd() {
    setEditingPost(null)
    setFormOpen(true)
  }

  function handleEdit(post: BookPost) {
    setEditingPost(post)
    setFormOpen(true)
  }

  function handleDeleteRequest(post: BookPost) {
    setDeletingPost(post)
    setDeleteOpen(true)
  }

  async function handleFormSubmit(data: Omit<BookPost, "id">) {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, data)
        toast.success("Chronique modifiee avec succes")
      } else {
        await addPost(data)
        toast.success("Chronique ajoutee avec succes")
      }
    } catch {
      toast.error("Une erreur est survenue. Verifiez votre connexion.")
    }
  }

  async function handleDeleteConfirm() {
    if (deletingPost) {
      try {
        await deletePost(deletingPost.id)
        toast.success(`"${deletingPost.title}" a ete supprimee`)
      } catch {
        toast.error("Erreur lors de la suppression.")
      }
      setDeleteOpen(false)
      setDeletingPost(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <StatsBar posts={posts} />

      {/* Add button + filters */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Chroniques
          </h2>
          {isAdmin && (
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Ajouter une chronique
            </Button>
          )}
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          origins={originOptions}
          genres={genreOptions}
          selectedOriginIds={selectedOriginIds}
          onOriginToggle={handleOriginToggle}
          selectedGenreIds={selectedGenreIds}
          onGenreToggle={handleGenreToggle}
          sortBy={sortBy}
          onSortChange={setSortBy}
          favoritesOnly={favoritesOnly}
          onFavoritesToggle={() => setFavoritesOnly(!favoritesOnly)}
          resultCount={filteredPosts.length}
          onClearFilters={handleClearFilters}
        />
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BookCard
              key={post.id}
              post={post}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDeleteRequest : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card py-20">
          <BookX className="size-10 text-muted-foreground/50" />
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-base font-medium text-foreground">
              Aucune chronique trouvee
            </p>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres{isAdmin ? " ou ajoutez une nouvelle chronique" : ""}.
            </p>
          </div>
          {isAdmin && (
            <Button variant="outline" onClick={handleAdd} className="gap-2 mt-2">
              <Plus className="size-4" />
              Ajouter une chronique
            </Button>
          )}
        </div>
      )}

      {/* Dialogs - only rendered for admin */}
      {isAdmin && (
        <>
          <PostFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleFormSubmit}
            editingPost={editingPost}
            origins={originOptions}
            genres={genreOptions}
          />

          <DeleteConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDeleteConfirm}
            bookTitle={deletingPost?.title || ""}
          />
        </>
      )}
    </div>
  )
}
