# VivaCripto Frontend

Frontend React para o portal de notícias de criptomoedas VivaCripto.

## 🚀 Stack Técnico

- **Framework**: React 19
- **Build**: Vite
- **Styling**: Tailwind CSS 4
- **Autenticação**: Google OAuth 2.0
- **HTTP Client**: Axios
- **Roteamento**: React Router v6
- **Hospedagem**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Credenciais do Google OAuth

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/viniciusmantegazine/vivacripto-frontend.git
cd vivacripto-frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

## 🔐 Configuração do Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a API "Google+ API"
4. Crie credenciais OAuth 2.0:
   - Tipo: Web application
   - URIs autorizados:
     - `http://localhost:5173` (desenvolvimento)
     - `https://seu-dominio.com` (produção)

5. Copie `Client ID` para `.env.local` como `VITE_GOOGLE_CLIENT_ID`

## 📁 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── hooks/          # Custom hooks
├── services/       # Serviços (API, etc)
├── contexts/       # Contextos React
├── types/          # Tipos TypeScript
├── utils/          # Funções utilitárias
├── styles/         # Estilos CSS
├── App.tsx         # Componente raiz
└── main.tsx        # Ponto de entrada
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Servidor rodará em http://localhost:5173
```

## 🏗️ Build

```bash
# Build para produção
npm run build

# Visualizar build localmente
npm run preview
```

## 📚 Arquitetura

### Autenticação

A autenticação é feita via Google OAuth 2.0:

1. Usuário clica em "Login com Google"
2. Google SDK carrega o widget de login
3. Usuário faz login e recebe um ID token
4. Frontend envia o ID token para o backend
5. Backend valida o token e retorna um JWT
6. Frontend armazena o JWT em localStorage
7. JWT é enviado em todas as requisições subsequentes

### Estado da Aplicação

O estado de autenticação é gerenciado via Context API (`AuthContext`):

- `user`: Dados do usuário autenticado
- `isAuthenticated`: Boolean indicando se está autenticado
- `loading`: Boolean indicando se está carregando
- `login()`: Função para fazer login
- `logout()`: Função para fazer logout

### API Client

O `apiClient` é um wrapper do Axios que:

- Configura automaticamente o header `Authorization` com o JWT
- Intercepta erros 401 e redireciona para login
- Gerencia o token em localStorage

## 🧪 Testes

```bash
# Rodar testes
npm test

# Modo watch
npm run test:watch
```

## 📦 Deploy no Vercel

1. Conectar repositório GitHub ao Vercel
2. Configurar variáveis de ambiente:
   - `VITE_API_URL`: URL do backend (ex: https://api.vivacripto.com)
   - `VITE_GOOGLE_CLIENT_ID`: Client ID do Google
3. Vercel fará deploy automático a cada push

## 🔒 Segurança

- Tokens JWT são armazenados em localStorage (considerar httpOnly cookies em produção)
- CORS é configurado no backend para aceitar apenas o frontend
- Variáveis sensíveis em `.env.local` (nunca commitar)
- Validação de entrada em formulários

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

MIT

## 📞 Suporte

Para suporte, abra uma issue no repositório GitHub.
