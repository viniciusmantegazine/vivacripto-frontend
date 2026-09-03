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
