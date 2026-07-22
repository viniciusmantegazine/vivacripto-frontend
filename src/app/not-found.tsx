import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Página não encontrada',
  description: 'A página que você procura não foi encontrada.',
}

export default function NotFound() {
  return (
    <>
      <Header />

      <main
        id="main-content"
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md py-20">
          <p className="text-7xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            404
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Página não encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            A página que você procura não existe ou foi movida. Que tal voltar
            para a página inicial do VerticeCripto?
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Voltar para o início
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
