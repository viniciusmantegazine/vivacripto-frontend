import { TICKER_COINS } from '@/config/tickerCoins'
import { normalizeMarketResponse, type MarketCoin } from '@/lib/market'

const ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price'

/** Janela de cache da chamada à CoinGecko. Uma chamada por janela para o site inteiro. */
export const MARKET_REVALIDATE_SECONDS = 60

/**
 * Busca as cotações das moedas do ticker em uma única chamada à CoinGecko.
 *
 * O `fetch` do Next guarda a resposta por MARKET_REVALIDATE_SECONDS, então o
 * componente de servidor e a rota /api/market compartilham a mesma leitura.
 * Lança erro se a API responder fora de 2xx; quem chama decide o fallback.
 */
export async function getMarketData(): Promise<MarketCoin[]> {
  const params = new URLSearchParams({
    ids: TICKER_COINS.map((c) => c.id).join(','),
    vs_currencies: 'brl,usd',
    include_market_cap: 'true',
    include_24hr_change: 'true',
    include_last_updated_at: 'true',
  })

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: MARKET_REVALIDATE_SECONDS },
  })

  if (!res.ok) {
    throw new Error(`CoinGecko respondeu HTTP ${res.status}`)
  }

  const raw: unknown = await res.json()
  return normalizeMarketResponse(raw, TICKER_COINS)
}
