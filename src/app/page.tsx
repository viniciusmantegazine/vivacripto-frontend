import { getPosts } from '@/services/api'
import HeroSection from '@/components/posts/HeroSection'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Top5Crypto from '@/components/crypto/Top5Crypto'
import LoadMorePosts from '@/components/posts/LoadMorePosts'
import type { Metadata } from 'next'

// Canonical da home (resolvido contra metadataBase do layout).
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

// ISR: Revalidate every 60 seconds for fresh content with good caching
export const revalidate = 60

// Posts do hero (não entram no grid paginado).
const HERO_COUNT = 3
// Tamanho da página. A busca inicial traz hero(3) + grid(12) = 15 = página 1.
// O "Carregar Mais" precisa usar o MESMO page_size para que a página 2
// (offset 15) continue exatamente onde o grid parou (rank 16), sem repetir
// os ranks 13–15 que já vieram na primeira página.
const PAGE_SIZE = 15

export default async function Home() {
  // Buscar a primeira página (3 hero + 12 grid). Degrada para estado vazio se
  // o backend falhar — um throw aqui derrubaria o prerender do build inteiro.
  let posts: Awaited<ReturnType<typeof getPosts>>['items'] = []
  let total = 0
  try {
    ;({ items: posts, total } = await getPosts({ page: 1, pageSize: PAGE_SIZE, status: 'published' }))
  } catch (err) {
    console.error('Home: falha ao buscar posts, renderizando estado vazio', err)
  }

  // Separar posts para diferentes seções
  // Hero: 1 principal + 2 secundários
  // Grid: restante dos posts (com "Carregar Mais")
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

              {/* Grid de Notícias com "Carregar Mais" */}
              {gridPosts.length > 0 && (
                <section className="mb-12" aria-label="Últimas Notícias">
                  {/* Título da seção */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full" aria-hidden="true" />
                    Últimas Notícias
                  </h2>

                  <LoadMorePosts
                    initialPosts={gridPosts}
                    totalPosts={total - HERO_COUNT}
                    initialPage={1}
                    pageSize={PAGE_SIZE}
                  />
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
