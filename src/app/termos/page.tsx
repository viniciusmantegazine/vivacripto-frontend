import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata = {
  title: 'Termos de Uso - VerticeCripto',
  description: 'Termos de uso do portal VerticeCripto.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={[{ label: 'Termos de Uso' }]} />

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Termos de Uso
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Última atualização: Janeiro de 2026
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ao acessar e usar o VerticeCripto, você concorda com estes Termos de Uso e nossa 
                  Política de Privacidade. Se você não concorda com algum termo, não utilize nosso site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Natureza do Conteúdo
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  O VerticeCripto é um portal de notícias <strong>puramente informativo</strong>. 
                  Todo o conteúdo publicado:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>É gerado com auxílio de inteligência artificial</li>
                  <li>Baseia-se em fontes públicas e confiáveis</li>
                  <li>Não constitui conselho financeiro ou de investimento</li>
                  <li>Não deve ser usado como única fonte para decisões de investimento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Isenção de Responsabilidade
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  O mercado de criptomoedas é altamente volátil e envolve riscos significativos. 
                  O VerticeCripto não se responsabiliza por:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                  <li>Perdas financeiras decorrentes de decisões baseadas em nosso conteúdo</li>
                  <li>Imprecisões ou erros no conteúdo publicado</li>
                  <li>Indisponibilidade temporária do site</li>
                  <li>Ações de terceiros ou links externos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Uso Aceitável
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ao usar o VerticeCripto, você concorda em:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                  <li>Não copiar ou redistribuir nosso conteúdo sem autorização</li>
                  <li>Não usar o site para atividades ilegais</li>
                  <li>Não tentar acessar áreas restritas do site</li>
                  <li>Respeitar os direitos de propriedade intelectual</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Propriedade Intelectual
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Todo o conteúdo do VerticeCripto, incluindo textos, imagens, logotipos e design, 
                  é protegido por direitos autorais. O uso não autorizado pode resultar em ações legais.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Modificações
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  Alterações significativas serão comunicadas através do site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Contato
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Para questões sobre estes Termos de Uso, entre em contato através de{' '}
                  <a href="mailto:contato@verticecripto.com.br" className="text-orange-600 dark:text-orange-400 hover:underline">
                    contato@verticecripto.com.br
                  </a>
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
