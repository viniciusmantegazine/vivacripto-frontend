import { getPostBySlug, getPosts } from '@/services/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Clock, Calendar, Share2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import RelatedPosts from '@/components/posts/RelatedPosts'
import ShareButtons from '@/components/ui/ShareButtons'

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

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: {
      canonical: post.canonical_url || `https://vivacripto.com.br/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://vivacripto.com.br/posts/${post.slug}`,
      siteName: 'VivaCripto',
      images: [{ url: post.featured_image_url || '', width: 1200, height: 630 }],
      locale: 'pt_BR',
      type: 'article',
      publishedTime: post.published_at,
    },
  }
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Fetch related posts
  const { items: allPosts } = await getPosts({ page: 1, pageSize: 10, status: 'published' })
  const relatedPosts = allPosts.filter((p) => p.id !== post.id)

  const readingTime = calculateReadingTime(post.content_markdown)

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

  const breadcrumbItems = [
    ...(post.category ? [{ label: post.category.name, href: `/categoria/${post.category.slug}` }] : []),
    { label: post.title },
  ]

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <article className="bg-white">
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
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
            <div className="prose prose-lg max-w-none mb-12">
              <style jsx global>{`
                .prose {
                  font-size: 1.125rem;
                  line-height: 1.6;
                  color: #374151;
                }
                .prose h2 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #111827;
                }
                .prose h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  color: #111827;
                }
                .prose p {
                  margin-bottom: 1.5rem;
                }
                .prose strong {
                  color: #111827;
                  font-weight: 600;
                }
                .prose a {
                  color: #f97316;
                  text-decoration: none;
                }
                .prose a:hover {
                  text-decoration: underline;
                }
                .prose ul, .prose ol {
                  margin-bottom: 1.5rem;
                }
                .prose li {
                  margin-bottom: 0.5rem;
                }
              `}</style>
              <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
            </div>

            {/* Disclaimer */}
            <footer className="mt-12 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Aviso:</strong> VivaCripto utiliza inteligência artificial para gerar parte de seu conteúdo. 
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
