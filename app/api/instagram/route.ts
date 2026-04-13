import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL requise" }, { status: 400 })
  }

  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`
    const response = await fetch(oembedUrl, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Post introuvable ou non public (code ${response.status})` },
        { status: 400 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      caption: data.title ?? "",
      thumbnailUrl: data.thumbnail_url ?? "",
      authorName: data.author_name ?? "",
    })
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter l'API Instagram" },
      { status: 500 }
    )
  }
}
