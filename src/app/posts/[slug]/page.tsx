import { getPostBySlug, getPosts } from '@/services/api'
import { cleanMetaDescription, removeDuplicateTitle, stripMarkdown, calculateReadingTime, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Clock, Calendar, Share2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import RelatedPosts from '@/components/posts/RelatedPosts'
import ShareButtons from '@/components/ui/ShareButtons'

// Allow dynamic params for posts created after build
export const dynamicParams = true

export async function generateStaticParams() {
  const { items: posts } = await getPosts({ page: 1, pageSize: 100, status: 'published' })
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    return {}
  }

  const cleanTitle = stripMarkdown(post.title)
  const cleanDescription = cleanMetaDescription(post.meta_description || post.excerpt)
  
  return {
    title: post.meta_title || cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: post.canonical_url || `https://vivacripto.com.br/posts/${post.slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `https://vivacripto.com.br/posts/${post.slug}`,
      siteName: 'VivaCripto',
      images: [{ url: post.featured_image_url || '', width: 1200, height: 630 }],
      locale: 'pt_BR',
      type: 'article',
      publishedTime: post.published_at,
    },
  }
}



export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Fetch related posts
  const { items: allPosts } = await getPosts({ page: 1, pageSize: 10, status: 'published' })
  const relatedPosts = allPosts.filter((p) => p.id !== post.id)

  // Remove duplicate title from content
  const cleanContent = removeDuplicateTitle(post.content_markdown, post.title)
  const readingTime = calculateReadingTime(cleanContent)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: [post.featured_image_url],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'VivaCripto',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VivaCripto',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vivacripto.com.br/logo.png',
      },
    },
    description: post.excerpt,
  }

  const cleanTitle = stripMarkdown(post.title)
  
  const breadcrumbItems = [
    ...(post.category ? [{ label: post.category.name, href: `/categoria/${post.category.slug}` }] : []),
    { label: cleanTitle },
  ]

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <article className="bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Header */}
            <header className="mb-8">
              {/* Category Badge */}
              {post.category && (
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full mb-4">
                  {post.category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {cleanTitle}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min de leitura</span>
                </div>
              </div>

              {/* Share Buttons */}
              <ShareButtons title={post.title} url={`https://vivacripto.com.br/posts/${post.slug}`} />

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-2xl overflow-hidden">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none mb-12 prose-headings:text-gray-900 dark:prose-headings:text-white prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6 prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-8 prose-p:leading-[1.8] prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold prose-ul:mb-8 prose-ul:space-y-3 prose-ol:mb-8 prose-ol:space-y-3 prose-li:mb-2">
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>

            {/* Disclaimer */}
            <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Aviso:</strong> VivaCripto utiliza inteligência artificial para gerar parte de seu conteúdo. 
                Nossos artigos são criados a partir de fontes de notícias confiáveis e revisados 
                por um processo automatizado de qualidade. Este conteúdo é puramente informativo 
                e não constitui recomendação de investimento.
              </p>
            </footer>

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
          </div>
        </article>
      </main>

      <Footer />
    </>
  )
}
