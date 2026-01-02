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
    const url = new URL(`${API_URL}/posts`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('page_size', pageSize.toString())
    if (status) {
      url.searchParams.append('status', status)
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!res.ok) {
      console.warn('Failed to fetch posts, returning empty list')
      return {
        items: [],
        total: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 0,
      }
    }

    return res.json()
  } catch (error) {
    console.warn('Error fetching posts:', error)
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
    const res = await fetch(`${API_URL}/posts/slug/${slug}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.warn('Error fetching post:', error)
    return null
  }
}
