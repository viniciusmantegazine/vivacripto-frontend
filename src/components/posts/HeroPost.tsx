import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'
import { stripMarkdown, cleanMetaDescription, calculateReadingTime, formatDate } from '@/lib/utils'

interface HeroPostProps {
  post: Post
}

export default function HeroPost({ post }: HeroPostProps) {
  const readingTime = calculateReadingTime(post.content_markdown)
  const cleanTitle = stripMarkdown(post.title)
  const cleanExcerpt = cleanMetaDescription(post.excerpt)

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={cleanTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500" />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            {/* Category Badge */}
            {post.category && (
              <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full mb-4">
                {post.category.name}
              </span>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight group-hover:text-orange-300 transition-colors">
              {cleanTitle}
            </h1>
            
            {/* Excerpt */}
            <p className="text-lg md:text-xl text-gray-200 mb-4 line-clamp-2">
              {cleanExcerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at || post.created_at, 'long')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
