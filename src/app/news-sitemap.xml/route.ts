import { getPosts, Post } from '@/services/api'
import { SITE_URL } from '@/config/site'

// Google News sitemap: apenas notícias das últimas 48h.
// Regenera de hora em hora.
export const revalidate = 3600

const PUBLICATION_NAME = 'VerticeCripto'
const LANGUAGE = 'pt'
const WINDOW_MS = 48 * 60 * 60 * 1000

/** Escapa caracteres reservados de XML. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  let posts: Post[] = []
  try {
    // As duas primeiras páginas (200 posts) cobrem com folga uma janela de 48h.
    const [first, second] = await Promise.all([
      getPosts({ page: 1, pageSize: 100, status: 'published' }),
      getPosts({ page: 2, pageSize: 100, status: 'published' }),
    ])
    posts = [...first.items, ...second.items]
  } catch (error) {
    console.error('[news-sitemap] Falha ao buscar posts:', error)
  }

  const cutoff = Date.now() - WINDOW_MS
  const recent = posts.filter((post) => {
    const dateStr = post.published_at || post.created_at
    const time = new Date(dateStr).getTime()
    return !Number.isNaN(time) && time >= cutoff
  })

  const entries = recent
    .map((post) => {
      const pubDate = new Date(
        post.published_at || post.created_at
      ).toISOString()
      const loc = `${SITE_URL}/posts/${post.slug}`
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
