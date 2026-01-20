import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LIST } from '@/config/categories'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  // Show first 4 categories in footer
  const footerCategories = CATEGORY_LIST.slice(0, 4)

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="VerticeCripto"
                width={180}
                height={100}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Seu portal de notícias sobre criptomoedas em português. Informação clara, objetiva e atualizada sobre o mercado cripto.
            </p>
          </div>

          {/* Links Rápidos */}
          <nav aria-label="Categorias">
            <h3 className="text-white font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Início
                </Link>
              </li>
              {footerCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Institucional */}
          <nav aria-label="Links institucionais">
            <h3 className="text-white font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="hover:text-orange-500 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-orange-500 transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-orange-500 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-orange-500 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} VerticeCripto. Todos os direitos reservados.</p>
          <p className="mt-2">
            Este site não oferece conselhos financeiros ou de investimento. Conteúdo meramente informativo.
          </p>
        </div>
      </div>
    </footer>
  )
}
