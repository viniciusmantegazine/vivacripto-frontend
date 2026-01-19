'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'

interface CryptoData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h_in_currency: number
  market_cap: number
  image: string
}

export default function Top5Crypto() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchTop5Cryptos()
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchTop5Cryptos, 120000)
    return () => clearInterval(interval)
  }, [])

  async function fetchTop5Cryptos() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h'
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data')
      }

      const data = await response.json()
      setCryptos(data)
      setLoading(false)
      setError(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  function formatPrice(price: number): string {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
  }

  function formatLargeNumber(num: number): string {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`
    }
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    }
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  function formatPercentage(percentage: number): string {
    const formatted = Math.abs(percentage).toFixed(2)
    return `${percentage >= 0 ? '+' : '-'}${formatted}%`
  }

  function getPercentageColor(percentage: number): string {
    if (percentage >= 0) {
      return 'text-green-600 dark:text-green-400'
    }
    return 'text-red-600 dark:text-red-400'
  }

  function getPercentageBgColor(percentage: number): string {
    if (percentage >= 0) {
      return 'bg-green-50 dark:bg-green-900/20'
    }
    return 'bg-red-50 dark:bg-red-900/20'
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 mb-6">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex items-center gap-6">
            <div className="h-4 bg-white/30 rounded w-32"></div>
            <div className="h-4 bg-white/30 rounded w-24"></div>
            <div className="h-4 bg-white/30 rounded w-24"></div>
            <div className="h-4 bg-white/30 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || cryptos.length === 0) {
    return null // Não mostrar nada se houver erro
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="container mx-auto px-4">
        {/* Ticker Compacto - Sempre Visível */}
        <div className="py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Label */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:inline">
                Mercado
              </span>
            </div>

            {/* Cryptos Horizontais */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-4 md:gap-6">
                {cryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {crypto.symbol.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(crypto.current_price)}
                      </span>
                      <span
                        className={`text-xs font-medium ${getPercentageColor(
                          crypto.price_change_percentage_24h_in_currency || 0
                        )}`}
                      >
                        {formatPercentage(
                          crypto.price_change_percentage_24h_in_currency || 0
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão Expandir */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex-shrink-0"
            >
              <span className="hidden sm:inline">
                {expanded ? 'Menos' : 'Mais'}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detalhes Expandidos - Opcional */}
        {expanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {cryptos.map((crypto, index) => (
                <div
                  key={crypto.id}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {crypto.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {crypto.symbol}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Preço
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(crypto.current_price)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        24h
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold ${getPercentageBgColor(
                          crypto.price_change_percentage_24h_in_currency || 0
                        )} ${getPercentageColor(
                          crypto.price_change_percentage_24h_in_currency || 0
                        )}`}
                      >
                        {(crypto.price_change_percentage_24h_in_currency || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatPercentage(
                          crypto.price_change_percentage_24h_in_currency || 0
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Market Cap
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatLargeNumber(crypto.market_cap)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Dados fornecidos por CoinGecko • Atualizado a cada 2 minutos
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
