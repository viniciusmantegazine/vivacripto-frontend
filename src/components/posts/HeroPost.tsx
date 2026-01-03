import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { Post } from '@/services/api'

interface HeroPostProps {
  post: Post
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function HeroPost({ post }: HeroPostProps) {
  const readingTime = calculateReadingTime(post.content_markdown)

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
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
              {post.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-lg md:text-xl text-gray-200 mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
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
