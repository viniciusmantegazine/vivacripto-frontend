import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import PostCard from '@/components/posts/PostCard'
import Pagination from '@/components/ui/Pagination'
import { getCategoryPosts } from '@/services/category-posts'
import { CATEGORY_SLUGS, getCategoryBySlug } from '@/config/categories'
import { SITE_URL } from '@/config/site'

// ISR: revalida a cada 5 minutos (alinhado à página de categoria).
export const revalidate = 300
export const dynamicParams = true

// Pré-gera a página 2 de cada categoria; as demais renderizam sob demanda.
export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug, page: '2' }))
}

// Aceita apenas inteiros >= 2 (a página 1 é /categoria/[slug]).
function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const page = parseInt(raw, 10)
  return page >= 2 ? page : null
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; page: string }
}) {
  const category = getCategoryBySlug(params.slug)
  const page = parsePage(params.page)

  if (!category || !page) {
    return {
      title: 'Página não encontrada',
      description: 'A página que você procura não existe.',
    }
  }

  const url = `${SITE_URL}/categoria/${category.slug}/pagina/${page}`

  return {
    title: `${category.name} – Página ${page}`,
    description: category.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category.name} – Página ${page} | VerticeCripto`,
      description: category.description,
      url,
      siteName: 'VerticeCripto',
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: { slug: string; page: string }
}) {
  const category = getCategoryBySlug(params.slug)
  const page = parsePage(params.page)

  if (!category || !page) {
    notFound()
  }

  const { posts, totalPages, canPaginate } = await getCategoryPosts(
    params.slug,
    page
  )

  // Fallback sem paginação real, página vazia ou além do fim → 404.
  if (!canPaginate || posts.length === 0 || page > totalPages) {
    notFound()
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: category.name, href: `/categoria/${category.slug}` },
              { label: `Página ${page}` },
            ]}
          />

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}{' '}
              <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                — página {page}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            basePath={`/categoria/${category.slug}`}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
