import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'

/**
 * Loading state para a página principal
 * Exibido enquanto os dados são carregados no servidor
 */
export default function Loading() {
  return (
    <>
      <Header />

      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Top 5 Crypto Skeleton */}
          <div className="mb-8">
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-48 h-20 bg-white dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Hero + Grid Skeleton */}
          <SkeletonGrid count={10} showHero />
        </div>
      </main>

      <Footer />
    </>
  )
}
