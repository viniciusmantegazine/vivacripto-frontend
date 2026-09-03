import { NextResponse } from 'next/server'
import { getMarketData, MARKET_REVALIDATE_SECONDS } from '@/lib/getMarketData'

/**
 * Proxy de cotações para o ticker (mesma origem, sem CORS).
 *
 * A rota é revalidada a cada MARKET_REVALIDATE_SECONDS e o Cache-Control deixa
 * a CDN da Vercel servir a resposta nesse intervalo. Em falha da CoinGecko
 * devolve 502 com lista vazia e sem cache; o cliente mantém os últimos preços.
 */
export const revalidate = 60

export async function GET() {
  try {
    const coins = await getMarketData()
    const updatedAt = coins.reduce((max, c) => Math.max(max, c.updatedAt), 0)
    return NextResponse.json(
      { coins, updatedAt },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${MARKET_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
        },
      }
    )
  } catch (error) {
    console.error('[api/market] falha ao buscar cotações:', error)
    return NextResponse.json(
      { coins: [], updatedAt: 0 },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
