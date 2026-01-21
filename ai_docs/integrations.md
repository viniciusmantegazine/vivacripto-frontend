# Integrações

## Visão Geral da Arquitetura de Integrações

```
┌─────────────────────────────────────────────────────────┐
│                 VerticeCripto Frontend                   │
│                     (Next.js)                            │
└─────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────┴────────┐     ┌────┴─────────────┐
        │                    │     │                  │
        ▼                    ▼     ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Backend API     │  │  CoinGecko API   │  │     Vercel       │
│  (Posts, Search) │  │  (Crypto Prices) │  │   (Hosting)      │
│                  │  │                  │  │                  │
│  Repositório     │  │  API Pública     │  │  CDN + Edge      │
│  Separado        │  │  Rate Limited    │  │  Functions       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Repositórios e Serviços Relacionados

### 1. Backend API (Repositório Próprio)

**Tipo**: API REST

**Propósito**: Fornecer dados de posts, categorias e funcionalidade de busca.

**Protocolo**: HTTP/HTTPS com JSON

**URL Base**:
- Desenvolvimento: `http://localhost:8000/api/v1`
- Produção: Configurada via `NEXT_PUBLIC_API_URL`

**Endpoints Consumidos**:

| Método | Endpoint | Descrição | Uso no Frontend |
|--------|----------|-----------|-----------------|
| GET | `/posts` | Lista posts paginados | Home, categorias |
| GET | `/posts/slug/{slug}` | Detalhes de um post | Página de artigo |
| GET | `/posts/search?q={query}&limit=50` | Busca por termo | Página de busca |

**Dados Trocados**:

```typescript
// Estrutura de Post recebida da API
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string | null;
  published_at?: string | null;
  status?: 'published' | 'draft';
  reading_time?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  author?: {
    id: number;
    name: string;
  } | null;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}
```

**Dependência**: Crítica - sem o backend, o portal não exibe conteúdo.

**Tratamento de Falhas**:
- Retorna array vazio ou `null` em caso de erro
- Logs de erro no console do servidor
- UI mostra estados vazios (empty states) sem quebrar

**Implementação**: `src/services/api.ts`

```typescript
export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_URL}/posts?limit=13`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch posts: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.filter(isValidPost);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}
```

---

### 2. CoinGecko API

**Tipo**: API REST Pública

**Propósito**: Obter dados de mercado de criptomoedas em tempo real.

**Protocolo**: HTTPS com JSON

**URL Base**: `https://api.coingecko.com/api/v3`

**Endpoint Consumido**:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5` | Top 5 criptos por market cap |

**Dados Recebidos**:

```typescript
interface CryptoData {
  id: string;              // "bitcoin"
  symbol: string;          // "btc"
  name: string;            // "Bitcoin"
  image: string;           // URL do ícone
  current_price: number;   // 67234.52
  price_change_percentage_24h: number;  // -2.34
  market_cap: number;      // 1320000000000
}
```

**Dependência**: Opcional - se falhar, ticker não é exibido.

**Tratamento de Falhas**:
- Componente não renderiza se dados não estiverem disponíveis
- Sem retry automático (apenas refresh manual)
- Log de erro no console

**Rate Limiting**:
- API pública: ~10-50 requests/minuto
- Frontend atualiza a cada 2 minutos para evitar throttling

**Implementação**: `src/components/crypto/Top5Crypto.tsx`

```typescript
useEffect(() => {
  async function fetchCryptoData() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5'
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    }
  }

  fetchCryptoData();
  const interval = setInterval(fetchCryptoData, 120000); // 2 min
  return () => clearInterval(interval);
}, []);
```

---

### 3. Vercel (Hosting & Infrastructure)

**Tipo**: Plataforma de Hospedagem

**Propósito**: Hospedar o frontend Next.js com CDN global.

**Serviços Utilizados**:

| Serviço | Uso |
|---------|-----|
| Edge Network | CDN para assets estáticos |
| Serverless Functions | API routes (revalidação) |
| Image Optimization | Otimização automática de imagens |
| Build & Deploy | CI/CD automático |

**Configuração**:
- Deploy automático na branch `main`
- Variáveis de ambiente configuradas no dashboard
- Domínio customizado: verticecripto.com.br

**Variáveis de Ambiente no Vercel**:
```
NEXT_PUBLIC_API_URL=<url-da-api-producao>
REVALIDATE_SECRET=<secret-para-isr>
```

---

## Dependências Externas

### Serviços de Imagem

**Cloudinary** (CDN de Imagens)
- Hospeda imagens de posts
- Domínio: `res.cloudinary.com`
- Configurado em `next.config.js`

**CoinGecko Assets** (Ícones de Crypto)
- Fornece ícones das criptomoedas
- Domínio: `assets.coingecko.com`
- Configurado em `next.config.js`

### Serviços de Compartilhamento

**Twitter/X Intent**
```
https://twitter.com/intent/tweet?url={url}&text={title}
```

**WhatsApp API**
```
https://api.whatsapp.com/send?text={title} {url}
```

**Clipboard API**
- API nativa do navegador
- Usado para "Copiar Link"

---

## Fluxo de Dados

### Carregamento da Home Page

```
1. Usuário acessa /
2. Next.js verifica cache ISR
3. Se expirado (>60s):
   a. Chama Backend API: GET /posts?limit=13
   b. Valida resposta
   c. Gera HTML
   d. Salva em cache
