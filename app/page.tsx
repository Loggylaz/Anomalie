"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BlogContent } from "@/components/blog-content"
import { Toaster } from "@/components/ui/sonner"
import { useAdmin } from "@/lib/use-admin"

export default function Home() {
  const { isAdmin, isLoading, login, logout } = useAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        isAdmin={isAdmin}
        isLoading={isLoading}
        onLogin={login}
        onLogout={logout}
      />

      <main className="flex-1">
        {/* Hero section */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex flex-col gap-3">
                <img
                  src="/branding/anomalie-logo-full.png"
                  alt="Logo Anomalie Litteraire"
                  className="mx-auto mb-2 h-auto w-full max-w-[28rem]"
                />
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-balance text-foreground md:text-5xl lg:text-6xl">
                  Anomalie Litt&eacute;raire
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Un espace d&eacute;di&eacute; aux mots qui marquent, aux histoires qui
                  transforment et aux livres qui restent. Chaque chronique est
                  une invitation au voyage litt&eacute;raire.
                </p>
              </div>
              <div className="h-px w-16 bg-primary/40" />
            </div>
          </div>
        </section>

        {/* Blog content with stats, filters, and cards */}
        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlogContent isAdmin={isAdmin} />
        </section>
      </main>

      <SiteFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
