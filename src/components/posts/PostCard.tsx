import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, calculateReadingTime, formatDate } from '@/lib/utils'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const readingTime = calculateReadingTime(post.content_markdown)
  const cleanTitle = stripMarkdown(post.title)
  const cleanExcerpt = stripMarkdown(post.excerpt)

  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full">
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={cleanTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500" />
          )}
          
          {/* Category Badge */}
          {post.category && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
              {post.category.name}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {cleanTitle}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
            {cleanExcerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at, 'short')}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
