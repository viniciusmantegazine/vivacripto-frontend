import { getPosts, getPostBySlug, Post } from '@/services/api'
import { cleanMetaDescription, removeDuplicateTitle, stripMarkdown, calculateReadingTime, formatDate, escapeJsonLd, formatTitle } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Clock, Calendar, Share2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import RelatedPosts from '@/components/posts/RelatedPosts'
import ShareButtons from '@/components/ui/ShareButtons'

// ISR: Revalidate every 60 seconds, allow dynamic params for new posts
export const revalidate = 60
export const dynamicParams = true

// Pre-generate most recent posts at build time
export async function generateStaticParams() {
  try {
    const { items: posts } = await getPosts({ page: 1, pageSize: 20, status: 'published' })
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug)

    if (!post) {
      return {
        title: 'Post não encontrado',
        description: 'O post que você está procurando não foi encontrado.',
      }
    }

    // Aplicar formatTitle() para capitalização correta em português brasileiro
    const cleanTitle = formatTitle(stripMarkdown(post.title))
    const cleanDescription = formatTitle(cleanMetaDescription(post.meta_description || post.excerpt))

    return {
      title: post.meta_title ? formatTitle(post.meta_title) : cleanTitle,
      description: cleanDescription,
      alternates: {
        canonical: post.canonical_url || `https://verticecripto.com.br/posts/${post.slug}`,
      },
      openGraph: {
        title: cleanTitle,
        description: cleanDescription,
        url: `https://verticecripto.com.br/posts/${post.slug}`,
        siteName: 'VerticeCripto',
        images: [{ url: post.featured_image_url || '', width: 1200, height: 630 }],
        locale: 'pt_BR',
        type: 'article',
        publishedTime: post.published_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: cleanTitle,
        description: cleanDescription,
        images: post.featured_image_url ? [post.featured_image_url] : [],
      },
    }
  } catch {
    return {
      title: 'VerticeCripto',
      description: 'Portal de notícias sobre criptomoedas',
    }
  }
}



export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Fetch related posts
  let relatedPosts: Post[] = []
  try {
    const { items: allPosts } = await getPosts({ page: 1, pageSize: 10, status: 'published' })
    relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3)
  } catch {
    // Silently fail - related posts are not critical
  }

  // Remove duplicate title from content
  const cleanContent = removeDuplicateTitle(post.content_markdown, post.title)
  const readingTime = calculateReadingTime(cleanContent)

  // SECURITY: Escape all user-generated content for JSON-LD to prevent XSS
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: escapeJsonLd(post.title),
    image: [post.featured_image_url ? escapeJsonLd(post.featured_image_url) : null].filter(Boolean),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: escapeJsonLd(post.author?.name) || 'VerticeCripto',
    },
  }

  const cleanTitle = formatTitle(stripMarkdown(post.title))

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Início', href: '/' },
              ...(post.category
                ? [{ label: post.category.name, href: `/categoria/${post.category.slug}` }]
                : []),
              { label: cleanTitle },
            ]}
          />

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {cleanTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at || undefined}>
                  {formatDate(post.published_at || post.created_at)}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de leitura</span>
              </div>
              {post.category && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                  {post.category.name}
                </span>
              )}
            </div>

            {/* Share Buttons */}
            <ShareButtons
              url={`https://verticecripto.com.br/posts/${post.slug}`}
              title={cleanTitle}
            />
          </header>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featured_image_url}
                alt={cleanTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 dark:prose-p:text-gray-300
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
              prose-a:text-orange-600 dark:prose-a:text-orange-400
              prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-strong:font-semibold
              prose-li:text-gray-700 dark:prose-li:text-gray-300
              prose-li:text-lg prose-li:leading-relaxed prose-li:mb-3
              prose-ul:my-6 prose-ol:my-6
              prose-blockquote:border-l-4 prose-blockquote:border-orange-500
              prose-blockquote:pl-4 prose-blockquote:italic
              prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
              prose-code:text-orange-600 dark:prose-code:text-orange-400
              prose-code:bg-gray-100 dark:prose-code:bg-gray-900
              prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
              prose-pre:text-gray-100
              prose-img:rounded-lg prose-img:shadow-md">
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                <strong>Aviso:</strong> Este conteúdo é informativo e não constitui
                aconselhamento financeiro. Sempre faça sua própria pesquisa antes de
                investir em criptomoedas.
              </p>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        </article>
      </main>
      <Footer />
    </>
  )
}
