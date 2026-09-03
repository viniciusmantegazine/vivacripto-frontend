import { getMarketData } from '@/lib/getMarketData'
import MarketTickerClient from './MarketTickerClient'
import type { MarketCoin } from '@/lib/market'

/**
 * Entrega ao cliente as cotações já no HTML (sem skeleton, sem salto).
 * Se a CoinGecko falhar aqui, o cliente busca sozinho ao montar.
 */
export default async function MarketTicker() {
  let initial: MarketCoin[] = []
  try {
    initial = await getMarketData()
  } catch (error) {
    console.error('[MarketTicker] falha ao buscar cotações no servidor:', error)
  }
  return <MarketTickerClient initial={initial} />
}
