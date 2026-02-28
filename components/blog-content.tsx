"use client"

import { useState, useMemo } from "react"
import { BookX, Plus } from "lucide-react"
import { type Genre, type BookPost } from "@/lib/data"
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
  const { posts, addPost, updatePost, deletePost } = usePosts()

  const [search, setSearch] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])
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

    if (selectedGenres.length > 0) {
      result = result.filter((post) => selectedGenres.includes(post.genre))
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
  }, [posts, search, selectedGenres, sortBy, favoritesOnly])

  function handleGenreToggle(genre: Genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  function handleClearFilters() {
    setSearch("")
    setSelectedGenres([])
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
          selectedGenres={selectedGenres}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
