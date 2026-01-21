# CLAUDE.md - Instruções para Claude Code

Este arquivo contém instruções e contexto para o Claude Code ao trabalhar neste repositório.

## Visão Geral do Projeto

**VerticeCripto** é um portal de notícias sobre criptomoedas. Este repositório contém o **frontend** em Next.js 14, que consome uma API backend separada.

- **Domínio**: verticecripto.com.br
- **Público-alvo**: Público geral interessado em criptomoedas
- **Hospedagem**: Vercel

## Stack Tecnológica

- **Framework**: Next.js 14.1.0 (App Router)
- **Linguagem**: TypeScript 5.3.3
- **UI**: React 18.2.0
- **Estilização**: TailwindCSS 3.4.1
- **Tema**: next-themes (dark/light mode)
- **Ícones**: lucide-react
- **Markdown**: react-markdown
- **Datas**: date-fns

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router (páginas)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Home (ISR 60s)
│   ├── posts/[slug]/      # Artigos (ISR 60s)
│   ├── categoria/[slug]/  # Categorias
│   ├── busca/             # Busca (client-side)
│   └── api/revalidate/    # Endpoint de revalidação ISR
├── components/            # Componentes React
│   ├── layout/           # Header, Footer
│   ├── posts/            # HeroSection, ArticleGrid, PostCard
│   ├── crypto/           # Top5Crypto (ticker)
│   ├── ui/               # Componentes reutilizáveis
│   └── providers/        # ThemeProvider
├── services/api.ts       # Cliente de API com validação
├── config/categories.ts  # Configuração de categorias
├── lib/utils.ts          # Utilitários (formatação, sanitização)
└── styles/globals.css    # Estilos globais + CSS variables
```

## Comandos Importantes

```bash
npm run dev      # Desenvolvimento (localhost:3000)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # URL do backend
REVALIDATE_SECRET=<secret>                         # Secret para ISR
```

> **Importante**: Variáveis com `NEXT_PUBLIC_` são expostas ao client-side.

## Padrões de Código

### Componentes
- Use **Server Components** por padrão
- Adicione `'use client'` apenas quando necessário (hooks, interatividade)
- Organize por feature: `components/posts/`, `components/crypto/`

### Nomenclatura
- Componentes: `PascalCase` (PostCard.tsx)
- Funções/variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### Estilização
- Use classes Tailwind diretamente
- Dark mode via classe `.dark` no html
- CSS variables em `globals.css` para temas

### Segurança
- **Sempre valide** dados da API com `isValidPost()`
- **Sempre sanitize** input do usuário (busca, slugs)
- Funções em `lib/utils.ts`: `sanitizeSearchQuery()`, `sanitizeSlug()`

## Categorias

Definidas em `config/categories.ts`:

| Categoria | Slug | Cor |
|-----------|------|-----|
| Bitcoin | bitcoin | orange-500 |
| Ethereum | ethereum | purple-500 |
| Altcoins | altcoins | blue-500 |
| DeFi | defi | green-500 |
| Regulação | regulacao | red-500 |
| Airdrop | airdrop | yellow-500 |

## Integrações

### Backend API
- **Endpoints**: `/posts`, `/posts/slug/{slug}`, `/posts/search`
- **Validação**: Todos os posts são validados antes de uso
- **Erros**: Retorna arrays vazios ou `null`, nunca quebra a UI

### CoinGecko API
- **Uso**: Ticker de preços (Top 5 criptos)
- **Atualização**: A cada 2 minutos
- **Componente**: `components/crypto/Top5Crypto.tsx`

### Revalidação ISR
- **Endpoint**: `POST /api/revalidate`
- **Body**: `{ "secret": "...", "path": "/posts/slug" }`

## Gotchas Importantes

1. **ISR não funciona em `npm run dev`** - Use `npm run build && npm run start` para testar

2. **Variáveis de ambiente são substituídas em build time** - Mudanças requerem rebuild

3. **Imagens externas precisam estar na whitelist** - Configurar em `next.config.js`

4. **Posts sem imagem usam gradiente** - É intencional, não bug

5. **Busca tem sanitização pesada** - Não remover, é por segurança

6. **Categorias são estáticas** - Filtradas client-side, mudanças precisam de revalidação

## Regras de Negócio

- **Disclaimer financeiro** é obrigatório em todas as páginas
- **Tempo de leitura**: ~200 palavras/minuto
- **Limites**: Home 13 posts, busca 50 resultados, relacionados 3 posts
- **Preços**: 2 decimais para >= $1, 4-6 para < $1
- **Market cap**: Abreviado (T/B/M)

## Documentação Completa

Para documentação detalhada, consulte a pasta `ai_docs/`:

- [index.md](ai_docs/index.md) - Índice geral
- [stack.md](ai_docs/stack.md) - Stack tecnológica
- [patterns.md](ai_docs/patterns.md) - Padrões de design
- [features.md](ai_docs/features.md) - Funcionalidades
- [business-rules.md](ai_docs/business-rules.md) - Regras de negócio
- [gotchas.md](ai_docs/gotchas.md) - Armadilhas e workarounds
- [integrations.md](ai_docs/integrations.md) - Integrações

## Ao Fazer Alterações

1. **Mantenha a validação de dados** - Nunca confie em dados externos
2. **Preserve a sanitização** - Segurança é prioridade
3. **Use Server Components quando possível** - Melhor performance
4. **Teste o dark mode** - Verifique ambos os temas
5. **Verifique responsividade** - Mobile-first com Tailwind
6. **Mantenha os disclaimers** - Requisito legal

## Contexto de Negócio

Este é um portal informativo sobre criptomoedas. **Não oferece conselho financeiro**. Todo conteúdo é educacional e os usuários são responsáveis por suas próprias decisões de investimento.

O portal enfatiza:
- Informação de qualidade sobre o mercado cripto
- Cobertura de Bitcoin, Ethereum, altcoins, DeFi e regulação
- Dados de mercado em tempo real (via CoinGecko)
- Experiência de leitura otimizada (dark mode, responsivo)
