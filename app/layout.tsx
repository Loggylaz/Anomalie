import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Anomalie Litt\u00e9raire | Chroniques Litt\u00e9raires',
  description: 'Blog litt\u00e9raire inspir\u00e9 du compte Instagram @anomalie.litteraire. D\u00e9couvrez des chroniques de livres, des avis et recommandations par genre.',
  icons: {
    icon: [
      {
        url: '/branding/anomalie-favicon-32.png',
      },
      {
        url: '/branding/anomalie-favicon-192.png',
      },
    ],
    apple: '/branding/anomalie-apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a7c59',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        {children}

      </body>
    </html>
  )
}
