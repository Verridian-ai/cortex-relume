import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { QueryProvider } from '@/components/query-provider'
import { AuthGuard } from '@/components/auth-guard'
import { usePathname } from 'next/navigation'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cortex Relume - AI-Powered Website Design Accelerator',
    template: '%s | Cortex Relume',
  },
  description: 'Create sitemaps, wireframes, and style guides in minutes using AI. The ultimate design accelerator for designers and developers.',
  keywords: [
    'AI website builder',
    'wireframe generator',
    'sitemap creation',
    'design system',
    'GPT-5',
    'React components',
    'Figma integration',
    'Webflow components',
    'website design',
    'UI components',
    'design automation',
  ],
  authors: [{ name: 'Cortex Relume Team' }],
  creator: 'Cortex Relume',
  publisher: 'Cortex Relume',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Cortex Relume',
    title: 'Cortex Relume - AI-Powered Website Design Accelerator',
    description: 'Create sitemaps, wireframes, and style guides in minutes using AI. The ultimate design accelerator for designers and developers.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cortex Relume - AI-Powered Website Design Accelerator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cortexrelume',
    creator: '@cortexrelume',
    title: 'Cortex Relume - AI-Powered Website Design Accelerator',
    description: 'Create sitemaps, wireframes, and style guides in minutes using AI.',
    images: ['/images/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#0ea5e9',
    'theme-color': '#0ea5e9',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  {children}
                </div>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}