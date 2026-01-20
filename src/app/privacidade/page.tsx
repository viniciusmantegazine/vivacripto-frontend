import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata = {
  title: 'Política de Privacidade - VerticeCripto',
  description: 'Política de privacidade do portal VerticeCripto.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Breadcrumbs items={[{ label: 'Política de Privacidade' }]} />

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Última atualização: Janeiro de 2026
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Introdução
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  O VerticeCripto respeita sua privacidade e está comprometido em proteger seus dados pessoais. 
                  Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações 
                  em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Dados Coletados
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Coletamos as seguintes informações:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Dados de navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas</li>
                  <li><strong>Newsletter:</strong> Email fornecido voluntariamente para assinatura</li>
                  <li><strong>Cookies:</strong> Dados técnicos para melhorar a experiência do usuário</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Uso dos Dados
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Utilizamos seus dados para:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                  <li>Melhorar a experiência de navegação no site</li>
                  <li>Enviar newsletters (apenas se você se inscreveu)</li>
                  <li>Analisar estatísticas de uso do site</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Compartilhamento de Dados
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                  <li>Quando exigido por lei</li>
                  <li>Com provedores de serviços essenciais (hospedagem, analytics)</li>
                  <li>Com seu consentimento explícito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Cookies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência. Você pode desativar cookies nas 
                  configurações do seu navegador, mas isso pode afetar a funcionalidade do site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Seus Direitos (LGPD)
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Você tem direito a:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar consentimento para uso de dados</li>
                  <li>Solicitar portabilidade de dados</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Para exercer seus direitos, entre em contato através de{' '}
                  <a href="mailto:privacidade@verticecripto.com.br" className="text-orange-600 dark:text-orange-400 hover:underline">
                    privacidade@verticecripto.com.br
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Segurança
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados contra 
                  acesso não autorizado, perda ou alteração. No entanto, nenhum sistema é 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Retenção de Dados
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas 
                  nesta política ou conforme exigido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Alterações na Política
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas 
                  serão comunicadas através do site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Contato
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Para questões sobre privacidade, entre em contato através de{' '}
                  <a href="mailto:privacidade@verticecripto.com.br" className="text-orange-600 dark:text-orange-400 hover:underline">
                    privacidade@verticecripto.com.br
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
