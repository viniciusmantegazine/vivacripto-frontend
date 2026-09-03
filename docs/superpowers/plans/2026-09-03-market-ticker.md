# Ticker de mercado — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a barra `Top5Crypto` da home por um ticker fino de 10 moedas em real, presente em todas as páginas, com dados servidos por proxy próprio com cache e sem salto de layout.

**Architecture:** Funções puras em `src/lib/market.ts` (normalização e formatação, testadas com o runner nativo do Node); `getMarketData()` faz uma chamada à CoinGecko com cache de 60 s do Next e alimenta tanto o componente de servidor `MarketTicker` (HTML inicial) quanto a rota `/api/market` (atualização a cada 60 s no cliente). `Header`, `MarketTicker` e `Footer` passam a viver no layout raiz; as 11 páginas devolvem só o `<main>`.

**Tech Stack:** Next 14.2 App Router, React 18, Tailwind 3.4, `Intl.NumberFormat` pt-BR, Node 22 `--test --experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-09-03-market-ticker-design.md`

**Repositório:** `~/git/vivacripto-frontend`. Todos os caminhos abaixo são relativos a ele. Commits sem hooks: `git -c core.hooksPath=/dev/null commit`. Todo commit termina com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `package.json` | modificar | script `test` |
| `tsconfig.json` | modificar | excluir `__tests__` do typecheck do `next build` |
| `src/config/tickerCoins.ts` | criar | lista fixa das 10 moedas |
| `src/lib/market.ts` | criar | tipos, `normalizeMarketResponse`, formatadores (puro, sem imports do projeto) |
| `src/lib/getMarketData.ts` | criar | chamada à CoinGecko com cache |
| `src/lib/__tests__/tickerCoins.test.ts` | criar | sanidade do config |
| `src/lib/__tests__/market.test.ts` | criar | normalização e formatação |
| `src/app/api/market/route.ts` | criar | GET proxy |
| `src/components/market/MarketTicker.tsx` | criar | RSC: dados iniciais |
| `src/components/market/MarketTickerClient.tsx` | criar | marquee, tooltip, refresh |
| `src/styles/globals.css` | modificar | keyframes e pausa do marquee |
| `src/app/layout.tsx` | modificar | Header + MarketTicker + children + Footer |
| 11 páginas em `src/app/**` | modificar | remover `<Header />`/`<Footer />` e imports |
| `src/components/crypto/Top5Crypto.tsx` | remover | substituído |

---

### Task 1: Infra de testes (runner nativo do Node)

**Files:**
- Modify: `package.json` (bloco `scripts`)
- Modify: `tsconfig.json` (`exclude`)

- [ ] **Step 1: Adicionar o script `test`**

Em `package.json`, o bloco `scripts` fica:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "node --test --experimental-strip-types \"src/lib/__tests__/*.test.ts\""
  },
```

- [ ] **Step 2: Excluir os testes do typecheck do build**

Os testes importam com extensão `.ts` (exigência do ESM no Node), o que o `tsc` do `next build` rejeitaria. Em `tsconfig.json`:

```json
  "exclude": ["node_modules", "src/**/__tests__/**"]
```

- [ ] **Step 3: Rodar sem testes e confirmar que o runner sobe**

Run: `mkdir -p src/lib/__tests__ && npm test`
Expected: saída do runner com `# tests 0` e `# pass 0` (ou aviso de nenhum arquivo encontrado), exit code 0 ou 1 sem erro de sintaxe. A pasta vazia não é commitada.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json
git -c core.hooksPath=/dev/null commit -m "chore(test): runner nativo do Node para funções puras

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Config das moedas

**Files:**
- Create: `src/config/tickerCoins.ts`
- Test: `src/lib/__tests__/tickerCoins.test.ts`

- [ ] **Step 1: Escrever o teste**

`src/lib/__tests__/tickerCoins.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TICKER_COINS } from '../../config/tickerCoins.ts'

test('tem 10 moedas com ids únicos', () => {
  assert.equal(TICKER_COINS.length, 10)
  assert.equal(new Set(TICKER_COINS.map((c) => c.id)).size, 10)
})

test('símbolos em maiúsculas e sem stablecoin', () => {
  for (const c of TICKER_COINS) {
    assert.equal(c.symbol, c.symbol.toUpperCase())
    assert.ok(!['USDT', 'USDC', 'DAI'].includes(c.symbol), `${c.symbol} é stablecoin`)
  }
})

test('imagem e url em https nos hosts esperados', () => {
  for (const c of TICKER_COINS) {
    assert.ok(c.image.startsWith('https://coin-images.coingecko.com/'), c.image)
    assert.equal(c.url, `https://www.coingecko.com/pt-br/moedas/${c.id}`)
  }
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL, `Cannot find module '.../src/config/tickerCoins.ts'`.

