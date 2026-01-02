import { getPosts } from '@/services/api'
import PostCard from '@/components/posts/PostCard'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home() {
  const { items: posts } = await getPosts({ page: 1, pageSize: 10, status: 'published' })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            VivaCripto
          </h1>
          <p className="text-gray-600">
            Notícias sobre criptomoedas e o mercado cripto
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  )
}
