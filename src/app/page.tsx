import { getPosts } from '@/services/api'
import HeroPost from '@/components/posts/HeroPost'
import PostCard from '@/components/posts/PostCard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NewsletterCTA from '@/components/ui/NewsletterCTA'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  console.log('[HOME] Fetching posts...')
  const { items: posts } = await getPosts({ page: 1, pageSize: 13, status: 'published' })
  console.log('[HOME] Posts received:', posts.length)

  const [heroPost, ...regularPosts] = posts

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">VC</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Em breve, muitas novidades!
                </h2>
                <p className="text-gray-600 text-lg">
                  Estamos preparando conteúdo exclusivo sobre criptomoedas para você. Volte em breve!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              {heroPost && (
                <section className="mb-12">
                  <HeroPost post={heroPost} />
                </section>
              )}

              {/* Latest News Grid */}
              {regularPosts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full"></span>
                    Últimas Notícias
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {/* Newsletter CTA */}
              <section className="mb-12">
                <NewsletterCTA />
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
