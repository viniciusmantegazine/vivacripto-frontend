import { getPostBySlug, getPosts } from '@/services/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

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

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            {post.published_at && (
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </time>
            )}
            {post.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {post.category.name}
              </span>
            )}
          </div>

          {post.featured_image_url && (
            <div className="relative w-full h-96 mb-6">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            VivaCripto utiliza inteligência artificial para gerar parte de seu conteúdo. 
            Nossos artigos são criados a partir de fontes de notícias confiáveis e revisados 
            por um processo automatizado de qualidade. Este conteúdo é puramente informativo 
            e não constitui recomendação de investimento.
          </p>
        </footer>
      </article>
    </main>
  )
}
