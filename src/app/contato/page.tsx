import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { Mail, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Contato - VivaCripto',
  description: 'Entre em contato com a equipe do VivaCripto.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={[{ label: 'Contato' }]} />

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Entre em Contato
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Tem alguma dúvida, sugestão ou feedback? Estamos aqui para ouvir você!
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Email */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Email
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Para questões gerais, parcerias ou suporte:
                </p>
                <a
                  href="mailto:contato@vivacripto.com.br"
                  className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                >
                  contato@vivacripto.com.br
                </a>
              </div>

              {/* Feedback */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Feedback
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Sua opinião é importante para nós:
                </p>
                <a
                  href="mailto:feedback@vivacripto.com.br"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  feedback@vivacripto.com.br
                </a>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Perguntas Frequentes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Vocês oferecem consultoria de investimentos?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Não. O VivaCripto é um portal puramente informativo. Não oferecemos conselhos 
                    financeiros ou recomendações de investimento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Como posso sugerir uma pauta?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Envie sua sugestão para nosso email de contato. Analisamos todas as sugestões 
                    recebidas e priorizamos temas de interesse da comunidade cripto.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Posso republicar conteúdo do VivaCripto?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Entre em contato conosco para discutir parcerias e licenciamento de conteúdo.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
