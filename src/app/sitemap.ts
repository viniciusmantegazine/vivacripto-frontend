import { MetadataRoute } from 'next'
import { getPosts } from '@/services/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vivacripto.com.br'

  const { items: posts } = await getPosts({ page: 1, pageSize: 1000, status: 'published' })
  
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updated_at,
    priority: 0.8,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
  ]

  return [...staticUrls, ...postUrls]
}
