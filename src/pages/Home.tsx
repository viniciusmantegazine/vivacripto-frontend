import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">VivaCripto</h1>
            {isAuthenticated && user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{user.name}</span>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao VivaCripto
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Portal de Notícias de Criptomoedas com Inteligência Artificial
          </p>

          {isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-700 mb-4">
                Olá, {user?.name}! 👋
              </p>
              <p className="text-gray-600">
                Você está autenticado e pode acessar todos os recursos do portal.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-700 mb-4">
                Faça login para acessar o portal completo
              </p>
              <a
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Ir para Login
              </a>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📰 Notícias Automáticas
            </h3>
            <p className="text-gray-600">
              10 notícias geradas por IA diariamente sobre criptomoedas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🤖 Inteligência Artificial
            </h3>
            <p className="text-gray-600">
              Conteúdo gerado com GPT-4 e imagens com DALL-E 3
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📧 Newsletter
            </h3>
            <p className="text-gray-600">
              Resumo diário das principais notícias entregue em seu email
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p>&copy; 2025 VivaCripto. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
