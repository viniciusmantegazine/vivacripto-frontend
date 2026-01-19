'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PostCard from '@/components/posts/PostCard'
import { Post } from '@/services/api'
import { sanitizeSearchQuery } from '@/lib/utils'

function SearchContent() {
  const searchParams = useSearchParams()
  const rawQuery = searchParams.get('q') || ''
  // SECURITY: Sanitize query from URL params
  const query = sanitizeSearchQuery(rawQuery)

  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (q: string, signal?: AbortSignal) => {
    // SECURITY: Sanitize before sending to API
    const sanitizedQuery = sanitizeSearchQuery(q)
    if (!sanitizedQuery) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/search?q=${encodeURIComponent(sanitizedQuery)}&limit=50`,
        { signal }
      )

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        setResults([])
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Erro ao buscar:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!query) return

    // SECURITY: AbortController to prevent race conditions
    const controller = new AbortController()
    performSearch(query, controller.signal)

    return () => controller.abort()
  }, [query, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/busca?q=${encodeURIComponent(searchQuery)}`)
      performSearch(searchQuery)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Buscar Notícias
        </h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Digite sua busca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Encontrados <strong>{results.length}</strong> resultados para "{query}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Não encontramos notícias com o termo "{query}"
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Ver todas as notícias
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searched && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Digite algo para começar a buscar
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Encontre notícias sobre Bitcoin, Ethereum, DeFi e muito mais
          </p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Suspense fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />
    </>
  )
}
