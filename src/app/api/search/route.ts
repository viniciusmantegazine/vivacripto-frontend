import { NextRequest, NextResponse } from 'next/server'
import { sanitizeSearchQuery } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const limit = searchParams.get('limit') || '50'

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

    // Fallback: fetch all posts and search will be done client-side
    const postsResponse = await fetch(
      `${API_URL}/posts?page=1&page_size=100&status=published`,
      { cache: 'no-store' }
    )

    if (postsResponse.ok) {
      const data = await postsResponse.json()
      return NextResponse.json({ results: data.items || [], fallback: true })
    }

    return NextResponse.json({ results: [] })
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
