# Regras de Negócio

## Regras Críticas

### 1. Disclaimer Financeiro Obrigatório

**Descrição**: Todo conteúdo do portal deve deixar claro que não constitui conselho financeiro.

**Justificativa**:
- Proteção legal do portal e da empresa
- Responsabilidade do usuário por suas decisões de investimento
- Compliance com regulamentações do mercado financeiro

**Implementação**:
- Footer de todas as páginas contém disclaimer
- Página de artigo inclui aviso no final
- Página de termos detalha a limitação de responsabilidade

**Texto Padrão**:
> "VerticeCripto é um portal informativo e não oferece aconselhamento financeiro. Criptomoedas são ativos voláteis - faça sua própria pesquisa (DYOR)."

**Exceções**: Nenhuma. O disclaimer deve estar presente em todas as páginas.

---

### 2. Validação de Posts da API

**Descrição**: Todos os posts recebidos da API devem ser validados antes de exibição.

**Justificativa**:
- Prevenção de erros de runtime
- Segurança contra dados maliciosos
- Garantia de integridade da UI

**Implementação**: `services/api.ts` - função `isValidPost()`

**Validações**:
```typescript
// Campos obrigatórios
id: number          // Deve existir
title: string       // Deve existir e não ser vazio
slug: string        // Deve existir e não ser vazio

// Campos opcionais (com fallbacks)
excerpt: string     // Default: ''
content: string     // Default: ''
featured_image: string | null  // Default: null
category: object | null        // Default: null
published_at: string | null    // Default: null
author: object | null          // Default: null
```

**Consequência de Falha**: Posts inválidos são silenciosamente removidos da lista.

---

### 3. Sanitização de Entrada do Usuário

**Descrição**: Toda entrada do usuário deve ser sanitizada antes de uso.

**Justificativa**:
- Prevenção de XSS (Cross-Site Scripting)
- Prevenção de SQL Injection
- Segurança geral da aplicação

**Implementação**: `lib/utils.ts`

**Regras de Sanitização**:

| Input | Função | Transformações |
|-------|--------|----------------|
| Query de busca | `sanitizeSearchQuery()` | Remove HTML, SQL chars, control chars, limita a 200 chars |
| Slug de URL | `sanitizeSlug()` | Apenas alfanuméricos, hífens e underscores, limita a 200 chars |
| JSON-LD | `escapeJsonLd()` | Escapa HTML entities, remove JS URLs e event handlers |

---

## Regras de Exibição de Conteúdo

### 4. Hierarquia Visual da Home

**Descrição**: A home page deve seguir uma hierarquia visual específica para destacar conteúdo importante.

**Regras**:
1. **Hero Section**: 1 post principal (2/3 da largura) + 2 posts secundários (1/3 da largura)
2. **Grid Principal**: Posts restantes em grid responsivo
3. **Ordem**: Sempre por data de publicação (mais recente primeiro)

**Implementação**: `app/page.tsx`

```
┌─────────────────────────────────┬──────────────┐
│                                 │   Post 2     │
│        Post Principal           │──────────────│
│           (2/3)                 │   Post 3     │
└─────────────────────────────────┴──────────────┘
┌──────────────┬──────────────┬──────────────┐
│    Post 4    │    Post 5    │    Post 6    │
├──────────────┼──────────────┼──────────────┤
│    Post 7    │    Post 8    │    Post 9    │
└──────────────┴──────────────┴──────────────┘
```

---

### 5. Limites de Quantidade

**Descrição**: Limites definidos para quantidade de itens exibidos em cada contexto.

| Contexto | Limite | Justificativa |
|----------|--------|---------------|
| Home - Total de posts | 13 | Performance e UX |
| Home - Hero | 3 (1 + 2) | Hierarquia visual |
| Home - Grid | 10 | Completar a home |
| Busca - Resultados | 50 | Performance |
| Categoria - Posts | 50 | Performance |
| Artigos Relacionados | 3 | Não sobrecarregar |
| Ticker - Criptos | 5 | Top 5 do mercado |

---

### 6. Cálculo de Tempo de Leitura

**Descrição**: O tempo de leitura é calculado automaticamente baseado no conteúdo.

**Fórmula**:
```typescript
const WORDS_PER_MINUTE = 200;
const wordCount = content.split(/\s+/).length;
const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
```

**Exibição**: "X min de leitura"

**Mínimo**: 1 minuto (mesmo para conteúdos muito curtos)

---

### 7. Formatação de Preços de Criptomoedas

**Descrição**: Preços devem ser formatados de acordo com seu valor.

**Regras**:
```typescript
if (price >= 1) {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
if (price >= 0.01) {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
}
return price.toLocaleString('en-US', {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6
});
```

**Exemplos**:
- Bitcoin: $67,234.52
- Ethereum: $3,456.78
- Shiba Inu: $0.000025

