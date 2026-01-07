const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface Post {
  id: string
  title: string
  slug: string
  content_markdown: string
  content_html: string
  excerpt: string
  featured_image_url: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  author: {
    id: string
    name: string
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
}

export interface PostListResponse {
  items: Post[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export async function getPosts(params: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<PostListResponse> {
  const { page = 1, pageSize = 10, status = 'published' } = params
  
  try {
    console.log('[API] API_URL:', API_URL)
    const url = new URL(`${API_URL}/posts`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('page_size', pageSize.toString())
    if (status) {
      url.searchParams.append('status', status)
    }

    console.log('[API] Fetching posts from:', url.toString())
    const res = await fetch(url.toString(), {
      cache: 'no-store', // No cache for dynamic content
    })

    console.log('[API] Response status:', res.status)
    if (!res.ok) {
      console.warn('[API] Failed to fetch posts, returning empty list')
      return {
        items: [],
        total: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 0,
      }
    }

    const data = await res.json()
    console.log('[API] Posts fetched:', data.total, 'total,', data.items.length, 'items')
    return data
  } catch (error) {
    console.error('[API] Error fetching posts:', error)
    return {
      items: [],
      total: 0,
      page: 1,
      page_size: pageSize,
      total_pages: 0,
    }
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const url = `${API_URL}/posts/slug/${slug}`
    console.log('[API] Fetching post by slug:', url)
    const res = await fetch(url, {
      cache: 'no-store',
    })

    console.log('[API] Response status:', res.status)
    if (!res.ok) {
      console.warn('[API] Post not found, status:', res.status)
      return null
    }

    const post = await res.json()
    console.log('[API] Post fetched successfully:', post.title)
    return post
  } catch (error) {
    console.error('[API] Error fetching post:', error)
    return null
  }
}
