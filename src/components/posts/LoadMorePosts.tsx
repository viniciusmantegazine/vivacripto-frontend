'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Post } from '@/services/api'
import PostCard from './PostCard'

interface LoadMorePostsProps {
  initialPosts: Post[]
  totalPosts: number
  initialPage: number
  pageSize: number
  category?: string
}

export default function LoadMorePosts({
  initialPosts,
  totalPosts,
  initialPage,
  pageSize,
  category,
}: LoadMorePostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(posts.length < totalPosts)

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(false)
    const nextPage = page + 1

    try {
      // Rota proxy interna (mesma origem) para evitar problemas de CORS.
      const params = new URLSearchParams({
        page: String(nextPage),
        page_size: String(pageSize),
        status: 'published',
      })
      if (category) params.set('category', category)

      const response = await fetch(`/api/posts?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const newPosts: Post[] = data.items || []

      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => [...prev, ...newPosts])
        setPage(nextPage)
        const totalLoaded = posts.length + newPosts.length
        setHasMore(totalLoaded < (data.total ?? totalLoaded))
      }
    } catch {
      // Não esconder o botão silenciosamente: mostrar erro + permitir retry.
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Grid de posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Mensagem de erro com retry */}
      {error && (
        <div className="text-center mt-12" role="alert">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Erro ao carregar notícias.
          </p>
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Botão Carregar Mais */}
      {hasMore && !error && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais notícias'
            )}
          </button>
        </div>
      )}

      {/* Mensagem quando não há mais posts */}
      {!hasMore && !error && posts.length > 0 && (
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>Você viu todas as notícias disponíveis</p>
        </div>
      )}
    </>
  )
}
