# Padrões de Design

## Padrões Arquiteturais

### Component-Based Architecture

O projeto segue uma arquitetura baseada em componentes React, organizada por responsabilidade:

```
src/
├── app/           # Páginas e rotas (Next.js App Router)
├── components/    # Componentes reutilizáveis
├── services/      # Lógica de acesso a dados
├── config/        # Configurações centralizadas
├── lib/           # Utilitários puros
└── styles/        # Estilos globais
```

### Feature-Based Organization

Dentro de `components/`, os componentes são organizados por feature/domínio:

```
components/
├── layout/        # Componentes estruturais (Header, Footer)
├── posts/         # Componentes relacionados a artigos
├── crypto/        # Componentes de criptomoedas
├── ui/            # Componentes UI genéricos
└── providers/     # Context providers
```

### Separation of Concerns

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **Pages (app/)** | Roteamento, data fetching, SEO | `app/posts/[slug]/page.tsx` |
| **Components** | UI e interatividade | `components/posts/PostCard.tsx` |
| **Services** | Comunicação com API | `services/api.ts` |
| **Config** | Dados de configuração | `config/categories.ts` |
| **Lib** | Funções utilitárias puras | `lib/utils.ts` |

## Padrões de Código

### Single Source of Truth (Categorias)

As categorias são definidas em um único local (`config/categories.ts`):

```typescript
// config/categories.ts
export const categories = [
  { name: 'Bitcoin', slug: 'bitcoin', color: 'bg-orange-500' },
  { name: 'Ethereum', slug: 'ethereum', color: 'bg-purple-500' },
  // ...
];

export function getCategoryBySlug(slug: string) {
  return categories.find(cat => cat.slug === slug);
}
```

**Benefícios**:
- Consistência de cores e nomes em toda aplicação
- Fácil manutenção e adição de novas categorias
- Tipagem TypeScript automática

### Compound Components (PostCard)

O componente PostCard usa variantes para diferentes contextos:

```typescript
// Variantes: 'standard' | 'featured' | 'compact'
<PostCard post={post} variant="featured" />
<PostCard post={post} variant="compact" />
<PostCard post={post} /> // default: standard
```

### Data Validation Pattern

Toda resposta de API é validada antes de uso:

```typescript
// services/api.ts
function isValidPost(post: unknown): post is Post {
  return (
    typeof post === 'object' &&
    post !== null &&
    'id' in post &&
    'title' in post &&
    'slug' in post
  );
}

export async function getPosts(): Promise<Post[]> {
  const data = await fetch(...);
  return data.filter(isValidPost);
}
```

### Security Patterns

**Sanitização de Input**:
```typescript
// lib/utils.ts
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/<[^>]*>/g, '')           // Remove HTML
    .replace(/['";\\]/g, '')            // Remove SQL chars
    .replace(/[\x00-\x1F\x7F]/g, '')   // Remove control chars
    .trim()
    .slice(0, 200);
}
```

**Sanitização de Slug**:
```typescript
export function sanitizeSlug(slug: string): string {
  return slug
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 200);
}
```

## Organização de Código

### Estrutura de Página (App Router)

Cada rota segue a estrutura padrão do Next.js App Router:

```
app/posts/[slug]/
├── page.tsx        # Componente da página
├── loading.tsx     # Skeleton de carregamento (opcional)
└── error.tsx       # Tratamento de erro (opcional)
```

### Estrutura de Componente

Padrão recomendado para componentes:

```typescript
// components/posts/PostCard.tsx

// 1. Imports
import { Post } from '@/services/api';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

// 2. Types/Interfaces
interface PostCardProps {
  post: Post;
  variant?: 'standard' | 'featured' | 'compact';
  priority?: boolean;
}

// 3. Component
export function PostCard({ post, variant = 'standard', priority = false }: PostCardProps) {
  // Logic
  // Return JSX
}
```

### Estrutura de Service

```typescript
// services/api.ts

// 1. Types
export interface Post { ... }
export interface CryptoData { ... }

// 2. Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 3. Validation helpers
function isValidPost(post: unknown): post is Post { ... }

// 4. API functions
export async function getPosts(): Promise<Post[]> { ... }
export async function getPostBySlug(slug: string): Promise<Post | null> { ... }
```

## Convenções de Nomenclatura

### Arquivos e Pastas

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `PostCard.tsx`, `HeroSection.tsx` |
| Páginas (App Router) | lowercase | `page.tsx`, `layout.tsx` |
| Services | camelCase | `api.ts` |
| Utilitários | camelCase | `utils.ts` |
| Config | camelCase | `categories.ts` |

### Código

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `function PostCard()` |
| Funções | camelCase | `function formatDate()` |
| Constantes | UPPER_SNAKE_CASE | `const API_URL` |
| Interfaces | PascalCase | `interface PostCardProps` |
| CSS Classes | kebab-case (Tailwind) | `text-gray-500` |

### Variáveis de Ambiente

| Prefixo | Uso |
|---------|-----|
| `NEXT_PUBLIC_` | Exposta no client-side |
| Sem prefixo | Apenas server-side |

## Padrões de Teste

> **Nota**: O projeto atualmente não possui testes implementados. Abaixo estão as recomendações para quando forem adicionados.

### Estrutura Recomendada

```
__tests__/
├── components/
│   └── PostCard.test.tsx
├── services/
│   └── api.test.ts
└── lib/
    └── utils.test.ts
```

### Ferramentas Recomendadas

- **Jest**: Test runner
- **React Testing Library**: Testes de componentes
- **MSW**: Mock de APIs

## Padrões de Tratamento de Erros

### API Errors

```typescript
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_URL}/posts/slug/${sanitizeSlug(slug)}`);

    if (!response.ok) {
      console.error(`Failed to fetch post: ${response.status}`);
      return null;
    }

    const post = await response.json();
    return isValidPost(post) ? post : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}
```

### Component Error Boundaries

Páginas usam `notFound()` do Next.js para erros 404:

```typescript
// app/posts/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <Article post={post} />;
}
```

### Empty States

Componentes tratam arrays vazios graciosamente:

```typescript
// Se não houver posts, retorna null ou mensagem
if (posts.length === 0) {
  return <p>Nenhum artigo encontrado.</p>;
}
```

## Padrões de CSS

### Utility-First (Tailwind)

```tsx
<div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
```

### CSS Variables para Temas

```css
/* styles/globals.css */
:root {
  --background: 255 255 255;
  --foreground: 0 0 0;
}

.dark {
  --background: 17 24 39;
  --foreground: 255 255 255;
}
```

### Responsive Design

Mobile-first com breakpoints Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Animações

Definidas em CSS e aplicadas via classes:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
```

## Boas Práticas Específicas

### 1. Sempre validar dados da API

Nunca confie em dados externos sem validação.

### 2. Usar Image do Next.js

Sempre usar `next/image` para otimização automática.

### 3. Preferir Server Components

Use `'use client'` apenas quando necessário (interatividade, hooks de estado).

### 4. Centralizar configurações

Dados compartilhados (categorias, constantes) devem estar em `config/`.

### 5. Sanitizar inputs do usuário

Especialmente em busca e parâmetros de URL.

---

*Seguir estes padrões garante consistência e facilita a manutenção do código.*
