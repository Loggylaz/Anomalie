"use client"

import { Search, SlidersHorizontal, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { genreGroups, type Genre, type GenreGroup } from "@/lib/data"

type SortOption = "date-desc" | "date-asc" | "rating-desc" | "rating-asc"

type FilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  selectedGenres: Genre[]
  onGenreToggle: (genre: Genre) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  favoritesOnly: boolean
  onFavoritesToggle: () => void
  resultCount: number
  onClearFilters: () => void
}

const groupNames = Object.keys(genreGroups) as GenreGroup[]

export function FilterBar({
  search,
  onSearchChange,
  selectedGenres,
  onGenreToggle,
  sortBy,
  onSortChange,
  favoritesOnly,
  onFavoritesToggle,
  resultCount,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    search.length > 0 || selectedGenres.length > 0 || favoritesOnly

  return (
    <div className="flex flex-col gap-5">
      {/* Search and controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un livre, un auteur..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={onFavoritesToggle}
            className="gap-1.5"
          >
            <Star
              className={`size-3.5 ${favoritesOnly ? "fill-primary-foreground" : ""}`}
            />
            Coups de coeur
          </Button>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-sm text-foreground outline-none cursor-pointer"
              aria-label="Trier par"
            >
              <option value="date-desc">Plus r&eacute;cents</option>
              <option value="date-asc">Plus anciens</option>
              <option value="rating-desc">Meilleures notes</option>
              <option value="rating-asc">Notes croissantes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre filter chips */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Genres
        </span>

        {groupNames.map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground/80">
              {group}
            </span>
            {genreGroups[group].map((subcategory) => {
              const genre = `${group} - ${subcategory}` as Genre
              const isSelected = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => onGenreToggle(genre)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {subcategory}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Active filters and count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resultCount} chronique{resultCount !== 1 ? "s" : ""}
          {hasActiveFilters ? " trouv\u00e9e" : ""}
          {hasActiveFilters && resultCount !== 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  )
}