4. Retorna HTML cacheado
5. Client-side: Top5Crypto carrega dados do CoinGecko
```

### Visualização de Post

```
1. Usuário acessa /posts/slug-do-post
2. Next.js verifica cache ISR
3. Se não em cache ou expirado:
   a. Sanitiza slug
   b. Chama Backend API: GET /posts/slug/{slug}
   c. Valida resposta
   d. Se não encontrado: notFound()
   e. Gera HTML com JSON-LD
   f. Salva em cache
4. Retorna HTML
```

### Busca

```
1. Usuário digita no campo de busca
2. Formulário submete para /busca?q={query}
3. SearchContent (Client Component):
   a. Sanitiza query
   b. Chama Backend API: GET /posts/search?q={query}&limit=50
   c. Cancela requisição anterior se pendente (AbortController)
   d. Valida resposta
   e. Renderiza resultados ou empty state
```

### Revalidação ISR

```
1. Backend publica/atualiza post
2. Backend chama: POST /api/revalidate
   Body: { secret: "...", path: "/posts/slug" }
3. Frontend valida secret
4. Next.js revalida cache do path
5. Próxima requisição serve conteúdo atualizado
```

---

## Contratos de Integração

### Contrato com Backend

**Request Headers Esperados**:
```
Content-Type: application/json
```

**Response Format**:
```json
// Lista de Posts
[
  {
    "id": 1,
    "title": "Título do Post",
    "slug": "titulo-do-post",
    "excerpt": "Resumo...",
    "content": "Conteúdo completo em markdown...",
    "featured_image": "https://res.cloudinary.com/...",
    "published_at": "2024-01-15T10:30:00Z",
    "status": "published",
    "category": { "id": 1, "name": "Bitcoin", "slug": "bitcoin" },
    "author": { "id": 1, "name": "Autor" },
    "tags": [{ "id": 1, "name": "Tag", "slug": "tag" }]
  }
]

// Post Individual (mesmo formato, objeto único)

// Busca (array de posts filtrados)
```

**Error Responses**:
```json
// 404
{ "detail": "Post not found" }

// 500
{ "detail": "Internal server error" }
```

### Contrato de Revalidação

**Endpoint**: `POST /api/revalidate`

**Request**:
```json
{
  "secret": "string (REVALIDATE_SECRET)",
  "path": "string (caminho a revalidar, ex: /posts/meu-post)"
}
```

**Response Success**:
```json
{
  "revalidated": true
}
```

**Response Error**:
```json
{
  "message": "Invalid secret"
}
// Status: 401
```

---

## Resiliência e Fallbacks

### Falha do Backend

| Cenário | Comportamento |
|---------|---------------|
| API indisponível | Mostra cache ISR existente |
| Cache expirado + API down | Retorna erro ou página vazia |
| Post não encontrado | Página 404 do Next.js |

### Falha do CoinGecko

| Cenário | Comportamento |
|---------|---------------|
| API indisponível | Ticker não é renderizado |
| Rate limiting | Dados antigos mantidos até próximo refresh |
| Dados inválidos | Componente não renderiza |

### Falha de Imagens

| Cenário | Comportamento |
|---------|---------------|
| Cloudinary indisponível | Imagem quebrada (404) |
| Imagem não existe | Fallback para gradiente |
| CoinGecko icons down | Ícones de crypto não aparecem |

---

## Monitoramento e Observabilidade

### Logs

| Tipo | Local | Conteúdo |
|------|-------|----------|
| Erros de API | Console do servidor | Status codes, mensagens |
| Erros de validação | Console do servidor | Posts inválidos filtrados |
| Erros de client | Console do navegador | Falhas de fetch |

### Métricas Recomendadas

> **Nota**: Não há monitoramento implementado atualmente. Recomendações para o futuro:

1. **Vercel Analytics** - Performance de páginas
2. **Sentry** - Captura de erros
3. **Uptime monitoring** - Disponibilidade do backend

---

## Checklist de Integração

### Para Novo Desenvolvedor

- [ ] Clonar repositório do backend
- [ ] Iniciar backend em `localhost:8000`
- [ ] Copiar `.env.example` para `.env.local`
- [ ] Verificar `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Executar `npm run dev`
- [ ] Verificar se posts carregam na home

### Para Deploy em Produção

- [ ] Configurar `NEXT_PUBLIC_API_URL` no Vercel
- [ ] Configurar `REVALIDATE_SECRET` no Vercel
- [ ] Configurar webhook de revalidação no backend
- [ ] Verificar domínios de imagem em `next.config.js`
- [ ] Testar revalidação ISR

---

*Este documento deve ser atualizado quando novas integrações forem adicionadas ou contratos forem alterados.*
