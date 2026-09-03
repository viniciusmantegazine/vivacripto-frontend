# Ticker de mercado — design

**Data:** 2026-09-03
**Substitui:** `src/components/crypto/Top5Crypto.tsx` (barra "Mercado" da home)

## Objetivo

Trocar a barra de preços da home por um ticker fino, presente em todas as páginas,
com moedas escolhidas editorialmente, preço em real, dólar e market cap no tooltip,
dados servidos por um proxy próprio com cache, e sem salto de layout na primeira pintura.

## Decisões tomadas com o usuário

| Tema | Decisão |
|---|---|
| Onde vive | Faixa fina abaixo do header, em todas as páginas, marquee contínuo |
| Moedas | Lista fixa em config: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, LINK, DOT |
| Moeda de cotação | Real (R$) na faixa; dólar e market cap só no tooltip |
| Tooltip | Hover/foco no desktop; no mobile não há tooltip (o toque navega) |
| Clique | Abre a página da moeda na CoinGecko em nova aba (`noopener noreferrer`) |
| Painel "Mais" | Removido |
| Dados | Híbrido: servidor entrega estado inicial; cliente atualiza a cada 60 s via `/api/market` |

## Estrutura

### Layout raiz (`src/app/layout.tsx`)

Passa a renderizar, dentro do `ThemeProvider`:

```
<Header />
<MarketTicker />
{children}
<Footer />
```

As 11 páginas que hoje repetem `<Header />` e `<Footer />` ao redor do `<main>`
(home, posts, categoria, categoria/pagina, busca, contato, sobre, termos,
privacidade, not-found, loading) passam a devolver só o `<main>` e seu conteúdo.
Nada muda visualmente além do ticker novo.

### Arquivos novos

**`src/config/tickerCoins.ts`**
Array `TICKER_COINS` de `{ id, symbol, name, image, url }`. `id` é o id da CoinGecko
(`bitcoin`, `ethereum`, ...). `image` é a URL do ícone em `coin-images.coingecko.com`
(host já liberado em `next.config.js`). `url` é `https://www.coingecko.com/pt/moedas/<id>`.
A ordem do array é a ordem na faixa.

**`src/lib/market.ts`**
- `type MarketCoin = { id, symbol, name, image, url, priceBrl, priceUsd, change24h, marketCapBrl, updatedAt }`
- `getMarketData(): Promise<MarketCoin[]>`: uma chamada a
  `https://api.coingecko.com/api/v3/simple/price?ids=<ids>&vs_currencies=brl,usd&include_market_cap=true&include_24hr_change=true&include_last_updated_at=true`
  com `next: { revalidate: 60 }`. Junta a resposta com `TICKER_COINS` preservando a ordem.
  Moeda ausente ou com campo não numérico é descartada, não derruba a lista.
  Lança erro se a resposta não for `ok` ou não for objeto.
- `normalizeMarketResponse(raw, coins)`: função pura que faz a junção acima. É o que os
  testes cobrem.
- `formatBrl(n)`, `formatUsd(n)`, `formatCompactBrl(n)`, `formatChange(n)`: formatação em
  `pt-BR`. Preço ≥ 1000 sem centavos; entre 1 e 1000 com 2 casas; abaixo de 1 com até 4
  casas significativas. Variação com sinal e 2 casas (`+4,98%`, `-0,31%`).

