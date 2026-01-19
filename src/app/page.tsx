import { getPosts } from '@/services/api'
import HeroSection from '@/components/posts/HeroSection'
import ArticleGrid from '@/components/posts/ArticleGrid'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Top5Crypto from '@/components/crypto/Top5Crypto'

// ISR: Revalidate every 60 seconds for fresh content with good caching
export const revalidate = 60

export default async function Home() {
  const { items: posts } = await getPosts({ page: 1, pageSize: 13, status: 'published' })

  // Separar posts para diferentes seções
  // Hero: 1 principal + 2 secundários
  // Grid: restante dos posts
  const heroMainPost = posts[0]
  const heroSecondaryPosts = posts.slice(1, 3)
  const gridPosts = posts.slice(3)

  return (
    <>
      <Header />

      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">VC</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Em breve, muitas novidades!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Estamos preparando conteúdo exclusivo sobre criptomoedas para você. Volte em breve!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Top 5 Cryptos */}
              <Top5Crypto />

              {/* Hero Section: Principal (2/3) + Secundários (1/3) */}
              {heroMainPost && (
                <HeroSection
                  mainPost={heroMainPost}
                  secondaryPosts={heroSecondaryPosts}
                />
              )}

              {/* Grid de Notícias com hierarquia visual */}
              {gridPosts.length > 0 && (
                <ArticleGrid
                  posts={gridPosts}
                  title="Últimas Notícias"
                  showFeatured={false}
                />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
