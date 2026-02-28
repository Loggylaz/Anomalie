"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  genreGroups,
  type BookPost,
  type Genre,
  type GenreGroup,
} from "@/lib/data"

const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  literatureGroup: z.string().min(1, "Le style de litterature est requis"),
  genreStyle: z.string().min(1, "Le style est requis"),
  rating: z.number().min(1).max(5),
  date: z.string().min(1, "La date est requise"),
  excerpt: z.string().min(1, "L'extrait est requis"),
  review: z.string().optional().default(""),
  coverImagesText: z.string().optional().default(""),
  instagramUrl: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  isFavorite: z.boolean().default(false),
})

type PostFormData = z.infer<typeof postSchema>

type PostFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<BookPost, "id">) => void | Promise<void>
  editingPost?: BookPost | null
}

function RatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} etoile${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`size-6 ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

const groupNames = Object.keys(genreGroups) as GenreGroup[]
const genreSeparator = " - "

function parseCoverImages(input: string | undefined) {
  if (!input) return []

  return input
    .split(/[,\n]/)
    .map((url) => url.trim())
    .filter(Boolean)
}

function splitGenre(value: string | undefined) {
  if (!value) return { group: "", style: "" }
  const separatorIndex = value.indexOf(genreSeparator)
  if (separatorIndex === -1) return { group: "", style: "" }

  return {
    group: value.slice(0, separatorIndex),
    style: value.slice(separatorIndex + genreSeparator.length),
  }
}

export function PostFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingPost,
}: PostFormDialogProps) {
  const isEditing = !!editingPost

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      author: "",
      literatureGroup: "",
      genreStyle: "",
      rating: 4,
      date: new Date().toISOString().split("T")[0],
      excerpt: "",
      review: "",
      coverImagesText: "",
      instagramUrl: "",
      tags: "",
      isFavorite: false,
    },
  })

  const ratingValue = watch("rating")
  const isFavoriteValue = watch("isFavorite")
  const selectedLiteratureGroup = watch("literatureGroup")
  const selectedGenreStyle = watch("genreStyle")
  const availableStyles = useMemo<string[]>(() => {
    if (!selectedLiteratureGroup) return []
    return [...(genreGroups[selectedLiteratureGroup as GenreGroup] || [])]
  }, [selectedLiteratureGroup])

  useEffect(() => {
    if (open) {
      if (editingPost) {
        const { group, style } = splitGenre(editingPost.genre)
        reset({
          title: editingPost.title,
          author: editingPost.author,
          literatureGroup: group,
          genreStyle: style,
          rating: editingPost.rating,
          date: editingPost.date,
          excerpt: editingPost.excerpt,
          review: editingPost.review || "",
          coverImagesText: (editingPost.coverImages || [editingPost.coverImage])
            .filter((image) => image && !image.startsWith("/placeholder"))
            .join("\n"),
          instagramUrl: editingPost.instagramUrl || "",
          tags: editingPost.tags.join(", "),
          isFavorite: editingPost.isFavorite,
        })
      } else {
        reset({
          title: "",
          author: "",
          literatureGroup: "",
          genreStyle: "",
          rating: 4,
          date: new Date().toISOString().split("T")[0],
          excerpt: "",
          review: "",
          coverImagesText: "",
          instagramUrl: "",
          tags: "",
          isFavorite: false,
        })
      }
    }
  }, [open, editingPost, reset])

  async function onFormSubmit(data: PostFormData) {
    const coverImages = parseCoverImages(data.coverImagesText)
    const normalizedCoverImages =
      coverImages.length > 0
        ? coverImages
        : [`/placeholder.svg?height=600&width=400`]

    const bookPost: Omit<BookPost, "id"> = {
      title: data.title.trim(),
      author: data.author.trim(),
      genre: `${data.literatureGroup}${genreSeparator}${data.genreStyle}` as Genre,
      rating: data.rating,
      date: data.date,
      excerpt: data.excerpt.trim(),
      review: data.review?.trim() || "",
      coverImage: normalizedCoverImages[0],
      coverImages: normalizedCoverImages,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [],
      isFavorite: data.isFavorite,
      instagramUrl: data.instagramUrl?.trim() || undefined,
    }
    await onSubmit(bookPost)
    onOpenChange(false)
  }

  useEffect(() => {
    if (
      selectedLiteratureGroup &&
      selectedGenreStyle &&
      !availableStyles.includes(selectedGenreStyle)
    ) {
      setValue("genreStyle", "", { shouldValidate: true })
    }
  }, [availableStyles, selectedGenreStyle, selectedLiteratureGroup, setValue])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditing ? "Modifier la chronique" : "Ajouter une chronique"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de cette chronique."
              : "Recopiez les informations de votre post Instagram pour l'ajouter au blog."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-5 pt-2"
        >
          {/* Title & Author row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Titre du livre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Le Petit Prince"
                {...register("title")}
                className="bg-background"
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="author">
                Auteur <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                placeholder="Ex: Antoine de Saint-Exupery"
                {...register("author")}
                className="bg-background"
              />
              {errors.author && (
                <p className="text-xs text-destructive">
                  {errors.author.message}
                </p>
              )}
            </div>
          </div>

          {/* Genre & Date row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>
                Style de litterature <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedLiteratureGroup}
                onValueChange={(v) => {
                  setValue("literatureGroup", v, { shouldValidate: true })
                  setValue("genreStyle", "", { shouldValidate: true })
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir une litterature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Litteratures</SelectLabel>
                    {groupNames.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.literatureGroup && (
                <p className="text-xs text-destructive">
                  {errors.literatureGroup.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                Style <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedGenreStyle}
                onValueChange={(v) => setValue("genreStyle", v, { shouldValidate: true })}
                disabled={!selectedLiteratureGroup}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      selectedLiteratureGroup
                        ? "Choisir un style"
                        : "Selectionnez d'abord une litterature"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Styles disponibles</SelectLabel>
                    {availableStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.genreStyle && (
                <p className="text-xs text-destructive">
                  {errors.genreStyle.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="bg-background"
              />
            </div>
          </div>

          {/* Rating & Favorite row */}
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-2">
              <Label>Note</Label>
              <RatingInput
                value={ratingValue}
                onChange={(v) => setValue("rating", v)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="isFavorite"
                checked={isFavoriteValue}
                onCheckedChange={(checked) =>
                  setValue("isFavorite", checked === true)
                }
              />
              <Label htmlFor="isFavorite" className="cursor-pointer">
                Coup de coeur
              </Label>
            </div>
          </div>

          {/* Excerpt (caption Instagram) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="excerpt">
              Extrait / Caption Instagram{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Collez ici le texte de votre post Instagram..."
              rows={3}
              {...register("excerpt")}
              className="bg-background resize-none"
            />
            {errors.excerpt && (
              <p className="text-xs text-destructive">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          {/* Full review */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="review">
              Chronique complete{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optionnel)
              </span>
            </Label>
            <Textarea
              id="review"
              placeholder="Une critique plus detaillee si vous le souhaitez..."
              rows={4}
              {...register("review")}
              className="bg-background resize-none"
            />
          </div>

          {/* Cover images URLs */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverImagesText">
              URLs des images{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optionnel)
              </span>
            </Label>
            <Textarea
              id="coverImagesText"
              rows={3}
              placeholder={"https://...\nhttps://..."}
              {...register("coverImagesText")}
              className="bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Une URL par ligne (ou separees par des virgules). S{"'"}il y en a
              plusieurs, un carrousel sera affiche sur la carte.
            </p>
          </div>

          {/* Instagram URL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="instagramUrl">
              Lien du post Instagram{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optionnel)
              </span>
            </Label>
            <Input
              id="instagramUrl"
              type="url"
              placeholder="https://www.instagram.com/p/..."
              {...register("instagramUrl")}
              className="bg-background"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">
              Tags{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (separes par des virgules)
              </span>
            </Label>
            <Input
              id="tags"
              placeholder="Ex: coup-de-coeur, saga, francophone"
              {...register("tags")}
              className="bg-background"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? "Enregistrer" : "Ajouter la chronique"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
