# Documentação do VerticeCripto Frontend

## Visão Geral

O **VerticeCripto** (anteriormente VivaCripto) é um portal de notícias sobre criptomoedas desenvolvido em Next.js 14. Este repositório contém o código do frontend, que consome uma API backend própria para exibir artigos, notícias e informações sobre o mercado de criptomoedas.

O portal é voltado para o público geral interessado em criptomoedas, oferecendo conteúdo informativo sobre Bitcoin, Ethereum, altcoins, DeFi, regulação e airdrops.

### Características Principais

- **Portal de Notícias Cripto**: Artigos e notícias categorizados sobre o mercado de criptomoedas
- **Ticker em Tempo Real**: Exibição de preços das principais criptomoedas via CoinGecko
- **Dark Mode**: Suporte completo a tema claro e escuro
- **SEO Otimizado**: Meta tags, sitemap dinâmico, JSON-LD estruturado
- **Performance**: ISR (Incremental Static Regeneration) para carregamento rápido

## Documentação Disponível

### Arquitetura e Stack
- [Stack Tecnológica](stack.md) - Tecnologias, frameworks e ferramentas utilizadas
- [Padrões de Design](patterns.md) - Padrões arquiteturais e de código

### Funcionalidades e Regras
- [Funcionalidades](features.md) - Descrição das funcionalidades principais
- [Regras de Negócio](business-rules.md) - Regras de negócio implementadas
- [Gotchas](gotchas.md) - Armadilhas, workarounds e conhecimento tácito

### Integrações
- [Integrações](integrations.md) - Comunicação com backend e serviços externos

## Links Rápidos

| Item | Descrição |
|------|-----------|
| **Repositório** | Frontend Next.js |
| **Backend** | API própria (repositório separado) |
| **Hospedagem** | Vercel |
| **Domínio** | verticecripto.com.br |

## Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd vivacripto-frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com as URLs corretas

# Iniciar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
REVALIDATE_SECRET=<secret-para-revalidacao-isr>
```

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router (páginas e rotas)
│   ├── layout.tsx         # Layout raiz com providers
│   ├── page.tsx           # Página inicial
│   ├── posts/[slug]/      # Páginas de artigos
│   ├── categoria/[slug]/  # Páginas de categorias
│   ├── busca/             # Página de busca
│   └── api/               # API routes (revalidação)
├── components/            # Componentes React
│   ├── layout/           # Header, Footer
│   ├── posts/            # Componentes de artigos
│   ├── crypto/           # Ticker de criptomoedas
│   ├── ui/               # Componentes UI reutilizáveis
│   └── providers/        # Context providers
├── services/             # Clientes de API
├── config/               # Configurações (categorias)
├── lib/                  # Utilitários
└── styles/               # Estilos globais
```

## Categorias de Conteúdo

| Categoria | Slug | Cor |
|-----------|------|-----|
| Bitcoin | bitcoin | Laranja |
| Ethereum | ethereum | Roxo |
| Altcoins | altcoins | Azul |
| DeFi | defi | Verde |
| Regulação | regulacao | Vermelho |
| Airdrop | airdrop | Amarelo |

## Contato e Suporte

Para dúvidas sobre este repositório, consulte a documentação completa nos arquivos listados acima ou entre em contato com a equipe de desenvolvimento.

---

*Documentação gerada para auxiliar desenvolvedores e sistemas de IA na compreensão do projeto.*
