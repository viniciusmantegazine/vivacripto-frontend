# Stack Tecnológica

## Linguagens e Runtime

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **TypeScript** | 5.3.3 | Linguagem principal com tipagem estática |
| **Node.js** | 18+ | Runtime de execução |

### Por que TypeScript?
- Detecção de erros em tempo de desenvolvimento
- IntelliSense e autocompletion aprimorados
- Documentação implícita através de tipos
- Refatoração segura do código

## Framework Principal

### Next.js 14.1.0

Framework React full-stack com recursos avançados:

- **App Router**: Sistema de roteamento baseado em pastas (`src/app/`)
- **Server Components**: Componentes renderizados no servidor por padrão
- **ISR (Incremental Static Regeneration)**: Revalidação de páginas estáticas em background
- **Image Optimization**: Otimização automática de imagens com `next/image`
- **Font Optimization**: Carregamento otimizado de fontes com `next/font`

### React 18.2.0

Biblioteca de UI com recursos modernos:

- **Server Components**: Renderização no servidor
- **Suspense**: Carregamento progressivo de componentes
- **Concurrent Features**: Renderização concorrente

## Bibliotecas Principais

### Estilização

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| **TailwindCSS** | 3.4.1 | Framework CSS utility-first |
| **@tailwindcss/typography** | 0.5.19 | Plugin para estilização de prosa/markdown |
| **PostCSS** | 8.4.33 | Processador CSS |
| **Autoprefixer** | 10.4.17 | Prefixos de vendor automáticos |

### UI e Funcionalidades

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| **next-themes** | 0.4.6 | Gerenciamento de tema dark/light mode |
| **lucide-react** | 0.562.0 | Biblioteca de ícones SVG |
| **react-markdown** | 9.0.1 | Renderização de Markdown para React |
| **date-fns** | 3.2.0 | Manipulação e formatação de datas |

## Ferramentas de Desenvolvimento

### Linting e Qualidade

| Ferramenta | Versão | Propósito |
|------------|--------|-----------|
| **ESLint** | 8.56.0 | Linting de código JavaScript/TypeScript |
| **eslint-config-next** | 14.1.0 | Configuração ESLint específica para Next.js |

### Configuração TypeScript

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Destaque**: Path alias `@/*` permite imports limpos como `@/components/Header`.

## Infraestrutura

### Hospedagem

| Serviço | Propósito |
|---------|-----------|
| **Vercel** | Hospedagem do frontend Next.js |
| **Backend próprio** | API REST separada |

### Domínios de Imagem Permitidos

Configurados em `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { hostname: 'res.cloudinary.com' },  // Imagens de posts
    { hostname: 'assets.coingecko.com' } // Ícones de criptomoedas
  ]
}
```

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │               Next.js Frontend                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │  │
│  │  │ Static Pages│  │ ISR Pages   │  │ CSR       │ │  │
│  │  │ (categoria) │  │ (posts,home)│  │ (search)  │ │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   Backend API       │         │   CoinGecko API     │
│   (Posts, Search)   │         │   (Crypto Prices)   │
└─────────────────────┘         └─────────────────────┘
```

### Estratégias de Renderização

| Página | Estratégia | Revalidação |
|--------|------------|-------------|
| Home (`/`) | ISR | 60 segundos |
| Posts (`/posts/[slug]`) | ISR + Dynamic | 60 segundos |
| Categorias (`/categoria/[slug]`) | SSG | Build time |
| Busca (`/busca`) | CSR | N/A (client-side) |
| Páginas estáticas | SSG | Build time |

## Decisões Arquiteturais Importantes

### 1. Next.js App Router vs Pages Router

**Escolha**: App Router

**Razões**:
- Server Components por padrão (melhor performance)
- Layouts aninhados (código mais organizado)
- Streaming e Suspense nativos
- Futuro do Next.js

### 2. TailwindCSS vs CSS Modules/Styled Components

**Escolha**: TailwindCSS

**Razões**:
- Desenvolvimento mais rápido
- Bundle CSS menor (purge automático)
- Consistência de design via design tokens
- Excelente suporte a dark mode

### 3. ISR vs SSR vs SSG

**Escolha**: Mix de estratégias

**Razões**:
- ISR para conteúdo que muda (posts, home): balanceio entre frescor e performance
- SSG para conteúdo estático (categorias, páginas institucionais): máxima performance
- CSR para interatividade (busca, ticker): melhor UX

### 4. next-themes para Dark Mode

**Escolha**: next-themes

**Razões**:
- Evita flash de conteúdo errado (FOUC)
- Persiste preferência do usuário
- Suporta preferência do sistema
- Integração simples com TailwindCSS

## Scripts NPM

```json
{
  "dev": "next dev",           // Desenvolvimento local
  "build": "next build",       // Build de produção
  "start": "next start",       // Servidor de produção
  "lint": "next lint"          // Verificação de código
}
```

## Dependências de Produção vs Desenvolvimento

### Produção (dependencies)
- next, react, react-dom
- next-themes
- lucide-react
- react-markdown
- date-fns

### Desenvolvimento (devDependencies)
- typescript, @types/*
- tailwindcss, postcss, autoprefixer
- eslint, eslint-config-next

---

*Esta stack foi escolhida para otimizar performance, developer experience e SEO, essenciais para um portal de notícias.*
