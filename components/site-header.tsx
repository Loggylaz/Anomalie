"use client"

import { BookOpen, Instagram, Lock, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface SiteHeaderProps {
  isAdmin: boolean
  isLoading: boolean
  onLogin: (email: string, password: string) => Promise<void>
  onLogout: () => Promise<void>
}

export function SiteHeader({ isAdmin, isLoading, onLogin, onLogout }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onLogin(email, password)
      setOpen(false)
      setEmail("")
      setPassword("")
      toast.success("Connexion reussie")
    } catch {
      toast.error("Identifiants incorrects")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await onLogout()
    toast.success("Deconnexion reussie")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold leading-tight tracking-tight text-foreground">
              Anomalie Litt&eacute;raire
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              Chroniques & avis litt&eacute;raires
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/anomalie.litteraire/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Voir le profil Instagram"
          >
            <Instagram className="size-4" />
            <span className="hidden sm:inline">@anomalie.litteraire</span>
          </a>

          {isLoading ? null : isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline ml-1">Deconnexion</span>
            </Button>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground/50 hover:text-muted-foreground"
                  aria-label="Connexion administrateur"
                >
                  <Lock className="size-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-serif">Espace administrateur</DialogTitle>
                  <DialogDescription>
                    Connectez-vous pour gerer les chroniques.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="admin-password">Mot de passe</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </nav>
      </div>
    </header>
  )
}
