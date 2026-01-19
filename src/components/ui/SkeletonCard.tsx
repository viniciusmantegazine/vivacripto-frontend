/**
 * SkeletonCard - Loading placeholder para cards de posts
 * Mantém a mesma estrutura visual do PostCard para evitar layout shift
 */

interface SkeletonCardProps {
  variant?: 'standard' | 'compact' | 'hero'
}

export default function SkeletonCard({ variant = 'standard' }: SkeletonCardProps) {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        {/* Imagem skeleton */}
        <div className="relative h-[400px] md:h-[500px] bg-gray-200 dark:bg-gray-700 animate-pulse">
          {/* Gradient overlay simulado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Conteúdo overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {/* Badge skeleton */}
            <div className="w-24 h-7 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 animate-pulse" />

            {/* Título skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
            </div>

            {/* Excerpt skeleton */}
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-full mb-4 animate-pulse" />

            {/* Meta info skeleton */}
            <div className="flex gap-4">
              <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
        <div className="flex h-full">
          {/* Imagem lateral skeleton */}
          <div className="w-32 md:w-40 flex-shrink-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />

          {/* Conteúdo */}
          <div className="p-4 flex-1 flex flex-col justify-center">
            {/* Badge skeleton */}
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 animate-pulse" />

            {/* Título skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            </div>

            {/* Meta info skeleton */}
            <div className="flex gap-3">
              <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard variant (default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      {/* Imagem skeleton */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
        {/* Badge skeleton */}
        <div className="absolute top-3 left-3 w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Título skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonGrid - Grid de skeletons para loading
 */
interface SkeletonGridProps {
  count?: number
  showHero?: boolean
}

export function SkeletonGrid({ count = 9, showHero = false }: SkeletonGridProps) {
  return (
    <>
      {showHero && (
        <section className="mb-12">
          <SkeletonCard variant="hero" />
        </section>
      )}

      <section className="mb-12">
        {/* Título skeleton */}
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-gray-200 dark:bg-gray-700 mr-3 rounded-full" />
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonCard key={index} variant="standard" />
          ))}
        </div>
      </section>
    </>
  )
}
