import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">VC</span>
              </div>
              <span className="text-2xl font-bold text-white">VivaCripto</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Seu portal de notícias sobre criptomoedas em português. Informação clara, objetiva e atualizada sobre o mercado cripto.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-orange-500 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/categoria/bitcoin" className="hover:text-orange-500 transition-colors">
                  Bitcoin
                </Link>
              </li>
              <li>
                <Link href="/categoria/ethereum" className="hover:text-orange-500 transition-colors">
                  Ethereum
                </Link>
              </li>
              <li>
                <Link href="/categoria/defi" className="hover:text-orange-500 transition-colors">
                  DeFi
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
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
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} VivaCripto. Todos os direitos reservados.</p>
          <p className="mt-2">
            Este site não oferece conselhos financeiros ou de investimento. Conteúdo meramente informativo.
          </p>
        </div>
      </div>
    </footer>
  )
}
