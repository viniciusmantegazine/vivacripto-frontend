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

/**
 * SECURITY: Validate that a value is a non-empty string
 */
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * SECURITY: Validate Post object structure from API response
 * Returns null if validation fails
 */
function validatePost(data: unknown): Post | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const post = data as Record<string, unknown>

  // Required fields validation
  if (!isValidString(post.id) || !isValidString(post.title) || !isValidString(post.slug)) {
    return null
  }

  // Ensure content fields are strings (can be empty)
  const content_markdown = typeof post.content_markdown === 'string' ? post.content_markdown : ''
  const content_html = typeof post.content_html === 'string' ? post.content_html : ''
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : ''

  // Validate and sanitize the post object
  return {
    id: post.id as string,
    title: post.title as string,
    slug: post.slug as string,
    content_markdown,
    content_html,
    excerpt,
    featured_image_url: typeof post.featured_image_url === 'string' ? post.featured_image_url : null,
    status: typeof post.status === 'string' ? post.status : 'draft',
    published_at: typeof post.published_at === 'string' ? post.published_at : null,
    created_at: typeof post.created_at === 'string' ? post.created_at : new Date().toISOString(),
    updated_at: typeof post.updated_at === 'string' ? post.updated_at : new Date().toISOString(),
    meta_title: typeof post.meta_title === 'string' ? post.meta_title : null,
    meta_description: typeof post.meta_description === 'string' ? post.meta_description : null,
    canonical_url: typeof post.canonical_url === 'string' ? post.canonical_url : null,
    author: post.author && typeof post.author === 'object'
      ? {
          id: String((post.author as Record<string, unknown>).id || ''),
          name: String((post.author as Record<string, unknown>).name || ''),
        }
      : null,
    category: post.category && typeof post.category === 'object'
      ? {
          id: String((post.category as Record<string, unknown>).id || ''),
          name: String((post.category as Record<string, unknown>).name || ''),
          slug: String((post.category as Record<string, unknown>).slug || ''),
        }
      : null,
    tags: Array.isArray(post.tags)
      ? post.tags
          .filter((tag): tag is Record<string, unknown> => tag && typeof tag === 'object')
          .map((tag) => ({
            id: String(tag.id || ''),
            name: String(tag.name || ''),
            slug: String(tag.slug || ''),
          }))
      : [],
  }
}

/**
 * SECURITY: Validate PostListResponse structure from API
 */
function validatePostListResponse(data: unknown, defaultPageSize: number): PostListResponse {
  const emptyResponse: PostListResponse = {
    items: [],
    total: 0,
    page: 1,
    page_size: defaultPageSize,
    total_pages: 0,
  }

  if (!data || typeof data !== 'object') {
    return emptyResponse
  }

  const response = data as Record<string, unknown>

  // Validate items array
  const items: Post[] = []
  if (Array.isArray(response.items)) {
    for (const item of response.items) {
      const validatedPost = validatePost(item)
      if (validatedPost) {
        items.push(validatedPost)
      }
    }
  }

  return {
    items,
    total: typeof response.total === 'number' ? response.total : items.length,
    page: typeof response.page === 'number' ? response.page : 1,
    page_size: typeof response.page_size === 'number' ? response.page_size : defaultPageSize,
    total_pages: typeof response.total_pages === 'number' ? response.total_pages : 1,
  }
}

export async function getPosts(params: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<PostListResponse> {
  const { page = 1, pageSize = 10, status = 'published' } = params

  const emptyResponse: PostListResponse = {
    items: [],
    total: 0,
    page: 1,
    page_size: pageSize,
    total_pages: 0,
  }

  try {
    const url = new URL(`${API_URL}/posts`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('page_size', pageSize.toString())
    if (status) {
      url.searchParams.append('status', status)
    }

    const res = await fetch(url.toString(), {
      cache: 'no-store',
    })

    if (!res.ok) {
      return emptyResponse
    }

    const data = await res.json()

    // SECURITY: Validate response structure
    const validatedResponse = validatePostListResponse(data, pageSize)
    return validatedResponse
  } catch {
    return emptyResponse
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // SECURITY: Validate slug parameter
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return null
  }

  // SECURITY: Sanitize slug - only allow alphanumeric, hyphens, and underscores
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '')
  if (sanitizedSlug !== slug) {
    return null
  }

  try {
    const url = `${API_URL}/posts/slug/${encodeURIComponent(sanitizedSlug)}`
    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()

    // SECURITY: Validate response structure
    return validatePost(data)
  } catch {
    return null
  }
}
