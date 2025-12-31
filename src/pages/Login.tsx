import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuth } from "@/contexts/AuthContext";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { googleLoaded, renderButton } = useGoogleAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (googleLoaded) {
      renderButton("google-signin-button");
    }
  }, [googleLoaded, renderButton]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VivaCripto</h1>
          <p className="text-gray-600">
            Portal de Notícias de Criptomoedas
          </p>
        </div>

        <div className="space-y-6">
          <p className="text-center text-gray-600 text-sm">
            Faça login com sua conta Google para continuar
          </p>

          <div id="google-signin-button" className="flex justify-center" />

          {loading && (
            <div className="text-center">
              <p className="text-gray-500">Carregando...</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Ao fazer login, você concorda com nossos{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
