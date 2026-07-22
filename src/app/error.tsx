'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error boundary]', error)
  }, [error])

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-500" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Algo deu errado
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Não foi possível carregar esta página. Tente novamente em instantes.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  )
}
