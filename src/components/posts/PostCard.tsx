import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, calculateReadingTime, formatDate } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'

interface PostCardProps {
  post: Post
  variant?: 'featured' | 'standard' | 'compact'
  priority?: boolean
}

export default function PostCard({ post, variant = 'standard', priority = false }: PostCardProps) {
  const readingTime = calculateReadingTime(post.content_markdown)
  const cleanTitle = stripMarkdown(post.title)
  const cleanExcerpt = stripMarkdown(post.excerpt)

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
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500" />
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
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500" />
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
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500" />
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
