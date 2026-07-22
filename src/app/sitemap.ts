import { MetadataRoute } from 'next'
import { getPosts, Post } from '@/services/api'
import { CATEGORY_SLUGS } from '@/config/categories'
import { SITE_URL } from '@/config/site'

// Regenera a sitemap de hora em hora em vez de a cada request.
export const revalidate = 3600

const PAGE_SIZE = 100 // backend valida page_size <= 100 (page_size>100 => 422)

/**
 * Busca TODOS os posts publicados paginando em blocos de 100.
 * O bug anterior pedia pageSize:1000 -> backend respondia 422 -> sitemap vazia.
 */
async function getAllPosts(): Promise<Post[]> {
  const all: Post[] = []
  let page = 1

  // Limite de segurança para evitar loop infinito caso `total` venha errado.
  const MAX_PAGES = 100

  while (page <= MAX_PAGES) {
    const { items, total } = await getPosts({
      page,
      pageSize: PAGE_SIZE,
      status: 'published',
    })

    all.push(...items)

    // Sem mais itens, ou já agregamos o total informado -> parar.
    if (items.length === 0 || (total > 0 && all.length >= total)) {
      break
    }

    page += 1
  }

  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Data fixa de build para páginas estáticas (não mudam a cada request).
  const buildDate = new Date()

  let posts: Post[] = []
  try {
    posts = await getAllPosts()
  } catch (error) {
    // Em erro, ainda emitimos as URLs estáticas em vez de quebrar a sitemap.
    console.error('[sitemap] Falha ao agregar posts:', error)
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: buildDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: buildDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: buildDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: buildDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: buildDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const categoryUrls: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/categoria/${slug}`,
    lastModified: buildDate,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticUrls, ...categoryUrls, ...postUrls]
}
