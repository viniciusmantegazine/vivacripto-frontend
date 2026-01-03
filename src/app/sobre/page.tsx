import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata = {
  title: 'Sobre Nós - VivaCripto',
  description: 'Conheça o VivaCripto, seu portal de notícias sobre criptomoedas em português.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={[{ label: 'Sobre Nós' }]} />

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Sobre o VivaCripto
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                O <strong>VivaCripto</strong> é o seu portal de notícias sobre criptomoedas em português, 
                criado para manter você informado sobre as últimas novidades do mercado cripto de forma 
                clara, objetiva e acessível.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Nossa Missão
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Democratizar o acesso à informação sobre criptomoedas, oferecendo conteúdo de qualidade 
                em português brasileiro. Acreditamos que todos devem ter acesso a informações confiáveis 
                sobre Bitcoin, Ethereum, DeFi e o universo das criptomoedas.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                O Que Fazemos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Utilizamos tecnologia de ponta, incluindo inteligência artificial, para agregar, 
                processar e apresentar as principais notícias do mercado cripto. Nosso processo 
                automatizado garante:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                <li>Atualizações constantes sobre o mercado</li>
                <li>Cobertura abrangente de Bitcoin, Ethereum, Altcoins, DeFi e Regulação</li>
                <li>Conteúdo em português brasileiro de fácil compreensão</li>
                <li>Informações verificadas de fontes confiáveis</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Nosso Compromisso
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                O VivaCripto é um portal <strong>puramente informativo</strong>. Não oferecemos 
                conselhos financeiros, recomendações de investimento ou calls de trade. Nosso 
                objetivo é informar, não influenciar decisões de investimento.
              </p>

              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-r-lg mt-8">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  <strong>Importante:</strong> O mercado de criptomoedas é volátil e envolve riscos. 
                  Sempre faça sua própria pesquisa (DYOR) e consulte profissionais qualificados antes 
                  de tomar decisões de investimento.
                </p>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