**`src/app/api/market/route.ts`**
`GET` que devolve `{ coins: MarketCoin[], updatedAt }` de `getMarketData()`, com
`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. Em falha, responde
`502 { coins: [] }`. Sem parâmetros de entrada.

**`src/components/market/MarketTicker.tsx`** (servidor)
Chama `getMarketData()` em `try/catch`; renderiza `<MarketTickerClient initial={coins} />`.
Em falha, `initial=[]` e o cliente tenta sozinho.

**`src/components/market/MarketTickerClient.tsx`** (cliente)
- Estado: `coins` (inicia com `initial`), `updatedAt`.
- Efeito: a cada 60 s, se a aba estiver visível, `fetch('/api/market')`; em sucesso
  substitui `coins`; em falha mantém o que tinha. Faz uma busca imediata ao montar
  apenas se `initial` veio vazio.
- Render: `<section aria-label="Cotações do mercado">` com altura fixa (`h-9`),
  fundo `gray-50`/`gray-900`, `border-b`. À esquerda, rótulo "Mercado" com ponto verde
  (oculto abaixo de `sm`). No meio, a trilha do marquee. À direita, "dados: CoinGecko"
  como link (oculto abaixo de `md`), que cumpre a atribuição exigida pela API gratuita.
- Marquee: a lista é renderizada duas vezes em sequência dentro de uma trilha com
  `animation: ticker-scroll Ns linear infinite` e `transform: translateX(-50%)` no fim.
  `N = 6 s × número de moedas` (60 s para 10). Pausa em `:hover` e `:focus-within`.
  Sob `prefers-reduced-motion: reduce`, sem animação e a trilha vira `overflow-x: auto`.
  A cópia duplicada recebe `aria-hidden="true"`. Bordas com gradiente para o fundo.
- Item: `<a href={url} target="_blank" rel="noopener noreferrer">` com ícone 16 px
  (`next/image`, `unoptimized` não é mais necessário: o loader devolve a URL intacta),
  símbolo em negrito, preço em real, variação colorida (`green-600`/`red-600`, com
  `▲`/`▼` para não depender só da cor).
- Tooltip: `<div role="tooltip" id=...>` posicionado abaixo do item, visível em
  `group-hover` e `group-focus-within`; o link aponta para ele com `aria-describedby`.
  Conteúdo: nome, preço em dólar, market cap em real compacto (`R$ 8,3 tri`),
  "atualizado há N min".
- Estado vazio (sem dados no servidor e falha no cliente): mesma faixa, mesma altura,
  texto apagado "Cotações indisponíveis no momento". Nunca desmonta, para não deslocar
  a página.
- Preços atualizados são anunciados com `aria-live="polite"` num `span` visualmente
  oculto que diz "Cotações atualizadas às HH:MM", uma vez por atualização.

### Remoções

`src/components/crypto/Top5Crypto.tsx` e sua importação/uso em `src/app/page.tsx`.
Se a pasta `components/crypto` ficar vazia, é removida.

## Fluxo de dados

```
CoinGecko  ──(1 chamada / 60 s, cache do Next)──▶ getMarketData()
                                                     │            │
                                     MarketTicker (RSC)      /api/market (GET)
                                            │                        ▲
                                    initial props                    │ a cada 60 s
                                            ▼                        │
                                    MarketTickerClient ──────────────┘
```

Uma instância do cache serve o HTML inicial e a rota; o número de leitores não altera
o volume de chamadas à CoinGecko.

## Tratamento de erros

| Falha | Comportamento |
|---|---|
| CoinGecko fora no servidor | HTML sai com `initial=[]`; cliente busca ao montar |
| CoinGecko fora no cliente | Mantém últimos preços; tenta no próximo ciclo |
| Nunca houve dado | Faixa com "Cotações indisponíveis no momento", altura preservada |
| Moeda faltando na resposta | Só ela some da faixa |
| Aba em segundo plano | Ciclo pula a busca; retoma quando a aba volta |

## Testes

O frontend não tem framework de testes. Usar o runner nativo do Node
(`node --test --experimental-strip-types`) sobre funções puras, em `src/lib/__tests__/`:

- `normalizeMarketResponse`: ordem preservada, moeda ausente descartada, campo não
  numérico descartado, resposta vazia devolve `[]`.
- Formatadores: `formatBrl(413710) === 'R$ 413.710'`, `formatBrl(12.5) === 'R$ 12,50'`,
  `formatBrl(0.0834) === 'R$ 0,0834'`, `formatChange(4.98) === '+4,98%'`,
  `formatChange(-0.3) === '-0,30%'`, `formatCompactBrl(8.3e12) === 'R$ 8,3 tri'`.
- `TICKER_COINS`: ids únicos, `image` e `url` em https.

Script `npm test` adicionado ao `package.json`. Verificação de ponta a ponta: build de
produção contra o mock da API de posts (já usado no fix das capas) e inspeção do HTML da
home e de um post: faixa presente com 10 moedas, sem `/_next/image`, nenhum `<Header>`
duplicado.

## Fora de escopo

Seletor de moeda de cotação, gráficos/sparklines, ticker no backend Python,
persistência de preferências.
