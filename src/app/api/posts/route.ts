import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Proxy interno para a listagem de posts do backend.
 *
 * Motivo: o LoadMorePosts fazia fetch client-side direto ao backend, o que
 * dependia de CORS (preflight retornava 400 em produção). Chamando esta rota
 * (mesma origem) eliminamos o problema de CORS.
 *
 * Validações: page >= 1, page_size clamp <= 100 (backend retorna 422 se > 100).
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  const pageRaw = parseInt(sp.get('page') || '1', 10)
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1

  const sizeRaw = parseInt(sp.get('page_size') || '12', 10)
  const pageSize = Number.isFinite(sizeRaw)
    ? Math.min(Math.max(sizeRaw, 1), 100)
    : 12

  const status = sp.get('status') || 'published'
  const category = sp.get('category') || ''

  const url = new URL(`${API_URL}/posts`)
  url.searchParams.append('page', String(page))
  url.searchParams.append('page_size', String(pageSize))
  if (status) url.searchParams.append('status', status)
  if (category) url.searchParams.append('category', category)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })

    if (!res.ok) {
      console.error(`[api/posts] HTTP ${res.status} fetching ${url.toString()}`)
      return NextResponse.json(
        { message: 'Erro ao buscar notícias' },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/posts] Network error:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar notícias' },
      { status: 502 }
    )
  }
}