---

### 8. Formatação de Market Cap

**Descrição**: Market cap deve ser abreviado para legibilidade.

**Regras**:
```typescript
if (value >= 1_000_000_000_000) return `$${(value / 1e12).toFixed(2)}T`;
if (value >= 1_000_000_000) return `$${(value / 1e9).toFixed(2)}B`;
if (value >= 1_000_000) return `$${(value / 1e6).toFixed(2)}M`;
return `$${value.toLocaleString()}`;
```

**Exemplos**:
- $1.32T (trilhão)
- $425.67B (bilhão)
- $89.23M (milhão)

---

## Regras de Categorização

### 9. Categorias Fixas

**Descrição**: O sistema possui um conjunto fixo de categorias predefinidas.

**Justificativa**: Consistência editorial e organização do conteúdo.

**Categorias Válidas**:
```typescript
const VALID_CATEGORIES = [
  'bitcoin',
  'ethereum',
  'altcoins',
  'defi',
  'regulacao',
  'airdrop'
];
```

**Regra**: Cada post pertence a exatamente uma categoria.

**Fallback**: Posts sem categoria válida são tratados como "sem categoria" (badge cinza).

---

### 10. Cores de Categoria

**Descrição**: Cada categoria possui uma cor específica para identificação visual.

**Mapeamento**:
```typescript
const categoryColors: Record<string, string> = {
  bitcoin: 'bg-orange-500',
  ethereum: 'bg-purple-500',
  altcoins: 'bg-blue-500',
  defi: 'bg-green-500',
  regulacao: 'bg-red-500',
  airdrop: 'bg-yellow-500',
  default: 'bg-gray-500'
};
```

**Uso**: CategoryBadge aplica automaticamente a cor correta.

---

## Regras de Cache e Revalidação

### 11. Estratégia de Revalidação ISR

**Descrição**: Páginas usam ISR com diferentes tempos de revalidação.

| Página | Revalidação | Justificativa |
|--------|-------------|---------------|
| Home | 60 segundos | Conteúdo atualizado frequentemente |
| Post | 60 segundos | Pode ter correções |
| Categoria | Build time | Conteúdo mais estável |
| Sitemap | Dinâmico | Sempre atualizado |

**Regra de Revalidação Manual**:
- Endpoint `/api/revalidate` requer `REVALIDATE_SECRET`
- Usado via webhook quando backend atualiza conteúdo

---

## Regras de SEO

### 12. Meta Description

**Descrição**: Meta descriptions devem seguir formato específico.

**Regras**:
- Máximo 150 caracteres
- Se exceder, truncar com "..."
- Usar excerpt do post quando disponível
- Fallback para descrição padrão do site

**Implementação**:
```typescript
const description = post.excerpt?.slice(0, 150) +
  (post.excerpt?.length > 150 ? '...' : '') ||
  'Portal de notícias sobre criptomoedas';
```

---

### 13. Formato de Título

**Descrição**: Títulos de página seguem formato padrão.

**Formato**: `{Título da Página} | VerticeCripto`

**Exemplos**:
- "Bitcoin ultrapassa $100k | VerticeCripto"
- "Categoria: DeFi | VerticeCripto"
- "Busca | VerticeCripto"

---

## Regras de Imagem

### 14. Fallback de Imagem

**Descrição**: Posts sem imagem de destaque usam gradiente como fallback.

**Implementação**:
```typescript
if (!post.featured_image) {
  return (
    <div className="bg-gradient-to-br from-orange-500 to-yellow-500" />
  );
}
```

**Gradiente Padrão**: Laranja (#f97316) → Amarelo (#fbbf24)

---

### 15. Domínios de Imagem Permitidos

**Descrição**: Apenas imagens de domínios autorizados são permitidas.

**Domínios**:
- `res.cloudinary.com` - Imagens de posts
- `assets.coingecko.com` - Ícones de criptomoedas

**Configuração**: `next.config.js` → `images.remotePatterns`

---

## Regras de Acessibilidade

### 16. Skip Link

**Descrição**: Link para pular navegação deve existir para screen readers.

**Implementação**: Primeiro elemento do layout, visível apenas no focus.

---

### 17. Atributos de Data e Tempo

**Descrição**: Elementos de data devem ter atributo `dateTime` para acessibilidade.

**Implementação**:
```tsx
<time dateTime={post.published_at}>
  {formatDate(post.published_at)}
</time>
```

---

## Compliance e Regulamentações

### 18. LGPD (Considerações)

**Status**: Implementação básica

**Implementações**:
- Página de privacidade (`/privacidade`)
- Informações sobre coleta de dados
- Direitos do titular

**Nota**: O portal não coleta dados sensíveis do usuário atualmente (sem login, newsletter, etc.).

---

*Estas regras de negócio garantem consistência, segurança e compliance do portal VerticeCripto.*
