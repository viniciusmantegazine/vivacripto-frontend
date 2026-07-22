import { cache } from 'react'

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
  reading_time?: number
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
    reading_time: typeof post.reading_time === 'number' ? post.reading_time : undefined,
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

/**
 * Fetch a paginated list of posts.
 *
 * ISR: responses are cached and revalidated every 5 minutes and tagged
 * with 'posts' so the /api/revalidate webhook can bust them on publish.
 *
 * A valid HTTP 200 with an empty `items` array is treated as a legitimate
 * empty list. Network failures or non-ok HTTP responses are logged and
 * re-thrown so Next.js does not cache a bad response (and error.tsx can act).
 */
export const getPosts = cache(async function getPosts(params: {
  page?: number
  pageSize?: number
  status?: string
  category?: string
}): Promise<PostListResponse> {
  const { page = 1, pageSize = 10, status = 'published', category } = params

  const url = new URL(`${API_URL}/posts`)
  url.searchParams.append('page', page.toString())
  url.searchParams.append('page_size', pageSize.toString())
  if (status) {
    url.searchParams.append('status', status)
  }
  if (category) {
    url.searchParams.append('category', category)
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      next: { revalidate: 300, tags: ['posts'] },
    })
  } catch (error) {
    // Network error: log and re-throw so the bad state is not cached.
    console.error(`[getPosts] Network error fetching ${url.toString()}:`, error)
    throw error
  }

  if (!res.ok) {
    console.error(`[getPosts] HTTP ${res.status} fetching ${url.toString()}`)
    throw new Error(`Failed to fetch posts: HTTP ${res.status}`)
  }

  const data = await res.json()

  // SECURITY: Validate response structure. An empty items array here is a
  // legitimate "no posts" result, not an error.
  return validatePostListResponse(data, pageSize)
})

/**
 * Fetch a single post by slug.
 *
 * Wrapped in React.cache to dedupe the call within a single request
 * (generateMetadata + the page component both call it).
 *
 * Returns null only for a real 404. Network errors and other non-ok
 * responses are logged and re-thrown so callers can surface an error page
 * instead of a misleading notFound().
 */
export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<Post | null> {
  // SECURITY: Validate slug parameter
  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return null
  }

  // SECURITY: Sanitize slug - only allow alphanumeric, hyphens, and underscores
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '')
  if (sanitizedSlug !== slug) {
    return null
  }

  const url = `${API_URL}/posts/slug/${encodeURIComponent(sanitizedSlug)}`

  let res: Response
  try {
    res = await fetch(url, {
      next: { revalidate: 300, tags: ['posts'] },
    })
  } catch (error) {
    console.error(`[getPostBySlug] Network error fetching ${url}:`, error)
    throw error
  }

  // A real 404 means the post does not exist -> notFound() at the page level.
  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    console.error(`[getPostBySlug] HTTP ${res.status} fetching ${url}`)
    throw new Error(`Failed to fetch post: HTTP ${res.status}`)
  }

  const data = await res.json()

  // SECURITY: Validate response structure
  return validatePost(data)
})
