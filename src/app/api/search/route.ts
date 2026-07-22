import { NextRequest, NextResponse } from 'next/server'
import { sanitizeSearchQuery } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const MAX_LIMIT = 50

/**
 * Mapeia um post do backend para um objeto leve, sem enviar o conteúdo
 * completo (content_markdown/content_html) ao cliente no modo fallback.
 */
function toLightPost(item: Record<string, unknown>) {
  const category = item.category as Record<string, unknown> | null | undefined
  const tags = Array.isArray(item.tags) ? item.tags : []
  return {
    id: String(item.id ?? ''),
    title: String(item.title ?? ''),
    slug: String(item.slug ?? ''),
    excerpt: typeof item.excerpt === 'string' ? item.excerpt : '',
    featured_image_url:
      typeof item.featured_image_url === 'string' ? item.featured_image_url : null,
    published_at: typeof item.published_at === 'string' ? item.published_at : null,
    created_at: typeof item.created_at === 'string' ? item.created_at : null,
    // Conteúdo NÃO é exposto no fallback; mantido vazio para compatibilidade.
    content_markdown: '',
    content_html: '',
    category: category
      ? {
          id: String(category.id ?? ''),
          name: String(category.name ?? ''),
          slug: String(category.slug ?? ''),
        }
      : null,
    tags: tags
      .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
      .map((t) => ({
        id: String(t.id ?? ''),
        name: String(t.name ?? ''),
        slug: String(t.slug ?? ''),
      })),
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  // Validar/clampar limit (evita repassar valores arbitrários ao backend).
  const limitRaw = parseInt(searchParams.get('limit') || '50', 10)
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
    : MAX_LIMIT

  // SECURITY: Sanitize query
  const sanitizedQuery = sanitizeSearchQuery(query)
  if (!sanitizedQuery) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Try dedicated search endpoint first
    const searchResponse = await fetch(
      `${API_URL}/posts/search?q=${encodeURIComponent(sanitizedQuery)}&limit=${limit}`,
      { cache: 'no-store' }
    )

    if (searchResponse.ok) {
      const data = await searchResponse.json()
      if (data.results && data.results.length > 0) {
        return NextResponse.json(data)
      }
    }

    // Fallback: fetch posts and search client-side (com campos leves).
    const postsResponse = await fetch(
      `${API_URL}/posts?page=1&page_size=100&status=published`,
      { cache: 'no-store' }
    )

    if (postsResponse.ok) {
      const data = await postsResponse.json()
      const items = Array.isArray(data.items) ? data.items : []
      const results = items.map(toLightPost)
      return NextResponse.json({ results, fallback: true })
    }

    return NextResponse.json({ results: [] })
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
