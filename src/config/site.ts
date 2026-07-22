/**
 * Site-wide configuration
 * Single source of truth for the public site URL.
 * Set NEXT_PUBLIC_SITE_URL in the environment to override in previews.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://verticecripto.com.br'
