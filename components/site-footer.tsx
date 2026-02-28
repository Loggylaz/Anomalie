import { BookOpen, Instagram } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <span className="font-serif text-base font-bold text-foreground">
                Anomalie Litt&eacute;raire
              </span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Blog litt&eacute;raire inspir&eacute; du compte Instagram @anomalie.litteraire.
              Chroniques, avis et recommandations de lectures.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href="https://www.instagram.com/anomalie.litteraire/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="size-4" />
              Suivre sur Instagram
            </a>
            <p className="text-xs text-muted-foreground">
              Les donn&eacute;es affich&eacute;es sont des exemples fictifs.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Anomalie Litt&eacute;raire. Tous droits r&eacute;serv&eacute;s.
        </p>
      </div>
    </footer>
  )
}
