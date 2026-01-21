# Funcionalidades

## Funcionalidades Principais

### 1. Exibição de Artigos (Core Feature)

**Descrição**: Sistema completo de exibição de artigos e notícias sobre criptomoedas, desde a listagem até a leitura completa.

**Casos de Uso**:
- Usuário acessa a home e vê os artigos mais recentes
- Usuário navega por categoria para encontrar conteúdo específico
- Usuário lê artigo completo com informações detalhadas

**Componentes Envolvidos**:
- `app/page.tsx` - Página inicial com listagem
- `app/posts/[slug]/page.tsx` - Página de artigo individual
- `components/posts/HeroSection.tsx` - Seção de destaque
- `components/posts/ArticleGrid.tsx` - Grade de artigos
- `components/posts/PostCard.tsx` - Card de artigo
- `components/posts/RelatedPosts.tsx` - Artigos relacionados

**Fluxo de Dados**:
```
Backend API → getPosts() → HeroSection/ArticleGrid → PostCard
                         ↓
            getPostBySlug() → PostPage → Full Article
```

**Variantes do PostCard**:

| Variante | Uso | Layout |
|----------|-----|--------|
| `standard` | Grid principal | Imagem em cima, texto embaixo |
| `featured` | Hero section | Maior, com mais destaque |
| `compact` | Sidebar, relacionados | Horizontal, imagem à esquerda |

---

### 2. Ticker de Criptomoedas

**Descrição**: Exibição em tempo real dos preços das 5 principais criptomoedas, com dados atualizados automaticamente.

**Casos de Uso**:
- Usuário vê rapidamente os preços atuais do mercado
- Usuário identifica tendência de alta/baixa pelas cores
- Usuário no mobile expande para ver todos os ativos

**Componentes Envolvidos**:
- `components/crypto/Top5Crypto.tsx` - Componente principal

**Dados Exibidos**:
- Nome e símbolo da criptomoeda
- Preço atual em USD
- Variação percentual 24h (com indicador de cor)
- Market cap abreviado
- Ícone da moeda

**Comportamento**:
- Atualização automática a cada 2 minutos
- Scroll horizontal no desktop
- Grid expansível no mobile
- Indicadores visuais de alta (verde) e baixa (vermelho)

**Fonte de Dados**: CoinGecko API (pública)

---

### 3. Sistema de Busca

**Descrição**: Busca full-text em artigos com resultados em tempo real.

**Casos de Uso**:
- Usuário busca por termo específico
- Usuário acessa busca via header
- Usuário vê resultados filtrados

**Componentes Envolvidos**:
- `app/busca/page.tsx` - Página de busca (Server Component)
- `components/SearchContent.tsx` - Lógica de busca (Client Component)
- Header search input

**Fluxo de Busca**:
```
Input → Sanitização → API /posts/search → Validação → Exibição
```

**Características**:
- Sanitização de query para segurança
- Limite de 50 resultados
- AbortController para cancelar requisições pendentes
- Empty state quando sem resultados
- Contagem de resultados exibida

---

### 4. Sistema de Categorias

**Descrição**: Organização de conteúdo em categorias temáticas com páginas dedicadas.

**Casos de Uso**:
- Usuário navega para categoria específica
- Usuário filtra conteúdo por interesse
- Usuário descobre conteúdo relacionado

**Componentes Envolvidos**:
- `app/categoria/[slug]/page.tsx` - Página de categoria
- `config/categories.ts` - Definição de categorias
- `components/ui/CategoryBadge.tsx` - Badge visual

**Categorias Disponíveis**:

| Categoria | Slug | Descrição |
|-----------|------|-----------|
| Bitcoin | `bitcoin` | Notícias sobre Bitcoin |
| Ethereum | `ethereum` | Notícias sobre Ethereum |
| Altcoins | `altcoins` | Outras criptomoedas |
| DeFi | `defi` | Finanças descentralizadas |
| Regulação | `regulacao` | Legislação e compliance |
| Airdrop | `airdrop` | Distribuições gratuitas de tokens |

**Cores por Categoria**:
```typescript
Bitcoin:   bg-orange-500  (Laranja)
Ethereum:  bg-purple-500  (Roxo)
Altcoins:  bg-blue-500    (Azul)
DeFi:      bg-green-500   (Verde)
Regulação: bg-red-500     (Vermelho)
Airdrop:   bg-yellow-500  (Amarelo)
```

---

### 5. Dark Mode

**Descrição**: Alternância entre tema claro e escuro com persistência de preferência.

**Casos de Uso**:
- Usuário prefere tema escuro para leitura noturna
- Usuário alterna tema via toggle no header
- Sistema respeita preferência do SO

