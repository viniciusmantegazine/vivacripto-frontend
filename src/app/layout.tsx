import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'VivaCripto - Notícias sobre Criptomoedas',
    template: '%s | VivaCripto',
  },
  description: 'Portal de notícias sobre criptomoedas, Bitcoin, Ethereum e o mercado cripto. Informações atualizadas sobre preços, tendências e análises.',
  metadataBase: new URL('https://vivacripto.com.br'),
  keywords: ['criptomoedas', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'mercado cripto', 'notícias crypto'],
  authors: [{ name: 'VivaCripto' }],
  creator: 'VivaCripto',
  publisher: 'VivaCripto',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'VivaCripto',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@vivacripto',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:font-medium"
        >
          Pular para o conteúdo principal
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
