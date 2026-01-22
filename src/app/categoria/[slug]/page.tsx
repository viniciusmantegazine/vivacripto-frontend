import { getPosts } from '@/services/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PostCard from '@/components/posts/PostCard'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CATEGORY_SLUGS, getCategoryBySlug } from '@/config/categories'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    return {}
  }

  return {
    title: `${category.name} - VerticeCripto`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  // Fetch posts (in a real implementation, this would filter by category)
  const { items: posts } = await getPosts({ page: 1, pageSize: 50, status: 'published' })

  // Filter posts by category (temporary client-side filter)
  // In production, the API should handle this
  const filteredPosts = posts.filter(
    (post) => post.category?.slug === params.slug
  )

  const breadcrumbItems = [
    { label: category.name },
  ]

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
          {filteredPosts.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
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
                src="/logo-dark.png"
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
