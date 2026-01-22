/**
 * HeroSection - Seção de destaque com layout 2/3 + 1/3
 * Desktop: Notícia principal (2/3) + 2 notícias secundárias verticais (1/3)
 * Mobile: Stack vertical com principal primeiro
 */

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, cleanMetaDescription, calculateReadingTime, formatDate, formatTitle } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'

// Gradientes de fallback por categoria para posts sem imagem
const categoryGradients: Record<string, string> = {
  bitcoin: 'from-orange-500 via-orange-400 to-yellow-500',
  ethereum: 'from-purple-600 via-purple-500 to-indigo-500',
  altcoins: 'from-blue-600 via-blue-500 to-cyan-500',
  defi: 'from-green-600 via-green-500 to-emerald-500',
  regulacao: 'from-red-600 via-red-500 to-rose-500',
  airdrop: 'from-yellow-500 via-amber-400 to-orange-400',
}

function getGradient(categorySlug?: string): string {
  return categoryGradients[categorySlug || ''] || 'from-orange-400 via-amber-400 to-yellow-500'
}

interface HeroSectionProps {
  mainPost: Post
  secondaryPosts?: Post[]
}

export default function HeroSection({ mainPost, secondaryPosts = [] }: HeroSectionProps) {
  const mainReadingTime = calculateReadingTime(mainPost.content_markdown)
  const mainCleanTitle = formatTitle(stripMarkdown(mainPost.title))
  const mainCleanExcerpt = formatTitle(cleanMetaDescription(mainPost.excerpt))

  return (
    <section className="mb-12" aria-label="Notícias em destaque">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notícia Principal (2/3 no desktop) */}
        <Link
          href={`/posts/${mainPost.slug}`}
          className="lg:col-span-2 group block"
        >
          <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
            {/* Imagem principal */}
            <div className="relative h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
              {mainPost.featured_image_url ? (
                <Image
                  src={mainPost.featured_image_url}
                  alt={mainCleanTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getGradient(mainPost.category?.slug)}`} />
              )}

              {/* Gradient Overlay para legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Conteúdo sobre a imagem */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                {/* Badge de categoria */}
                {mainPost.category && (
                  <div className="mb-4">
                    <CategoryBadge category={mainPost.category} size="md" />
                  </div>
                )}

                {/* Título */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight group-hover:text-orange-300 transition-colors line-clamp-3">
                  {mainCleanTitle}
                </h1>

                {/* Excerpt */}
                <p className="text-base md:text-lg text-gray-200 mb-4 line-clamp-2 max-w-3xl">
                  {mainCleanExcerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <time dateTime={mainPost.published_at || mainPost.created_at}>
                      {formatDate(mainPost.published_at || mainPost.created_at, 'long')}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{mainReadingTime} min de leitura</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Link>

        {/* Notícias Secundárias (1/3 no desktop, stack vertical) */}
        {secondaryPosts.length > 0 && (
          <div className="flex flex-col gap-6">
            {secondaryPosts.slice(0, 2).map((post) => (
              <SecondaryCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * SecondaryCard - Card secundário para a coluna lateral do hero
 */
interface SecondaryCardProps {
  post: Post
}

function SecondaryCard({ post }: SecondaryCardProps) {
  const readingTime = calculateReadingTime(post.content_markdown)
  const cleanTitle = formatTitle(stripMarkdown(post.title))

  return (
    <Link href={`/posts/${post.slug}`} className="group block flex-1">
      <article className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full min-h-[230px]">
        {/* Imagem */}
        <div className="absolute inset-0 overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={cleanTitle}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGradient(post.category?.slug)}`} />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative h-full flex flex-col justify-end p-5 text-white">
          {/* Badge de categoria */}
          {post.category && (
            <div className="mb-3">
              <CategoryBadge category={post.category} size="sm" />
            </div>
          )}

          {/* Título */}
          <h2 className="text-lg md:text-xl font-bold mb-2 leading-snug group-hover:text-orange-300 transition-colors line-clamp-2">
            {cleanTitle}
          </h2>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-300">
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
