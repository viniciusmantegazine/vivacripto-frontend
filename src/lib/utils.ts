/**
 * Remove Markdown syntax from text
 * Useful for displaying titles and excerpts without formatting marks
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headers (###, ##, #)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    // Remove italic (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove inline code `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove strikethrough ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Format date to Brazilian Portuguese
 */
/**
 * Clean text for meta description (Open Graph, Twitter Cards)
 * Removes prefixes, markdown syntax, and limits to 150 characters
 */
export function cleanMetaDescription(text: string): string {
  const cleaned = text
    // Remove common prefixes like "Título:", "**Título:", etc.
    .replace(/^\*\*?\s*Título\s*:\s*/i, '')
    .replace(/^Título\s*:\s*/i, '')
    // Remove markdown syntax
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // Limit to 150 characters and add ellipsis only if truncated
  if (cleaned.length > 150) {
    return cleaned.substring(0, 150) + '...'
  }
  return cleaned
}

/**
 * Remove duplicate title from content
 * Removes first paragraph if it contains the title
 */
export function removeDuplicateTitle(content: string, title: string): string {
  const lines = content.split('\n')
  if (lines.length === 0) return content
  
  // Clean the title for comparison
  const cleanTitle = stripMarkdown(title).toLowerCase()
  
  // Check first few lines for duplicate title
  const firstLine = stripMarkdown(lines[0]).toLowerCase()
  
  // If first line contains the title or starts with "Título:"
  if (
    firstLine.includes(cleanTitle) ||
    firstLine.startsWith('título:') ||
    firstLine.match(/^\*\*título:/i)
  ) {
    // Remove first line and return the rest
    return lines.slice(1).join('\n').trim()
  }
  
  return content
}

export function formatDate(dateString: string, format: 'short' | 'long' = 'long'): string {
  const date = new Date(dateString)

  if (format === 'short') {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * SECURITY: Sanitize search query to prevent injection attacks
 * Removes potentially dangerous characters and limits length
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }

  return query
    // Remove HTML/script tags
    .replace(/<[^>]*>/g, '')
    // Remove potential SQL injection patterns
    .replace(/['";\\]/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Limit length to prevent DoS
    .substring(0, 200)
    .trim()
}

/**
 * SECURITY: Escape string for safe JSON-LD embedding
 * Prevents XSS through structured data
 */
export function escapeJsonLd(value: string | null | undefined): string {
  if (!value) return ''

  return value
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Escape quotes for JSON context
    .replace(/"/g, '&quot;')
    // Remove script injection attempts
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

/**
 * Nomes próprios e siglas que devem manter capitalização
 * Inclui: criptomoedas, empresas, siglas, países/estados
 */
const PROPER_NOUNS = [
  // Criptomoedas principais
  'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'XRP', 'Dogecoin', 'Shiba Inu',
  'Litecoin', 'Polkadot', 'Avalanche', 'Polygon', 'Chainlink', 'Uniswap',
  'Aave', 'Cosmos', 'Tether', 'USDC', 'USDT', 'BNB', 'Tron', 'Stellar',
  'Monero', 'Algorand', 'VeChain', 'Hedera', 'Filecoin', 'Aptos', 'Sui',
  'Arbitrum', 'Optimism', 'Base', 'Fantom', 'Near', 'Internet Computer',
  // Siglas e termos técnicos
  'DeFi', 'NFT', 'NFTs', 'ETF', 'ETFs', 'DAO', 'DAOs', 'DEX', 'CEX',
  'API', 'CEO', 'CFO', 'CTO', 'IPO', 'ICO', 'IDO', 'IEO', 'TVL', 'APY', 'APR',
  'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE',
  'L1', 'L2', 'Web3', 'GameFi', 'SocialFi', 'ReFi', 'CeFi', 'TradFi',
  // Órgãos reguladores
  'SEC', 'CFTC', 'FBI', 'DOJ', 'IRS', 'FED', 'BCE', 'FMI', 'CVM', 'Bacen',
  // Empresas e exchanges
  'Binance', 'Coinbase', 'Kraken', 'FTX', 'Gemini', 'Bitfinex', 'Bitstamp',
  'OKX', 'Bybit', 'KuCoin', 'Huobi', 'Gate.io', 'Mercado Bitcoin',
  'Goldman Sachs', 'JPMorgan', 'BlackRock', 'Fidelity', 'Grayscale',
  'MicroStrategy', 'Tesla', 'PayPal', 'Visa', 'Mastercard', 'Stripe',
  'Circle', 'Paxos', 'Ripple', 'Consensys', 'Chainalysis', 'Fireblocks',
  'OpenSea', 'Blur', 'Magic Eden', 'Rarible', 'Foundation',
  'MetaMask', 'Ledger', 'Trezor', 'Trust Wallet', 'Phantom',
  'Schwab', 'Kalshi', 'NYSE', 'Nasdaq', 'CME', 'CBOE',
  // Países e estados
  'Brasil', 'EUA', 'China', 'Japão', 'Coreia', 'Rússia', 'Índia',
  'Reino Unido', 'Alemanha', 'França', 'Suíça', 'Singapura', 'Dubai',
  'El Salvador', 'Portugal', 'Argentina', 'México', 'Canadá', 'Austrália',
  'Massachusetts', 'MA', 'NY', 'CA', 'TX', 'FL', 'Wyoming', 'Delaware',
  // Pessoas notáveis
  'Satoshi Nakamoto', 'Vitalik Buterin', 'Changpeng Zhao', 'CZ',
  'Brian Armstrong', 'Sam Bankman-Fried', 'SBF', 'Michael Saylor',
  'Elon Musk', 'Gary Gensler', 'Jerome Powell', 'Janet Yellen',
  // Outros termos
  'Ethereum Foundation', 'Bitcoin Foundation', 'Crypto Valley',
  'Silicon Valley', 'Wall Street', 'Main Street',
]

/**
 * Formata título seguindo padrão do português brasileiro
 * - Primeira letra maiúscula
 * - Nomes próprios e siglas mantêm capitalização original
 * - Após dois pontos, primeira letra maiúscula
 */
export function formatTitle(title: string): string {
  if (!title) return ''

  // Converte tudo para minúscula
  let formatted = title.toLowerCase()

  // Primeira letra maiúscula
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  // Restaura maiúsculas em nomes próprios (ordenados por tamanho decrescente para evitar conflitos)
  const sortedNouns = [...PROPER_NOUNS].sort((a, b) => b.length - a.length)

  for (const noun of sortedNouns) {
    // Usa word boundary para evitar matches parciais
    const regex = new RegExp(`\\b${noun.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    formatted = formatted.replace(regex, noun)
  }

  // Maiúscula após dois pontos (padrão jornalístico PT-BR)
  formatted = formatted.replace(/:\s+([a-záàâãéèêíïóôõöúç])/gi, (_match, letter) =>
    ': ' + letter.toUpperCase()
  )

  // Maiúscula após ponto final, interrogação ou exclamação
  formatted = formatted.replace(/([.!?])\s+([a-záàâãéèêíïóôõöúç])/gi, (_match, punct, letter) =>
    punct + ' ' + letter.toUpperCase()
  )

  return formatted
}
