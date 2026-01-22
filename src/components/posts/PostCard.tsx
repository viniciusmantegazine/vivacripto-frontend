import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, calculateReadingTime, formatDate, formatTitle } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'

interface PostCardProps {
  post: Post
  variant?: 'featured' | 'standard' | 'compact'
  priority?: boolean
}

// Gradientes de fallback por categoria para cards sem imagem
const categoryGradients: Record<string, string> = {
  bitcoin: 'from-orange-500 via-orange-400 to-yellow-500',
  ethereum: 'from-purple-600 via-purple-500 to-indigo-500',
  altcoins: 'from-blue-600 via-blue-500 to-cyan-500',
  defi: 'from-green-600 via-green-500 to-emerald-500',
  regulacao: 'from-red-600 via-red-500 to-rose-500',
  airdrop: 'from-yellow-500 via-amber-400 to-orange-400',
}

// Componente de fallback para imagem com gradiente e ícone por categoria
function ImageFallback({ categorySlug }: { categorySlug?: string }) {
  const gradient = categoryGradients[categorySlug || ''] || 'from-orange-400 via-amber-400 to-yellow-500'

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="text-white/20">
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-1.67v-1.89c-1.71-.36-3.16-1.46-3.27-3.26h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h1.67v1.89c1.86.45 2.79 1.86 2.85 3.19H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
        </svg>
      </div>
    </div>
  )
}

export default function PostCard({ post, variant = 'standard', priority = false }: PostCardProps) {
  const readingTime = calculateReadingTime(post.content_markdown)
  const cleanTitle = formatTitle(stripMarkdown(post.title))
  const cleanExcerpt = formatTitle(stripMarkdown(post.excerpt))

  // Classes de grid baseadas na variante
  const gridClasses = {
    featured: 'md:col-span-2',
    standard: '',
    compact: ''
  }

  // Renderização do card compacto (imagem ao lado)
  if (variant === 'compact') {
    return (
      <Link href={`/posts/${post.slug}`} className="group block h-full">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex">
          {/* Imagem lateral */}
          <div className="relative w-32 md:w-40 flex-shrink-0 overflow-hidden">
            {post.featured_image_url ? (
              <Image
                src={post.featured_image_url}
                alt={cleanTitle}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="160px"
              />
            ) : (
              <ImageFallback categorySlug={post.category?.slug} />
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
            {/* Badge de categoria */}
            {post.category && (
              <div className="mb-2">
                <CategoryBadge category={post.category} size="sm" />
              </div>
            )}

            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
              {cleanTitle}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                <time dateTime={post.published_at || post.created_at}>
                  {formatDate(post.published_at || post.created_at, 'short')}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>{readingTime} min</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // Renderização do card featured (maior, com mais destaque)
  if (variant === 'featured') {
    return (
      <Link href={`/posts/${post.slug}`} className={`group block h-full ${gridClasses.featured}`}>
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
          {/* Imagem grande (16:9) */}
          <div className="relative w-full aspect-video overflow-hidden">
            {post.featured_image_url ? (
              <Image
                src={post.featured_image_url}
                alt={cleanTitle}
                fill
                priority={priority}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              />
            ) : (
              <ImageFallback categorySlug={post.category?.slug} />
            )}

            {/* Gradient overlay para melhor legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badge de categoria */}
            {post.category && (
              <div className="absolute top-4 left-4">
                <CategoryBadge category={post.category} size="md" />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight">
              {cleanTitle}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-base mb-4 line-clamp-3 flex-1 leading-relaxed">
              {cleanExcerpt}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={post.published_at || post.created_at}>
                  {formatDate(post.published_at || post.created_at, 'long')}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // Renderização padrão (standard)
  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
        {/* Imagem (4:3) */}
        <div className="relative w-full h-48 overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={cleanTitle}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <ImageFallback categorySlug={post.category?.slug} />
          )}

          {/* Gradient overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge de categoria */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <CategoryBadge category={post.category} size="sm" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
            {cleanTitle}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
            {cleanExcerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at, 'short')}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
