import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, calculateReadingTime } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'

interface RelatedPostsProps {
  posts: Post[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section
      className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
      aria-label="Artigos relacionados"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span
          className="w-1 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 mr-3 rounded-full"
          aria-hidden="true"
        />
        Leia Também
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 3).map((post) => {
          const readingTime = calculateReadingTime(post.content_markdown)
          const cleanTitle = stripMarkdown(post.title)

          return (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group block"
            >
              <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-1">
                {/* Imagem */}
                <div className="relative w-full h-40 overflow-hidden">
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
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                    {cleanTitle}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{readingTime} min de leitura</span>
                  </div>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
