import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Post } from '@/services/api'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {post.featured_image_url && (
          <div className="relative w-full h-48">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            {post.published_at && (
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), "d 'de' MMM", { locale: ptBR })}
              </time>
            )}
            {post.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {post.category.name}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
