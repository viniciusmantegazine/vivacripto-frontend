import { getPosts, Post } from '@/services/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoadMorePosts from '@/components/posts/LoadMorePosts'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CATEGORY_SLUGS, getCategoryBySlug } from '@/config/categories'
import { SITE_URL } from '@/config/site'

// ISR: revalida a cada 5 minutos (alinhado ao cache da API).
export const revalidate = 300

const PAGE_SIZE = 12

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    // Metadata mínima para slug inválido (antes retornava {} silenciosamente).
    return {
      title: 'Categoria não encontrada',
      description: 'A categoria que você procura não existe.',
    }
  }

  const url = `${SITE_URL}/categoria/${category.slug}`

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category.name} | VerticeCripto`,
      description: category.description,
      url,
      siteName: 'VerticeCripto',
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

/**
 * Busca posts da categoria usando o filtro da API, com fallback para o método
 * antigo (buscar posts e filtrar em memória) caso o endpoint por categoria
 * não exista ou falhe.
 */
async function getCategoryPosts(
  slug: string
): Promise<{ posts: Post[]; total: number; canPaginate: boolean }> {
  try {
    const res = await getPosts({
      category: slug,
      page: 1,
      pageSize: PAGE_SIZE,
      status: 'published',
    })

    // Se veio conteúdo e ao menos um item pertence à categoria, confiamos no
    // filtro do backend e habilitamos paginação real via /api/posts.
    const matches = res.items.filter((p) => p.category?.slug === slug)
    if (res.items.length === 0 || matches.length === res.items.length) {
      return { posts: res.items, total: res.total, canPaginate: true }
    }

    // Backend ignorou o filtro (retornou mix): cai no fallback abaixo.
    throw new Error('category filter not applied')
  } catch {
    // Fallback: busca um lote maior e filtra em memória (sem paginação real).
    try {
      const res = await getPosts({ page: 1, pageSize: 50, status: 'published' })
      const filtered = res.items.filter((p) => p.category?.slug === slug)
      return { posts: filtered, total: filtered.length, canPaginate: false }
    } catch {
      return { posts: [], total: 0, canPaginate: false }
    }
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  const { posts, total, canPaginate } = await getCategoryPosts(params.slug)

  const breadcrumbItems = [{ label: category.name }]

  return (
    <>
      <Header />

      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Category Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <strong>{total}</strong>{' '}
                {total === 1 ? 'notícia encontrada' : 'notícias encontradas'}
              </p>
              <LoadMorePosts
                initialPosts={posts}
                totalPosts={canPaginate ? total : posts.length}
                initialPage={1}
                pageSize={PAGE_SIZE}
                category={params.slug}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <Image
                src="/logo-light.png"
                alt="VerticeCripto"
                width={120}
                height={67}
                className="mx-auto mb-6 dark:hidden"
              />
              <Image
                src="/logo-dark-header.png"
                alt="VerticeCripto"
                width={120}
                height={67}
                className="mx-auto mb-6 hidden dark:block"
              />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Nenhuma notícia nesta categoria ainda
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Em breve teremos conteúdo sobre {category.name}. Volte mais tarde!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
