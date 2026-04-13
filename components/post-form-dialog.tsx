"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowDown, ArrowUp, Link2, Loader2, Star, Trash2, Upload } from "lucide-react"
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
  fallbackGenres,
  fallbackOrigins,
  getLegacyGenreLabel,
  type BookPost,
  type GenreOption,
  type OriginOption,
} from "@/lib/data"
import { createClient } from "@/lib/supabase/client"

const postSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  originId: z.string().min(1, "Le style de litterature est requis"),
  genreId: z.string().min(1, "Le style est requis"),
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
  origins: OriginOption[]
  genres: GenreOption[]
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

function parseCoverImages(input: string | undefined) {
  if (!input) return []
  return input
    .split(/[,\n]/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export function PostFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingPost,
  origins,
  genres,
}: PostFormDialogProps) {
  const isEditing = !!editingPost
  const supabase = useMemo(() => createClient(), [])
  const originOptions = origins.length > 0 ? origins : fallbackOrigins
  const genreOptions = genres.length > 0 ? genres : fallbackGenres
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File }>>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [importUrl, setImportUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      author: "",
      originId: "",
      genreId: "",
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
  const originIdValue = watch("originId")
  const genreIdValue = watch("genreId")

  useEffect(() => {
    if (!open) return

    setSelectedFiles([])
    setUploadError(null)

    if (editingPost) {
      const matchedOrigin =
        originOptions.find((origin) => origin.id === editingPost.originId) ||
        originOptions.find((origin) => origin.name === editingPost.origin?.name)
      const matchedGenre =
        genreOptions.find((genre) => genre.id === editingPost.genreId) ||
        genreOptions.find((genre) => genre.name === editingPost.genreMeta?.name) ||
        genreOptions.find((genre) => genre.name === getLegacyGenreLabel(editingPost.genre))

      reset({
        title: editingPost.title,
        author: editingPost.author,
        originId: matchedOrigin?.id || "",
        genreId: matchedGenre?.id || "",
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
        originId: "",
        genreId: "",
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
  }, [open, editingPost, originOptions, genreOptions, reset])

  function moveFile(index: number, direction: -1 | 1) {
    setSelectedFiles((prev) => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const next = [...prev]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
  }

  async function uploadFilesInOrder(files: Array<{ id: string; file: File }>) {
    const urls: string[] = []

    for (const item of files) {
      const file = item.file
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const baseName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
      const fileName = `${Date.now()}-${crypto.randomUUID()}-${baseName}.${extension}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath)
      urls.push(data.publicUrl)
    }

    return urls
  }

  async function handleInstagramImport() {
    const url = importUrl.trim()
    if (!url) return

    const match = url.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
    if (!match) {
      setImportError("URL Instagram invalide")
      return
    }
    const shortcode = match[1]

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(false)

    try {
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`
      const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(embedUrl)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const html = await res.text()

      // Extraire l'image depuis les URLs cdninstagram dans le HTML
      const imgMatch = html.match(/https:\/\/[^"'\s]+(?:cdninstagram\.com|fbcdn\.net)[^"'\s]+\.jpg[^"'\s]*/i)
      const imageUrl = imgMatch ? imgMatch[0].replace(/&amp;/g, "&") : ""

      // Extraire la legende depuis le JSON embarque dans la page
      let caption = ""
      const jsonMatch = html.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/i)
        || html.match(/class="Caption"[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/i)
      if (jsonMatch) {
        caption = jsonMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\u0026/g, "&")
          .replace(/\\"/g, '"')
          .replace(/\\/g, "")
          .trim()
      }

      if (!caption && !imageUrl) {
        setImportError("Aucune donnée trouvée — le post est peut-être privé ou Instagram a changé son format.")
        return
      }

      if (caption) setValue("excerpt", caption, { shouldValidate: true })
      if (imageUrl) {
        const current = getValues("coverImagesText")
        setValue("coverImagesText", current ? `${current}\n${imageUrl}` : imageUrl)
      }
      setValue("instagramUrl", url)
      setImportUrl("")
      setImportSuccess(true)
    } catch {
      setImportError("Impossible de récupérer le post")
    } finally {
      setIsImporting(false)
    }
  }

  async function onFormSubmit(data: PostFormData) {
    const urlImages = parseCoverImages(data.coverImagesText)
    let uploadedImages: string[] = []

    setUploadError(null)
    if (selectedFiles.length > 0) {
      try {
        setIsUploadingFiles(true)
        uploadedImages = await uploadFilesInOrder(selectedFiles)
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : "Upload impossible. Verifiez le bucket Supabase `post-images`."
        )
        setIsUploadingFiles(false)
        return
      } finally {
        setIsUploadingFiles(false)
      }
    }

    const combinedImages = [...urlImages, ...uploadedImages]
    const normalizedCoverImages =
      combinedImages.length > 0
        ? combinedImages
        : [`/placeholder.svg?height=600&width=400`]

    const selectedOrigin =
      originOptions.find((origin) => origin.id === data.originId) || null
    const selectedGenre =
      genreOptions.find((genre) => genre.id === data.genreId) || null
    const resolvedOriginId =
      selectedOrigin && !selectedOrigin.id.startsWith("fallback-")
        ? selectedOrigin.id
        : null
    const resolvedGenreId =
      selectedGenre && !selectedGenre.id.startsWith("fallback-")
        ? selectedGenre.id
        : null

    const bookPost: Omit<BookPost, "id"> = {
      title: data.title.trim(),
      author: data.author.trim(),
      genre: selectedGenre?.name || "",
      originId: resolvedOriginId,
      genreId: resolvedGenreId,
      origin: resolvedOriginId ? selectedOrigin : null,
      genreMeta: resolvedGenreId ? selectedGenre : null,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-w-xl">
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
          className="flex min-w-0 flex-col gap-5 pt-2"
        >
          {!isEditing && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lien du post Instagram</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.instagram.com/p/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleInstagramImport()
                    }
                  }}
                  className="bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleInstagramImport}
                  disabled={isImporting || !importUrl.trim()}
                  className="shrink-0"
                >
                  {isImporting
                    ? <Loader2 className="size-4 animate-spin" />
                    : "Importer"}
                </Button>
              </div>
              {importError && (
                <p className="mt-2 text-xs text-destructive">{importError}</p>
              )}
              {importSuccess && (
                <p className="mt-2 text-xs text-green-600">
                  Légende et image pré-remplies.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Fonctionne sur les posts publics. La légende et l&apos;image se remplissent automatiquement.
              </p>
            </div>
          )}

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
                <p className="text-xs text-destructive">{errors.title.message}</p>
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
                <p className="text-xs text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>
                Style de litterature <span className="text-destructive">*</span>
              </Label>
              <Select
                value={originIdValue}
                onValueChange={(value) =>
                  setValue("originId", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir une origine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Origines</SelectLabel>
                    {originOptions.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>
                        {origin.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.originId && (
                <p className="text-xs text-destructive">{errors.originId.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                Style <span className="text-destructive">*</span>
              </Label>
              <Select
                value={genreIdValue}
                onValueChange={(value) =>
                  setValue("genreId", value, { shouldValidate: true })
                }
                disabled={!originIdValue}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      originIdValue
                        ? "Choisir un style"
                        : "Selectionnez d'abord une origine"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Genres</SelectLabel>
                    {genreOptions.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.genreId && (
                <p className="text-xs text-destructive">{errors.genreId.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="excerpt">
              Extrait / Caption Instagram <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="excerpt"
              placeholder="Collez ici le texte de votre post Instagram..."
              rows={3}
              {...register("excerpt")}
              className="bg-background resize-none break-words whitespace-pre-wrap"
            />
            {errors.excerpt && (
              <p className="text-xs text-destructive">{errors.excerpt.message}</p>
            )}
          </div>

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
              className="bg-background resize-none break-words whitespace-pre-wrap"
            />
          </div>

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
              className="bg-background resize-none break-all"
            />
            <p className="text-xs text-muted-foreground">
              Une URL par ligne (ou separees par des virgules). S'il y en a
              plusieurs, l'ordre des lignes est conserve.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="coverImagesUpload">
              Upload d'images{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (optionnel)
              </span>
            </Label>
            <Input
              id="coverImagesUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || [])
                setSelectedFiles(
                  files.map((file) => ({
                    id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
                    file,
                  }))
                )
                setUploadError(null)
              }}
              className="bg-background"
            />
            {selectedFiles.length > 0 && (
              <div className="rounded-md border border-border/70 bg-muted/30 p-2">
                <p className="mb-2 text-xs text-muted-foreground">
                  Reordonne les images: cet ordre sera respecte dans le carrousel.
                </p>
                <div className="flex flex-col gap-1.5">
                  {selectedFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex min-w-0 items-center justify-between rounded-md border border-border bg-background px-2 py-1.5"
                    >
                      <span className="min-w-0 break-all pr-2 text-xs text-foreground">
                        {index + 1}. {item.file.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => moveFile(index, -1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => moveFile(index, 1)}
                          disabled={index === selectedFiles.length - 1}
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() =>
                            setSelectedFiles((prev) =>
                              prev.filter((candidate) => candidate.id !== item.id)
                            )
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Les fichiers sont envoyes vers le bucket Supabase `post-images`.
            </p>
            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
          </div>

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

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isUploadingFiles}>
              {isUploadingFiles && <Upload className="size-4 animate-pulse" />}
              {isEditing ? "Enregistrer" : "Ajouter la chronique"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