- [ ] **Step 3: Criar o config**

`src/config/tickerCoins.ts`:

```ts
/**
 * Moedas exibidas no ticker de mercado, na ordem de exibição.
 *
 * Lista editorial fixa (sem stablecoins). `id` é o id da CoinGecko, usado na
 * chamada de preços. `image` aponta para o CDN de ícones da CoinGecko, host já
 * liberado em next.config.js. Para trocar uma moeda basta editar aqui.
 */
export interface TickerCoin {
  /** id na CoinGecko (ex.: "bitcoin", "avalanche-2") */
  id: string
  /** símbolo em maiúsculas exibido na faixa */
  symbol: string
  name: string
  /** ícone 16px/40px em coin-images.coingecko.com */
  image: string
  /** página da moeda na CoinGecko em português */
  url: string
}

const ICON_BASE = 'https://coin-images.coingecko.com/coins/images'
const PAGE_BASE = 'https://www.coingecko.com/pt-br/moedas'

function coin(id: string, symbol: string, name: string, iconPath: string): TickerCoin {
  return { id, symbol, name, image: `${ICON_BASE}/${iconPath}`, url: `${PAGE_BASE}/${id}` }
}

export const TICKER_COINS: readonly TickerCoin[] = [
  coin('bitcoin', 'BTC', 'Bitcoin', '1/small/bitcoin.png'),
  coin('ethereum', 'ETH', 'Ethereum', '279/small/ethereum.png'),
  coin('solana', 'SOL', 'Solana', '4128/small/solana.png'),
  coin('binancecoin', 'BNB', 'BNB', '825/small/bnb-icon2_2x.png'),
  coin('ripple', 'XRP', 'XRP', '44/small/xrp-symbol-white-128.png'),
  coin('cardano', 'ADA', 'Cardano', '975/small/cardano.png'),
  coin('dogecoin', 'DOGE', 'Dogecoin', '5/small/dogecoin.png'),
  coin('avalanche-2', 'AVAX', 'Avalanche', '12559/small/Avalanche_Circle_RedWhite_Trans.png'),
  coin('chainlink', 'LINK', 'Chainlink', '877/small/Chainlink_Logo_500.png'),
  coin('polkadot', 'DOT', 'Polkadot', '12171/small/polkadot.jpg'),
]
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: `# pass 3`, `# fail 0`.

- [ ] **Step 5: Conferir que os 10 ícones respondem 200**

```bash
node --experimental-strip-types -e "
import('./src/config/tickerCoins.ts').then(async ({ TICKER_COINS }) => {
  for (const c of TICKER_COINS) {
    const r = await fetch(c.image, { method: 'HEAD' })
    console.log(r.status, c.symbol, c.image)
  }
})"
```
Expected: dez linhas começando com `200`.

- [ ] **Step 6: Commit**

```bash
git add src/config/tickerCoins.ts src/lib/__tests__/tickerCoins.test.ts
git -c core.hooksPath=/dev/null commit -m "feat(ticker): config editorial das 10 moedas

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Normalização e formatação (puras)

**Files:**
- Create: `src/lib/market.ts`
- Test: `src/lib/__tests__/market.test.ts`

Este arquivo não pode importar nada do projeto além de tipos (o Node não resolve `@/`). Tipos são apagados pelo `--experimental-strip-types`.

- [ ] **Step 1: Escrever os testes**

`src/lib/__tests__/market.test.ts`:

```ts
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeMarketResponse,
  formatBrl,
  formatUsd,
  formatCompactBrl,
  formatChange,
} from '../market.ts'
import type { TickerCoin } from '../../config/tickerCoins.ts'

const COINS: TickerCoin[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'https://x/btc.png', url: 'https://x/btc' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: 'https://x/eth.png', url: 'https://x/eth' },
]

const RAW = {
  ethereum: { brl: 12744.1, usd: 2494.29, brl_24h_change: 4.61, brl_market_cap: 1.55e12, last_updated_at: 1788454440 },
  bitcoin: { brl: 413710, usd: 80972, brl_24h_change: 4.98, brl_market_cap: 8.3e12, last_updated_at: 1788454440 },
}

