import { getPosts, getPostBySlug, Post } from '@/services/api'
import { cleanMetaDescription, removeDuplicateTitle, stripMarkdown, calculateReadingTime, formatDate, formatTitle } from '@/lib/utils'
import { SITE_URL } from '@/config/site'
import { notFound } from 'next/navigation'
import { isValidElement, type ReactNode } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'

/**
 * Extrai texto puro dos children do ReactMarkdown de forma recursiva.
 * Antes usava String(children), que virava "[object Object]" quando o heading
 * continha nós React (ex.: **negrito** dentro do título).
 */
function extractText(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return ''
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join('')
  }
  if (isValidElement(children)) {
    return extractText((children.props as { children?: ReactNode }).children)
  }
  return ''
}
import { Clock, Calendar, Share2, User } from 'lucide-react'
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

    const cleanTitle = formatTitle(stripMarkdown(post.title))
    // NÃO aplicar formatTitle na meta description (é texto de sentença, não título).
    const cleanDescription = cleanMetaDescription(post.meta_description || post.excerpt)
    const ownUrl = `${SITE_URL}/posts/${post.slug}`

    // Canonical: só respeita o canonical_url do backend se ele apontar para o
    // próprio domínio (canonical intencional). Caso contrário — vazio ou URL de
    // fonte externa — usamos a URL própria para não desindexar nosso conteúdo.
    const canonical =
      post.canonical_url && post.canonical_url.startsWith(SITE_URL)
        ? post.canonical_url
        : ownUrl

    return {
      title: post.meta_title ? formatTitle(post.meta_title) : cleanTitle,
      description: cleanDescription,
      alternates: {
        canonical,
      },
      openGraph: {
        title: cleanTitle,
        description: cleanDescription,
        url: ownUrl,
        siteName: 'VerticeCripto',
        // Omitir o campo images se não houver imagem (não emitir url vazia).
        ...(post.featured_image_url
          ? { images: [{ url: post.featured_image_url, width: 1200, height: 630 }] }
          : {}),
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

  const postUrl = `${SITE_URL}/posts/${post.slug}`
  const cleanDescription = cleanMetaDescription(post.meta_description || post.excerpt)
  const cleanTitle = formatTitle(stripMarkdown(post.title))

  // JSON-LD: NÃO escapamos entidades HTML nos valores (isso corrompia o JSON).
  // A serialização segura é feita com JSON.stringify + escape de "<" abaixo.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: cleanTitle,
    description: cleanDescription,
    image: post.featured_image_url ? [post.featured_image_url] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: 'pt-BR',
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Redação VerticeCripto',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VerticeCripto',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-light.png`,
      },
    },
    ...(post.category && {
      articleSection: post.category.name,
    }),
    ...(post.tags && post.tags.length > 0 && {
      keywords: post.tags.map((tag) => tag.name).join(', '),
    }),
  }

  // BreadcrumbList (espelha os breadcrumbs visuais).
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      ...(post.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: post.category.name,
              item: `${SITE_URL}/categoria/${post.category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: post.category ? 3 : 2,
        name: cleanTitle,
        item: postUrl,
      },
    ],
  }

  const serializeJsonLd = (data: unknown) =>
    JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
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
                <User className="w-4 h-4" />
                <span>
                  Por <strong className="text-gray-900 dark:text-white">{post.author?.name || 'Redação VerticeCripto'}</strong>
                </span>
              </div>
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
              url={postUrl}
              title={cleanTitle}
            />
          </header>

          {/* Featured Image - object-contain para mostrar imagem completa sem cortes */}
          {post.featured_image_url && (
            <div className="relative w-full mb-8 rounded-lg overflow-hidden bg-gray-900">
              <Image
                src={post.featured_image_url}
                alt={
                  post.category
                    ? `Ilustração editorial sobre ${post.category.name.toLowerCase()}: ${cleanTitle}`
                    : `Ilustração editorial: ${cleanTitle}`
                }
                width={1200}
                height={675}
                className="w-full h-auto object-contain"
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
              <ReactMarkdown
                components={{
                  // Rebaixa qualquer # do markdown para h2 (já existe o h1 da página).
                  h1: ({ children }) => <h2>{formatTitle(extractText(children))}</h2>,
                  h2: ({ children }) => <h2>{formatTitle(extractText(children))}</h2>,
                  h3: ({ children }) => <h3>{formatTitle(extractText(children))}</h3>,
                  h4: ({ children }) => <h4>{formatTitle(extractText(children))}</h4>,
                }}
              >
                {cleanContent}
              </ReactMarkdown>
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
