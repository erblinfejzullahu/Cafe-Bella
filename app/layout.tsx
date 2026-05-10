import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Cafe Bella | Sheboygan's Favorite Breakfast & Lunch",
    template: '%s | Cafe Bella',
  },
  description:
    "Family-owned cafe serving delicious breakfast, skillets, burgers, and more in Sheboygan, WI. Dine-in, takeaway, or delivery available. Open daily until 4 PM.",
  keywords: ['cafe', 'breakfast', 'lunch', 'Sheboygan', 'Wisconsin', 'restaurant', 'skillets', 'burgers', 'order online'],
  openGraph: {
    title: "Cafe Bella | Sheboygan's Favorite Breakfast & Lunch",
    description: 'Family-owned cafe serving delicious breakfast, skillets, burgers, and more.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#4a6741',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${playfair.variable} ${sourceSans.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
