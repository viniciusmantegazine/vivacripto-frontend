/**
 * Centralized category configuration
 * Single source of truth for all category-related data
 */

export interface Category {
  name: string
  slug: string
  description: string
}

/**
 * All available categories with their metadata
 * Used by Header navigation and Category pages
 */
export const CATEGORIES: Record<string, Category> = {
  bitcoin: {
    name: 'Bitcoin',
    slug: 'bitcoin',
    description: 'Notícias sobre Bitcoin, a primeira e maior criptomoeda do mundo',
  },
  ethereum: {
    name: 'Ethereum',
    slug: 'ethereum',
    description: 'Atualizações sobre Ethereum, contratos inteligentes e DApps',
  },
  altcoins: {
    name: 'Altcoins',
    slug: 'altcoins',
    description: 'Notícias sobre criptomoedas alternativas ao Bitcoin',
  },
  defi: {
    name: 'DeFi',
    slug: 'defi',
    description: 'Finanças descentralizadas e protocolos DeFi',
  },
  regulacao: {
    name: 'Regulação',
    slug: 'regulacao',
    description: 'Regulamentação e legislação sobre criptomoedas',
  },
  airdrop: {
    name: 'Airdrop',
    slug: 'airdrop',
    description: 'Airdrops, distribuições gratuitas de tokens e oportunidades',
  },
} as const

/**
 * Array of categories for navigation components
 */
export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES)

/**
 * Array of category slugs for static generation
 */
export const CATEGORY_SLUGS: string[] = Object.keys(CATEGORIES)

/**
 * Get category by slug with type safety
 */
export function getCategoryBySlug(slug: string): Category | null {
  return CATEGORIES[slug] || null
}

/**
 * Check if a slug is a valid category
 */
export function isValidCategorySlug(slug: string): boolean {
  return slug in CATEGORIES
}
