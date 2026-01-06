'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CryptoData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_1h_in_currency: number
  price_change_percentage_24h_in_currency: number
  total_volume: number
  market_cap: number
  fully_diluted_valuation: number
  image: string
}

export default function Top5Crypto() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchTop5Cryptos()
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchTop5Cryptos, 120000)
    return () => clearInterval(interval)
  }, [])

  async function fetchTop5Cryptos() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=1h,24h'
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data')
      }

      const data = await response.json()
      setCryptos(data)
      setLoading(false)
      setError(false)
    } catch (err) {
      console.error('Error fetching crypto data:', err)
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || cryptos.length === 0) {
    return null // Não mostrar nada se houver erro
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Top 5 Criptomoedas por FDV
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Atualizado agora
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                #
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Coin
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Price
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                1h %
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                24h %
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Volume 24h
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Market Cap
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                FDV
              </th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto, index) => (
              <tr
                key={crypto.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">
                  {index + 1}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {crypto.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                  {formatPrice(crypto.current_price)}
                </td>
                <td className={`py-4 px-4 text-right font-medium ${getPercentageColor(crypto.price_change_percentage_1h_in_currency || 0)}`}>
                  <div className="flex items-center justify-end gap-1">
                    {(crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercentage(crypto.price_change_percentage_1h_in_currency || 0)}
                  </div>
                </td>
                <td className={`py-4 px-4 text-right font-medium ${getPercentageColor(crypto.price_change_percentage_24h_in_currency || 0)}`}>
                  <div className="flex items-center justify-end gap-1">
                    {(crypto.price_change_percentage_24h_in_currency || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {formatPercentage(crypto.price_change_percentage_24h_in_currency || 0)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                  {formatLargeNumber(crypto.total_volume)}
                </td>
                <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                  {formatLargeNumber(crypto.market_cap)}
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                  {crypto.fully_diluted_valuation
                    ? formatLargeNumber(crypto.fully_diluted_valuation)
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {cryptos.map((crypto, index) => (
          <div
            key={crypto.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                #{index + 1}
              </span>
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {crypto.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                  {crypto.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(crypto.current_price)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">1h %</div>
                <div className={`font-medium ${getPercentageColor(crypto.price_change_percentage_1h_in_currency || 0)}`}>
                  {formatPercentage(crypto.price_change_percentage_1h_in_currency || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">24h %</div>
                <div className={`font-medium ${getPercentageColor(crypto.price_change_percentage_24h_in_currency || 0)}`}>
                  {formatPercentage(crypto.price_change_percentage_24h_in_currency || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">Volume 24h</div>
                <div className="text-gray-700 dark:text-gray-300">
                  {formatLargeNumber(crypto.total_volume)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1">Market Cap</div>
                <div className="text-gray-700 dark:text-gray-300">
                  {formatLargeNumber(crypto.market_cap)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500 dark:text-gray-400 mb-1">FDV</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {crypto.fully_diluted_valuation
                    ? formatLargeNumber(crypto.fully_diluted_valuation)
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Dados fornecidos por CoinGecko
      </div>
    </div>
  )
}