**Componentes Envolvidos**:
- `components/providers/ThemeProvider.tsx` - Provider do tema
- `components/ui/ThemeToggle.tsx` - Botão de alternância
- `styles/globals.css` - CSS variables

**Comportamento**:
- Preferência salva em localStorage
- Respeita `prefers-color-scheme` do sistema
- Sem flash de tema errado (FOUC) no carregamento
- Logo adapta ao tema (logo-light.png / logo-dark.png)

---

### 6. Compartilhamento Social

**Descrição**: Botões para compartilhar artigos em redes sociais e copiar link.

**Casos de Uso**:
- Usuário compartilha artigo no Twitter/X
- Usuário envia artigo via WhatsApp
- Usuário copia link para compartilhar em outro lugar

**Componentes Envolvidos**:
- `components/ui/ShareButtons.tsx`

**Opções de Compartilhamento**:
- **Twitter/X**: Abre intent com título e URL
- **WhatsApp**: Abre WhatsApp Web/App com mensagem
- **Copiar Link**: Copia URL para clipboard com feedback visual

---

### 7. SEO e Metadados

**Descrição**: Otimização para mecanismos de busca com metadados dinâmicos.

**Casos de Uso**:
- Google indexa páginas corretamente
- Links compartilhados mostram preview rico
- Sitemap é gerado automaticamente

**Componentes Envolvidos**:
- `app/layout.tsx` - Metadados globais
- `app/sitemap.ts` - Sitemap dinâmico
- `app/robots.ts` - Robots.txt
- Metadados em cada página

**Recursos Implementados**:

| Recurso | Implementação |
|---------|---------------|
| Meta tags | Title, description dinâmicos |
| Open Graph | og:title, og:description, og:image |
| Twitter Cards | summary_large_image |
| JSON-LD | Schema NewsArticle |
| Sitemap | Gerado dinamicamente |
| Robots.txt | Permite indexação completa |
| Canonical URLs | URLs canônicas por página |

---

## Funcionalidades Secundárias

### Breadcrumbs

**Descrição**: Navegação hierárquica mostrando localização do usuário.

**Localização**: Páginas de artigo e categoria

**Componente**: `components/ui/Breadcrumbs.tsx`

---

### Loading States (Skeletons)

**Descrição**: Placeholders visuais durante carregamento de conteúdo.

**Componentes**:
- `app/loading.tsx` - Loading global
- `components/ui/SkeletonCard.tsx` - Skeleton de card

---

### Páginas Institucionais

**Descrição**: Páginas estáticas com informações sobre o portal.

| Página | URL | Conteúdo |
|--------|-----|----------|
| Sobre | `/sobre` | Missão, processo editorial |
| Contato | `/contato` | Email, feedback, FAQ |
| Privacidade | `/privacidade` | Política de privacidade |
| Termos | `/termos` | Termos de uso |

---

### API de Revalidação

**Descrição**: Endpoint para forçar revalidação de cache ISR.

**URL**: `POST /api/revalidate`

**Uso**: Webhook do backend quando conteúdo é atualizado

**Segurança**: Requer `REVALIDATE_SECRET` no body

---

## Funcionalidades em Desenvolvimento

> **Nota**: Não há funcionalidades em desenvolvimento ativo no momento. O roadmap não está definido.

---

## Funcionalidades Deprecated

> **Nota**: Não há funcionalidades marcadas para remoção.

---

## Mapa de Funcionalidades por Página

### Home (`/`)
- ✅ Hero com artigo principal
- ✅ Grade de artigos recentes
- ✅ Ticker de criptomoedas
- ✅ Navegação por categorias

### Artigo (`/posts/[slug]`)
- ✅ Conteúdo completo em Markdown
- ✅ Imagem de destaque
- ✅ Metadados (data, autor, categoria)
- ✅ Tempo de leitura
- ✅ Botões de compartilhamento
- ✅ Artigos relacionados
- ✅ Breadcrumbs
- ✅ JSON-LD estruturado

### Categoria (`/categoria/[slug]`)
- ✅ Listagem filtrada por categoria
- ✅ Informações da categoria
- ✅ Breadcrumbs
- ✅ Contagem de artigos

### Busca (`/busca`)
- ✅ Campo de busca
- ✅ Resultados em grid
- ✅ Contagem de resultados
- ✅ Empty state

### Header
- ✅ Logo responsivo (light/dark)
- ✅ Navegação por categorias
- ✅ Campo de busca (desktop)
- ✅ Toggle de tema
- ✅ Menu mobile hamburger

### Footer
- ✅ Logo e descrição
- ✅ Links de categorias
- ✅ Links institucionais
- ✅ Disclaimer financeiro
- ✅ Copyright

---

*Esta documentação cobre todas as funcionalidades implementadas no frontend do VerticeCripto.*
