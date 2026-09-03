import { SkeletonGrid } from '@/components/ui/SkeletonCard'

/**
 * Loading state para a página principal
 * Exibido enquanto os dados são carregados no servidor
 */
export default function Loading() {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Hero + Grid Skeleton */}
          <SkeletonGrid count={10} showHero />
        </div>
      </main>
    </>
  )
}
