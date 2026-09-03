import type { TickerCoin } from '../config/tickerCoins'

/** Uma moeda do ticker com cotação. `updatedAt` em milissegundos (epoch). */
export interface MarketCoin extends TickerCoin {
  priceBrl: number
  priceUsd: number
  /** variação percentual em 24 h, em BRL (ex.: 4.98 = +4,98 %) */
  change24h: number
  marketCapBrl: number
  updatedAt: number
}

interface RawEntry {
  brl?: unknown
  usd?: unknown
  brl_24h_change?: unknown
  brl_market_cap?: unknown
  last_updated_at?: unknown
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/**
 * Junta a resposta de `GET /simple/price` da CoinGecko com a lista de moedas do
 * config, preservando a ordem do config. Moeda ausente ou com campo inválido é
 * descartada em silêncio: a faixa mostra as que sobraram.
 */
export function normalizeMarketResponse(
  raw: unknown,
  coins: readonly TickerCoin[]
): MarketCoin[] {
  if (!raw || typeof raw !== 'object') return []
  const map = raw as Record<string, RawEntry | undefined>
  const out: MarketCoin[] = []

  for (const coin of coins) {
    const entry = map[coin.id]
    if (!entry || typeof entry !== 'object') continue

    const { brl, usd, brl_24h_change, brl_market_cap, last_updated_at } = entry
    if (
      !isFiniteNumber(brl) ||
      !isFiniteNumber(usd) ||
      !isFiniteNumber(brl_24h_change) ||
      !isFiniteNumber(brl_market_cap)
    ) {
      continue
    }

    out.push({
      ...coin,
      priceBrl: brl,
      priceUsd: usd,
      change24h: brl_24h_change,
      marketCapBrl: brl_market_cap,
      updatedAt: isFiniteNumber(last_updated_at) ? last_updated_at * 1000 : Date.now(),
    })
  }

  return out
}

// ---------------------------------------------------------------------------
// Formatação (pt-BR). Intl separa "R$" do número com NBSP; normalizamos para
// espaço comum para o texto ficar previsível em testes e em copy/paste.
// ---------------------------------------------------------------------------

const NBSP = / /g

function currency(code: 'BRL' | 'USD', value: number, opts: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code, ...opts })
    .format(value)
    .replace(NBSP, ' ')
}

function priceOptions(value: number): Intl.NumberFormatOptions {
  if (value >= 1000) return { maximumFractionDigits: 0 }
  if (value >= 1) return { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return { minimumFractionDigits: 2, maximumFractionDigits: 4 }
}

/** `R$ 413.710`, `R$ 12,50`, `R$ 0,0834` */
export function formatBrl(value: number): string {
  return currency('BRL', value, priceOptions(value))
}

/** `US$ 80.972`, `US$ 0,99` */
export function formatUsd(value: number): string {
  return currency('USD', value, priceOptions(value))
}

/** `R$ 8,3 tri`, `R$ 313 bi`, `R$ 950 mi` */
export function formatCompactBrl(value: number): string {
  return currency('BRL', value, { notation: 'compact' })
}

/** `+4,98%`, `-0,30%` */
export function formatChange(value: number): string {
  const abs = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${value >= 0 ? '+' : '-'}${abs}%`
}
