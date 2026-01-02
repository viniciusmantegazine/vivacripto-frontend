import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VivaCripto - Notícias sobre Criptomoedas',
  description: 'Portal de notícias sobre criptomoedas, Bitcoin, Ethereum e o mercado cripto.',
  metadataBase: new URL('https://vivacripto.com.br'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