describe('normalizeMarketResponse', () => {
  test('preserva a ordem do config, não a da resposta', () => {
    const out = normalizeMarketResponse(RAW, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC', 'ETH'])
  })

  test('mapeia os campos e converte last_updated_at para ms', () => {
    const [btc] = normalizeMarketResponse(RAW, COINS)
    assert.equal(btc.priceBrl, 413710)
    assert.equal(btc.priceUsd, 80972)
    assert.equal(btc.change24h, 4.98)
    assert.equal(btc.marketCapBrl, 8.3e12)
    assert.equal(btc.updatedAt, 1788454440000)
    assert.equal(btc.name, 'Bitcoin')
    assert.equal(btc.url, 'https://x/btc')
  })

  test('descarta moeda ausente na resposta sem derrubar as outras', () => {
    const out = normalizeMarketResponse({ bitcoin: RAW.bitcoin }, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC'])
  })

  test('descarta moeda com campo não numérico', () => {
    const raw = { ...RAW, ethereum: { ...RAW.ethereum, brl: 'n/a' } }
    const out = normalizeMarketResponse(raw, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC'])
  })

  test('resposta vazia, nula ou não-objeto devolve []', () => {
    assert.deepEqual(normalizeMarketResponse({}, COINS), [])
    assert.deepEqual(normalizeMarketResponse(null, COINS), [])
    assert.deepEqual(normalizeMarketResponse('erro', COINS), [])
  })
})

describe('formatadores pt-BR', () => {
  test('formatBrl: sem centavos acima de 1000, 2 casas entre 1 e 1000, até 4 abaixo de 1', () => {
    assert.equal(formatBrl(413710), 'R$ 413.710')
    assert.equal(formatBrl(12744.1), 'R$ 12.744')
    assert.equal(formatBrl(12.5), 'R$ 12,50')
    assert.equal(formatBrl(0.0834), 'R$ 0,0834')
    assert.equal(formatBrl(0.5), 'R$ 0,50')
  })

  test('formatUsd segue a mesma regra com US$', () => {
    assert.equal(formatUsd(80972), 'US$ 80.972')
    assert.equal(formatUsd(2494.29), 'US$ 2.494')
    assert.equal(formatUsd(0.99), 'US$ 0,99')
  })

  test('formatCompactBrl usa mil/mi/bi/tri', () => {
    assert.equal(formatCompactBrl(8.3e12), 'R$ 8,3 tri')
    assert.equal(formatCompactBrl(312797415618), 'R$ 313 bi')
    assert.equal(formatCompactBrl(61e9), 'R$ 61 bi')
    assert.equal(formatCompactBrl(950e6), 'R$ 950 mi')
  })

  test('formatChange tem sinal e 2 casas', () => {
    assert.equal(formatChange(4.98), '+4,98%')
    assert.equal(formatChange(-0.3), '-0,30%')
    assert.equal(formatChange(0), '+0,00%')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL em `market.test.ts`, `Cannot find module '.../src/lib/market.ts'`. Os 3 testes de `tickerCoins` seguem passando.

- [ ] **Step 3: Implementar**

`src/lib/market.ts`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: `# pass 12`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/market.ts src/lib/__tests__/market.test.ts
git -c core.hooksPath=/dev/null commit -m "feat(ticker): normalização da CoinGecko e formatadores pt-BR

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Busca com cache e rota `/api/market`

**Files:**
- Create: `src/lib/getMarketData.ts`
- Create: `src/app/api/market/route.ts`

Sem teste unitário (é I/O). Verificação manual no Step 3.

- [ ] **Step 1: Criar `getMarketData`**

`src/lib/getMarketData.ts`:

```ts
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
```

- [ ] **Step 2: Criar a rota**

`src/app/api/market/route.ts`:

```ts
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
```

- [ ] **Step 3: Verificar no dev server**

```bash
npx next dev -p 3006 > /tmp/ticker-dev.log 2>&1 &
sleep 8
curl -s http://127.0.0.1:3006/api/market | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['coins']), [c['symbol'] for c in d['coins']], d['coins'][0]['priceBrl'])"
curl -s -D - -o /dev/null http://127.0.0.1:3006/api/market | grep -i cache-control
kill %1
```
Expected: `10 ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT'] <número>` e `cache-control: public, s-maxage=60, stale-while-revalidate=300`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/getMarketData.ts src/app/api/market/route.ts
git -c core.hooksPath=/dev/null commit -m "feat(ticker): getMarketData com cache de 60s e rota /api/market

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Componentes do ticker e CSS do marquee

**Files:**
- Create: `src/components/market/MarketTicker.tsx`
- Create: `src/components/market/MarketTickerClient.tsx`
- Modify: `src/styles/globals.css` (acrescentar no fim)

- [ ] **Step 1: CSS do marquee**

Acrescentar ao final de `src/styles/globals.css`:

```css
/* ---------------------------------------------------------------------------
   Ticker de mercado (src/components/market/MarketTickerClient.tsx)
   A trilha contém a lista duas vezes; deslocar -50% e recomeçar dá um loop
   contínuo sem emenda. Duração é definida inline (6 s por moeda).
   --------------------------------------------------------------------------- */
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.ticker-track {
  animation-name: ticker-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.ticker-viewport:hover .ticker-track,
.ticker-viewport:focus-within .ticker-track {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation: none;
  }
  /* Sem animação a faixa vira rolagem manual e a cópia duplicada é dispensável. */
  .ticker-viewport {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .ticker-track > [aria-hidden='true'] {
    display: none;
  }
}
```

- [ ] **Step 2: Componente de cliente**

`src/components/market/MarketTickerClient.tsx`:

```tsx
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
```

- [ ] **Step 3: Componente de servidor**

`src/components/market/MarketTicker.tsx`:

```tsx
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
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sem erros. (Se reclamar de `overflow-x-clip` não existe: é classe Tailwind, não TS. Se reclamar de `next` em `RequestInit`, o `next-env.d.ts` não está incluído; rodar `npx next build` no lugar.)

- [ ] **Step 5: Commit**

```bash
git add src/components/market/MarketTicker.tsx src/components/market/MarketTickerClient.tsx src/styles/globals.css
git -c core.hooksPath=/dev/null commit -m "feat(ticker): componentes do marquee com tooltip e refresh de 60s

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Header, ticker e Footer no layout; páginas só com `<main>`

**Files:**
- Modify: `src/app/layout.tsx`
- Modify (remover `<Header />`, `<Footer />` e seus imports): `src/app/page.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, `src/app/busca/page.tsx`, `src/app/contato/page.tsx`, `src/app/sobre/page.tsx`, `src/app/termos/page.tsx`, `src/app/privacidade/page.tsx`, `src/app/posts/[slug]/page.tsx`, `src/app/categoria/[slug]/page.tsx`, `src/app/categoria/[slug]/pagina/[page]/page.tsx`
- Delete: `src/components/crypto/Top5Crypto.tsx`

- [ ] **Step 1: Layout**

Em `src/app/layout.tsx`, acrescentar aos imports:

```tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MarketTicker from '@/components/market/MarketTicker'
```

e trocar o conteúdo do `ThemeProvider`:

```tsx
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <MarketTicker />
          {children}
          <Footer />
        </ThemeProvider>
```

- [ ] **Step 2: Remover Header/Footer das 11 páginas**

Em cada arquivo listado: apagar as duas linhas `import Header from '@/components/layout/Header'` e `import Footer from '@/components/layout/Footer'`, apagar `<Header />` e `<Footer />` (e a linha em branco que os acompanha). Onde o retorno era `<> <Header /> <main>…</main> <Footer /> </>`, o fragmento pode ficar ou sair; se sair, `<main>` passa a ser a raiz do retorno.

Comando para localizar o que falta depois da edição manual:

```bash
grep -rn "Header\|Footer" src/app --include='*.tsx' | grep -v "src/app/layout.tsx"
```
Expected: nenhuma linha.

- [ ] **Step 3: Remover o Top5Crypto**

Em `src/app/page.tsx`: apagar `import Top5Crypto from '@/components/crypto/Top5Crypto'` e o bloco

```tsx
              {/* Top 5 Cryptos */}
              <Top5Crypto />

```

Em `src/app/loading.tsx`: apagar o bloco `{/* Top 5 Crypto Skeleton */} <div className="mb-8">…</div>` inteiro (o ticker agora está no layout e não some durante o loading).

```bash
git rm -q src/components/crypto/Top5Crypto.tsx
rmdir src/components/crypto 2>/dev/null || true
grep -rn "Top5Crypto" src
```
Expected: `grep` sem resultado.

- [ ] **Step 4: Build de produção**

Run: `npm run build 2>&1 | tail -30`
Expected: build conclui, tabela de rotas inclui `ƒ /api/market` (ou `○` com revalidate) e nenhuma linha de erro/warning de tipo. Avisos de "Falha ao buscar posts" são esperados sem backend no ar e não impedem o build.

- [ ] **Step 5: Commit**

```bash
git add -A src/app src/components
git -c core.hooksPath=/dev/null commit -m "feat(ticker): Header, ticker e Footer no layout raiz; remove Top5Crypto

As 11 páginas deixam de repetir Header e Footer. O ticker de mercado
passa a aparecer em todas elas, inclusive 404 e busca.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Verificação de ponta a ponta

**Files:** nenhum novo. Usa o mock de posts em `/private/tmp/claude-502/-Users-viniciusmantegazine-git-vivacripto-backend/0e626241-6b60-4eff-ab1f-12b89a1c1582/scratchpad/mock_backend.py` (porta 8017), criado no fix das capas. Se não existir mais, o build ainda funciona: a home renderiza vazia e o ticker continua verificável em `/sobre`.

- [ ] **Step 1: Build contra o mock e servir**

```bash
S=/private/tmp/claude-502/-Users-viniciusmantegazine-git-vivacripto-backend/0e626241-6b60-4eff-ab1f-12b89a1c1582/scratchpad
python3 $S/mock_backend.py > $S/mock.log 2>&1 &
NEXT_PUBLIC_API_URL=http://127.0.0.1:8017/api/v1 npm run build > $S/build.log 2>&1; echo "build exit: $?"
NEXT_PUBLIC_API_URL=http://127.0.0.1:8017/api/v1 npx next start -p 3005 > $S/next.log 2>&1 &
for i in $(seq 1 30); do curl -s -o /dev/null http://127.0.0.1:3005/ && break; sleep 1; done
```

- [ ] **Step 2: Inspecionar home, post, 404 e sobre**

```bash
for p in / /sobre /posts/nao-existe-xyz "$(curl -s http://127.0.0.1:3005/ | grep -oE 'href="/posts/[^"]+"' | head -1 | sed 's/href=//;s/"//g')"; do
  html=$(curl -s "http://127.0.0.1:3005$p")
  echo "$p  headers=$(echo "$html" | grep -o '<header' | wc -l | tr -d ' ')  footers=$(echo "$html" | grep -o '<footer' | wc -l | tr -d ' ')  ticker=$(echo "$html" | grep -c 'aria-label="Cotações do mercado"')  moedas=$(echo "$html" | grep -o 'ticker-tip-a-' | wc -l | tr -d ' ')  next_image=$(echo "$html" | grep -c '/_next/image')  top5=$(echo "$html" | grep -c 'Top 5')"
done
```
Expected, em cada linha: `headers=1 footers=1 ticker=1 moedas=10 next_image=0 top5=0`. Na 404 também.

- [ ] **Step 3: Conferir a rota e o cache compartilhado**

```bash
curl -s -D - http://127.0.0.1:3005/api/market -o $S/m1.json | grep -i "cache-control\|HTTP/"
sleep 2
curl -s http://127.0.0.1:3005/api/market -o $S/m2.json
python3 -c "import json;a=json.load(open('$S/m1.json'));b=json.load(open('$S/m2.json'));print('coins:',len(a['coins']),'mesmo updatedAt em 2 chamadas seguidas:',a['updatedAt']==b['updatedAt'])"
```
Expected: `HTTP/1.1 200`, `cache-control: public, s-maxage=60, stale-while-revalidate=300`, `coins: 10 mesmo updatedAt em 2 chamadas seguidas: True`.

- [ ] **Step 4: Encerrar e registrar**

```bash
kill %1 %2 2>/dev/null; wait 2>/dev/null
grep -iE "warn|error" $S/next.log | grep -v "Falha ao buscar posts" | head
```
Expected: nenhuma linha.

Marcar todos os checkboxes deste plano e commitar o plano atualizado:

```bash
git add docs/superpowers/plans/2026-09-03-market-ticker.md
git -c core.hooksPath=/dev/null commit -m "docs: plano do ticker executado

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Autoavaliação do plano contra o spec

| Requisito do spec | Task |
|---|---|
| Faixa fina, todas as páginas, marquee | 5 (componente), 6 (layout) |
| Lista fixa de 10 moedas em config | 2 |
| Real na faixa; dólar e market cap no tooltip | 5 |
| Clique abre CoinGecko em nova aba | 5 (`TickerItem`) |
| Painel "Mais" removido | 6 (Top5Crypto apagado) |
| Híbrido servidor + `/api/market` a cada 60 s | 4, 5 |
| Cache único de 60 s | 4 (`next.revalidate` + `revalidate` da rota) |
| Sem salto de layout / nunca desmonta | 5 (`h-9`, estado vazio) |
| Pausa em hover/foco, reduced-motion | 5 (CSS) |
| `aria-live`, `aria-describedby`, `role=tooltip` | 5 |
| Atribuição CoinGecko | 5 (link "dados: CoinGecko") |
| Testes de normalização e formatação | 1, 2, 3 |
| Verificação e2e | 7 |
