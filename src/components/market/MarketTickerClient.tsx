'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  formatBrl,
  formatChange,
  formatCompactBrl,
  formatUsd,
  type MarketCoin,
} from '@/lib/market'

const REFRESH_MS = 60_000
const SECONDS_PER_COIN = 6

interface Props {
  /** cotações renderizadas no servidor; vazio se a CoinGecko falhou lá */
  initial: MarketCoin[]
}

/**
 * Faixa fina de cotações em marquee. Recebe o estado inicial do servidor e
 * atualiza a cada 60 s via /api/market enquanto a aba estiver visível.
 * Nunca desmonta: em falha total mostra uma mensagem na mesma altura, para a
 * página não deslocar.
 */
export default function MarketTickerClient({ initial }: Props) {
  const [coins, setCoins] = useState<MarketCoin[]>(initial)
  const [announcement, setAnnouncement] = useState('')
  const hasData = coins.length > 0

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      if (document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/market', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { coins?: MarketCoin[] }
        if (cancelled || !Array.isArray(data.coins) || data.coins.length === 0) return
        setCoins(data.coins)
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        setAnnouncement(`Cotações atualizadas às ${time}`)
      } catch {
        // mantém os últimos preços; tenta de novo no próximo ciclo
      }
    }

    if (initial.length === 0) refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [initial.length])

  return (
    <section
      aria-label="Cotações do mercado"
      className="h-9 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm"
    >
      <div className="container mx-auto px-4 h-full flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
          />
          <span className="font-semibold text-gray-700 dark:text-gray-300">Mercado</span>
        </div>

        {hasData ? (
          <TickerTrack coins={coins} />
        ) : (
          <p className="flex-1 min-w-0 truncate text-gray-500 dark:text-gray-400">
            Cotações indisponíveis no momento
          </p>
        )}

        <a
          href="https://www.coingecko.com/pt-br"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          dados: CoinGecko
        </a>

        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </div>
    </section>
  )
}

function TickerTrack({ coins }: { coins: MarketCoin[] }) {
  const duration = coins.length * SECONDS_PER_COIN
  return (
    // overflow-x-clip (e não hidden) para o tooltip poder sair por baixo da faixa.
    <div className="ticker-viewport relative flex-1 min-w-0 h-full overflow-x-clip">
      <div
        className="ticker-track flex items-center h-full w-max"
        style={{ animationDuration: `${duration}s` }}
      >
        <TickerList coins={coins} copy="a" />
        <TickerList coins={coins} copy="b" ariaHidden />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent"
      />
    </div>
  )
}

function TickerList({
  coins,
  copy,
  ariaHidden = false,
}: {
  coins: MarketCoin[]
  copy: 'a' | 'b'
  ariaHidden?: boolean
}) {
  return (
    // pr-6 igual ao gap: assim cada cópia tem exatamente metade da trilha e o
    // translateX(-50%) emenda sem pulo.
    <ul className="flex items-center gap-6 pr-6" aria-hidden={ariaHidden || undefined}>
      {coins.map((coin) => (
        <TickerItem key={coin.id} coin={coin} copy={copy} interactive={!ariaHidden} />
      ))}
    </ul>
  )
}

function TickerItem({
  coin,
  copy,
  interactive,
}: {
  coin: MarketCoin
  copy: 'a' | 'b'
  interactive: boolean
}) {
  const up = coin.change24h >= 0
  const tipId = `ticker-tip-${copy}-${coin.id}`

  return (
    <li className="group relative flex-shrink-0">
      <a
        href={coin.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={interactive ? undefined : -1}
        aria-describedby={interactive ? tipId : undefined}
        className="flex items-center gap-1.5 whitespace-nowrap rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Image src={coin.image} alt="" width={16} height={16} className="rounded-full" />
        <span className="font-semibold text-gray-900 dark:text-white">{coin.symbol}</span>
        <span className="text-gray-600 dark:text-gray-400">{formatBrl(coin.priceBrl)}</span>
        <span
          className={`text-xs font-medium ${
            up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {up ? '▲' : '▼'} {formatChange(coin.change24h)}
        </span>
      </a>

      <div
        role="tooltip"
        id={tipId}
        className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-1 z-40 w-max rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs px-3 py-2 shadow-lg"
      >
        <p className="font-semibold">{coin.name}</p>
        <p>{formatUsd(coin.priceUsd)}</p>
        <p>Market cap {formatCompactBrl(coin.marketCapBrl)}</p>
        {/* Depende do relógio do cliente: difere do HTML do servidor por design. */}
        <p className="opacity-70" suppressHydrationWarning>
          Atualizado há {minutesAgo(coin.updatedAt)}
        </p>
      </div>
    </li>
  )
}

function minutesAgo(updatedAt: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - updatedAt) / 60_000))
  return minutes < 1 ? 'menos de 1 min' : `${minutes} min`
}
