/**
 * ArticleGrid - Grid responsivo de artigos com hierarquia visual
 * Alterna entre variantes de cards para quebrar monotonia
 */

import { Post } from '@/services/api'
import PostCard from './PostCard'

interface ArticleGridProps {
  posts: Post[]
  title?: string
  showFeatured?: boolean
}

export default function ArticleGrid({
  posts,
  title = 'Últimas Notícias',
  showFeatured = true
}: ArticleGridProps) {
  if (posts.length === 0) return null

  // Função para determinar a variante do card com base na posição
  // Cria uma hierarquia visual interessante
  const getCardVariant = (index: number): 'featured' | 'standard' | 'compact' => {
    // Primeiro card é featured se habilitado
    if (showFeatured && index === 0) return 'featured'

    // A cada 5 cards, um é compact (exceto o primeiro)
    if (index > 0 && index % 5 === 4) return 'compact'

    return 'standard'
  }

  return (
    <section className="mb-12" aria-label={title}>
      {/* Título da seção */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full" aria-hidden="true" />
        {title}
      </h2>

      {/* Grid responsivo: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post, index) => {
          const variant = getCardVariant(index)

          return (
            <div
              key={post.id}
              className={variant === 'featured' ? 'md:col-span-2' : ''}
            >
              <PostCard
                post={post}
                variant={variant}
                priority={index < 3}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/**
 * ArticleGridCompact - Variação com cards menores (para sidebars, relacionados)
 */
interface ArticleGridCompactProps {
  posts: Post[]
  title?: string
}

export function ArticleGridCompact({ posts, title }: ArticleGridCompactProps) {
  if (posts.length === 0) return null

  return (
    <section aria-label={title || 'Artigos relacionados'}>
      {title && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full" aria-hidden="true" />
          {title}
        </h3>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="compact" />
        ))}
      </div>
    </section>
  )
}

/**
 * ArticleGridMixed - Grid com mistura de tamanhos para home page
 * Layout: Featured em cima, depois alternando standard e compact
 */
interface ArticleGridMixedProps {
  posts: Post[]
  title?: string
}

export function ArticleGridMixed({ posts, title = 'Mais Notícias' }: ArticleGridMixedProps) {
  if (posts.length === 0) return null

  // Divide posts em grupos para diferentes layouts
  const featuredPosts = posts.slice(0, 2)
  const standardPosts = posts.slice(2, 8)
  const compactPosts = posts.slice(8)

  return (
    <section className="mb-12" aria-label={title}>
      {/* Título da seção */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full" aria-hidden="true" />
        {title}
      </h2>

      {/* Cards Featured (2 colunas no desktop) */}
      {featuredPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          {featuredPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              variant="featured"
              priority={index === 0}
            />
          ))}
        </div>
      )}

      {/* Cards Standard (3 colunas no desktop) */}
      {standardPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {standardPosts.map((post) => (
            <PostCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      )}

      {/* Cards Compact (linha horizontal ou grid) */}
      {compactPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {compactPosts.map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      )}
    </section>
  )
}
