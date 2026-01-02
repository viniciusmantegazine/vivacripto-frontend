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
    throw new Error('Failed to fetch posts')
  }

  return res.json()
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/posts/slug/${slug}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    if (res.status === 404) {
      return null
    }
    throw new Error('Failed to fetch post')
  }

  return res.json()
}
