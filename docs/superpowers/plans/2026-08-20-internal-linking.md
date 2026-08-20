# Linking Interno (Paginação + Relacionados) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar todos os ~700 posts alcançáveis por links `<a>` server-renderizados, via paginação de categorias (`/categoria/[slug]/pagina/N`) e "Leia Também" determinístico por categoria.

**Architecture:** Extrai o fetch de categoria para um serviço compartilhado; adiciona rota paginada com ISR e componente `Pagination` de links puros; substitui o botão client-side "Carregar mais" nas categorias por paginação numerada; troca o "Leia Também" (hoje: 3 posts mais recentes do site) por seleção determinística na mesma categoria, com página do arquivo escolhida por hash do slug.

**Tech Stack:** Next.js 14 App Router (ISR/`revalidate`), TypeScript, Tailwind. Sem mudanças no backend — a API já expõe `page`, `page_size`, `category` e `total_pages`.

**Spec:** `docs/superpowers/specs/2026-08-20-internal-linking-design.md`

**Contexto do repo (verificado em 2026-08-20):**
- Não há test runner (`package.json` só tem `dev`/`build`/`start`/`lint`). Verificação = `npm run lint` + `npm run build` + curls no dev server.
- A home (`src/app/page.tsx`) também usa `LoadMorePosts` — o componente **permanece**; só a página de categoria deixa de usá-lo.
- `.env.local` aponta `NEXT_PUBLIC_API_URL=http://localhost:8000` (backend local, repo `~/git/vivacripto-backend`). Com o backend fora do ar, o build ainda passa (os fetches têm fallback), mas os curls de verificação exigem o backend rodando.

---

### File Structure

- Create: `src/services/category-posts.ts` — fetch de posts por categoria com paginação (extraído da página de categoria)
- Create: `src/components/ui/Pagination.tsx` — navegação numerada com `<Link>` (server component)
- Create: `src/app/categoria/[slug]/pagina/[page]/page.tsx` — rota das páginas 2+
- Create: `src/services/related.ts` — `hashSlug`, `pickRelated` (puras) e `getRelatedPosts`
- Modify: `src/app/categoria/[slug]/page.tsx` — usa o serviço; grid direto + `Pagination` no lugar de `LoadMorePosts`
- Modify: `src/app/posts/[slug]/page.tsx:115-122` — usa `getRelatedPosts`

---

### Task 1: Serviço compartilhado `getCategoryPosts`

**Files:**
- Create: `src/services/category-posts.ts`
- Modify: `src/app/categoria/[slug]/page.tsx` (troca a função inline pelo import; UI ainda não muda)

- [ ] **Step 1: Criar `src/services/category-posts.ts`**

```ts
import { getPosts, Post } from '@/services/api'

export const CATEGORY_PAGE_SIZE = 12

export interface CategoryPostsResult {
  posts: Post[]
  total: number
  totalPages: number
  canPaginate: boolean
}

/**
 * Busca posts da categoria usando o filtro da API, com fallback para o método
 * antigo (buscar posts e filtrar em memória) caso o endpoint por categoria
 * não exista ou falhe. O fallback só cobre a página 1 — páginas seguintes
 * retornam vazio para a rota paginada responder 404.
 */
export async function getCategoryPosts(
  slug: string,
  page = 1
): Promise<CategoryPostsResult> {
  try {
    const res = await getPosts({
      category: slug,
      page,
      pageSize: CATEGORY_PAGE_SIZE,
      status: 'published',
    })

    // Se veio conteúdo e todos os itens pertencem à categoria, confiamos no
    // filtro do backend e habilitamos paginação real.
    const matches = res.items.filter((p) => p.category?.slug === slug)
    if (res.items.length === 0 || matches.length === res.items.length) {
      return {
        posts: res.items,
        total: res.total,
        totalPages: res.total_pages,
        canPaginate: true,
      }
    }

    // Backend ignorou o filtro (retornou mix): cai no fallback abaixo.
    throw new Error('category filter not applied')
  } catch {
    if (page > 1) {
      return { posts: [], total: 0, totalPages: 0, canPaginate: false }
    }
    try {
      const res = await getPosts({ page: 1, pageSize: 50, status: 'published' })
      const filtered = res.items.filter((p) => p.category?.slug === slug)
      return {
        posts: filtered,
        total: filtered.length,
        totalPages: 1,
        canPaginate: false,
      }
    } catch {
      return { posts: [], total: 0, totalPages: 0, canPaginate: false }
    }
  }
}
```

- [ ] **Step 2: Apontar a página de categoria para o serviço**

Em `src/app/categoria/[slug]/page.tsx`:

1. Trocar a linha 1 de import e adicionar o serviço:

```ts
import { getCategoryPosts, CATEGORY_PAGE_SIZE } from '@/services/category-posts'
```

(remover `import { getPosts, Post } from '@/services/api'` — após este passo nada mais no arquivo usa `getPosts`/`Post` diretamente)

2. Apagar a constante `const PAGE_SIZE = 12` (linha 14) e o bloco inteiro da função inline `getCategoryPosts` (linhas 50–85, do comentário `/** Busca posts da categoria...` até o `}` que fecha a função).

3. No corpo do componente, a chamada vira:

```ts
const { posts, total, canPaginate } = await getCategoryPosts(params.slug)
```

4. Na prop de `LoadMorePosts`, trocar `pageSize={PAGE_SIZE}` por `pageSize={CATEGORY_PAGE_SIZE}` (essa prop some na Task 3; aqui é só para o build passar).

- [ ] **Step 3: Verificar**

Run: `cd ~/git/vivacripto-frontend && npm run lint && npm run build`
Expected: lint sem erros; build termina com "Compiled successfully" e lista as rotas (warnings de fetch falhando são aceitáveis se o backend local estiver desligado).

- [ ] **Step 4: Commit**

```bash
git add src/services/category-posts.ts src/app/categoria/[slug]/page.tsx
git commit -m "refactor: extrai getCategoryPosts para serviço compartilhado com paginação"
```

---

### Task 2: Componente `Pagination`

**Files:**
- Create: `src/components/ui/Pagination.tsx`

- [ ] **Step 1: Criar `src/components/ui/Pagination.tsx`**

```tsx
import Link from 'next/link'

interface PaginationProps {
  /** Caminho da página 1, ex.: '/categoria/bitcoin' (sem barra final). */
  basePath: string
  currentPage: number
  totalPages: number
}

function pageHref(basePath: string, page: number): string {
  // A página 1 é a própria rota da categoria — /pagina/1 não existe.
  return page === 1 ? basePath : `${basePath}/pagina/${page}`
}

/**
 * Janela de números: sempre inclui 1 e totalPages, mais até 5 ao redor da
 * página atual. `null` representa a elipse. Pura e exportada para teste.
 */
export function buildPageWindow(
  currentPage: number,
  totalPages: number
): Array<number | null> {
  const pages = new Set<number>([1, totalPages])
  for (let p = currentPage - 2; p <= currentPage + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const result: Array<number | null> = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push(null)
    result.push(p)
    prev = p
  }
  return result
}

const linkClass =
  'px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:text-orange-600 dark:hover:text-orange-400 transition-colors'

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pageWindow = buildPageWindow(currentPage, totalPages)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-center gap-2 mt-12"
    >
      {currentPage > 1 && (
        <Link href={pageHref(basePath, currentPage - 1)} className={linkClass}>
          « Anterior
        </Link>
      )}

      {pageWindow.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold"
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={pageHref(basePath, p)} className={linkClass}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link href={pageHref(basePath, currentPage + 1)} className={linkClass}>
          Próxima »
        </Link>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run lint && npm run build`
Expected: sem erros (componente ainda sem consumidores).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Pagination.tsx
git commit -m "feat: componente Pagination com links reais para SEO"
```

---

### Task 3: Categoria usa grid + Pagination (sai o LoadMorePosts)

**Files:**
- Modify: `src/app/categoria/[slug]/page.tsx`

- [ ] **Step 1: Trocar imports**

Remover a linha `import LoadMorePosts from '@/components/posts/LoadMorePosts'` e adicionar:

```ts
import PostCard from '@/components/posts/PostCard'
import Pagination from '@/components/ui/Pagination'
```

(`CATEGORY_PAGE_SIZE` deixa de ser usado neste arquivo — remover do import da Task 1, ficando `import { getCategoryPosts } from '@/services/category-posts'`.)

**Não** apagar `src/components/posts/LoadMorePosts.tsx`: a home (`src/app/page.tsx`) continua usando.

- [ ] **Step 2: Capturar `totalPages` e substituir o bloco de renderização**

A chamada no componente vira:

```ts
const { posts, total, totalPages, canPaginate } = await getCategoryPosts(params.slug)
```

O bloco `<LoadMorePosts ... />` (atual JSX entre o parágrafo "notícias encontradas" e o estado vazio) é substituído por:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {posts.map((post) => (
    <PostCard key={post.id} post={post} />
  ))}
</div>
{canPaginate && (
  <Pagination
    basePath={`/categoria/${params.slug}`}
    currentPage={1}
    totalPages={totalPages}
  />
)}
```

(As classes do grid são as mesmas que `LoadMorePosts` usava, então o visual dos cards não muda. Com `canPaginate = false` — fallback da API — a paginação não renderiza, comportamento equivalente ao atual.)

- [ ] **Step 3: Verificar com backend local (se disponível)**

Run: `npm run lint && npm run build`
Expected: sem erros.

Com o backend rodando (`cd ~/git/vivacripto-backend && uvicorn` ou processo equivalente já ativo em `localhost:8000`):

Run: `npm run dev` (em background) e depois
`curl -s http://localhost:3000/categoria/bitcoin | grep -o 'href="/categoria/bitcoin/pagina/[0-9]*"' | sort -u`
Expected: pelo menos `href="/categoria/bitcoin/pagina/2"` (se a categoria tiver >12 posts). Sem backend, pular este curl — a checagem equivalente roda em produção pós-deploy.

- [ ] **Step 4: Commit**

```bash
git add src/app/categoria/[slug]/page.tsx
git commit -m "feat: paginação numerada nas categorias no lugar do carregar-mais"
```

---

### Task 4: Rota paginada `/categoria/[slug]/pagina/[page]`

**Files:**
- Create: `src/app/categoria/[slug]/pagina/[page]/page.tsx`

- [ ] **Step 1: Criar a rota**

```tsx
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import PostCard from '@/components/posts/PostCard'
import Pagination from '@/components/ui/Pagination'
import { getCategoryPosts } from '@/services/category-posts'
import { CATEGORY_SLUGS, getCategoryBySlug } from '@/config/categories'
import { SITE_URL } from '@/config/site'

// ISR: revalida a cada 5 minutos (alinhado à página de categoria).
export const revalidate = 300
export const dynamicParams = true

// Pré-gera a página 2 de cada categoria; as demais renderizam sob demanda.
export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug, page: '2' }))
}

// Aceita apenas inteiros >= 2 (a página 1 é /categoria/[slug]).
function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const page = parseInt(raw, 10)
  return page >= 2 ? page : null
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; page: string }
}) {
  const category = getCategoryBySlug(params.slug)
  const page = parsePage(params.page)

  if (!category || !page) {
    return {
      title: 'Página não encontrada',
      description: 'A página que você procura não existe.',
    }
  }

  const url = `${SITE_URL}/categoria/${category.slug}/pagina/${page}`

  return {
    title: `${category.name} – Página ${page}`,
    description: category.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category.name} – Página ${page} | VerticeCripto`,
      description: category.description,
      url,
      siteName: 'VerticeCripto',
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: { slug: string; page: string }
}) {
  const category = getCategoryBySlug(params.slug)
  const page = parsePage(params.page)

  if (!category || !page) {
    notFound()
  }

  const { posts, totalPages, canPaginate } = await getCategoryPosts(
    params.slug,
    page
  )

  // Fallback sem paginação real, página vazia ou além do fim → 404.
  if (!canPaginate || posts.length === 0 || page > totalPages) {
    notFound()
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: category.name, href: `/categoria/${category.slug}` },
              { label: `Página ${page}` },
            ]}
          />

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}{' '}
              <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                — página {page}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {category.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            basePath={`/categoria/${category.slug}`}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verificar**

Run: `npm run lint && npm run build`
Expected: sem erros; a rota `/categoria/[slug]/pagina/[page]` aparece na lista do build.

Com backend local + `npm run dev`:
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/categoria/bitcoin/pagina/2` → `200`
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/categoria/bitcoin/pagina/1` → `404`
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/categoria/bitcoin/pagina/999` → `404`
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/categoria/bitcoin/pagina/abc` → `404`
- `curl -s http://localhost:3000/categoria/bitcoin/pagina/2 | grep -o '<link rel="canonical" href="[^"]*"'` → canonical com `/pagina/2`

- [ ] **Step 3: Commit**

```bash
git add "src/app/categoria/[slug]/pagina"
git commit -m "feat: rota paginada /categoria/[slug]/pagina/[page] com ISR e canonical próprio"
```

---

### Task 5: Serviço `getRelatedPosts` determinístico

**Files:**
- Create: `src/services/related.ts`

- [ ] **Step 1: Criar `src/services/related.ts`**

```ts
import { getPosts, Post } from '@/services/api'

export const RELATED_COUNT = 3
const FETCH_PAGE_SIZE = 12

/**
 * Hash determinístico de string (variante djb2/xor). Sempre >= 0 e estável
 * entre renders — nada de Math.random()/Date.now(), que quebrariam o ISR.
 */
export function hashSlug(slug: string): number {
  let hash = 5381
  for (let i = 0; i < slug.length; i++) {
    hash = (Math.imul(hash, 33) ^ slug.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Seleciona até `count` posts do pool a partir de um offset derivado do
 * seed, excluindo o próprio post. Pura: mesma entrada → mesma saída.
 */
export function pickRelated(
  pool: Post[],
  selfId: string,
  seed: number,
  count: number = RELATED_COUNT
): Post[] {
  const candidates = pool.filter((p) => p.id !== selfId)
  if (candidates.length <= count) return candidates

  const start = seed % candidates.length
  const picked: Post[] = []
  for (let i = 0; i < count; i++) {
    picked.push(candidates[(start + i) % candidates.length])
  }
  return picked
}

/**
 * "Leia Também" com espalhamento determinístico: o hash do slug escolhe uma
 * página do arquivo da categoria, de onde saem os 3 relacionados. O trio é
 * função pura de (slug, total_pages da categoria) — só muda quando a
 * categoria ganha ~12 posts novos. Ver spec
 * docs/superpowers/specs/2026-08-20-internal-linking-design.md.
 */
export async function getRelatedPosts(post: Post): Promise<Post[]> {
  try {
    if (!post.category?.slug) {
      // Sem categoria: comportamento antigo (últimos posts do site).
      const { items } = await getPosts({
        page: 1,
        pageSize: 10,
        status: 'published',
      })
      return items.filter((p) => p.id !== post.id).slice(0, RELATED_COUNT)
    }

    const category = post.category.slug
    const seed = hashSlug(post.slug)

    // Página 1 também fornece total_pages; compartilha o cache ISR com a
    // página da categoria (mesmos parâmetros de getPosts).
    const first = await getPosts({
      category,
      page: 1,
      pageSize: FETCH_PAGE_SIZE,
      status: 'published',
    })
    const totalPages = Math.max(first.total_pages, 1)
    const targetPage = (seed % totalPages) + 1

    const pool =
      targetPage === 1
        ? first
        : await getPosts({
            category,
            page: targetPage,
            pageSize: FETCH_PAGE_SIZE,
            status: 'published',
          })

    const related = pickRelated(pool.items, post.id, seed)

    // Página sorteada curta (fim do arquivo/categoria pequena): completa
    // com os mais recentes da categoria, sem duplicar.
    if (related.length < RELATED_COUNT) {
      for (const p of first.items) {
        if (related.length >= RELATED_COUNT) break
        if (p.id !== post.id && !related.some((r) => r.id === p.id)) {
          related.push(p)
        }
      }
    }

    return related
  } catch {
    // Relacionados não são críticos: seção simplesmente não renderiza.
    return []
  }
}
```

- [ ] **Step 2: Verificar**

Run: `npm run lint && npm run build`
Expected: sem erros (serviço ainda sem consumidores).

- [ ] **Step 3: Commit**

```bash
git add src/services/related.ts
git commit -m "feat: getRelatedPosts determinístico por categoria (hash do slug)"
```

---

### Task 6: Post usa `getRelatedPosts`

**Files:**
- Modify: `src/app/posts/[slug]/page.tsx:115-122`

- [ ] **Step 1: Trocar o bloco de relacionados**

Adicionar o import:

```ts
import { getRelatedPosts } from '@/services/related'
```

Substituir o bloco atual (linhas ~115–122):

```ts
  // Fetch related posts
  let relatedPosts: Post[] = []
  try {
    const { items: allPosts } = await getPosts({ page: 1, pageSize: 10, status: 'published' })
    relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3)
  } catch {
    // Silently fail - related posts are not critical
  }
```

por:

```ts
  // "Leia Também": mesma categoria, trio determinístico (ver services/related).
  const relatedPosts = await getRelatedPosts(post)
```

No import da linha 1, remover `Post` se ficar sem uso (`getPosts` continua usado pelo `generateStaticParams`): `import { getPosts, getPostBySlug } from '@/services/api'`.

- [ ] **Step 2: Verificar**

Run: `npm run lint && npm run build`
Expected: sem erros.

Com backend local + `npm run dev`, pegar um post antigo (qualquer slug do sitemap com data de meses atrás) e:

`curl -s http://localhost:3000/posts/<slug-antigo> | grep -o 'href="/posts/[^"]*"' | sort -u`
Expected: 3 links de posts que NÃO são os 3 mais recentes do site (comparar com a home) e que pertencem à mesma categoria do post. Rodar o curl duas vezes → mesmos 3 links (determinismo).

- [ ] **Step 3: Commit**

```bash
git add "src/app/posts/[slug]/page.tsx"
git commit -m "feat: Leia Também passa a linkar o arquivo da categoria deterministicamente"
```

---

### Task 7: Verificação final e encerramento

- [ ] **Step 1: Build completo limpo**

Run: `npm run lint && npm run build`
Expected: zero erros; rotas listadas incluem `/categoria/[slug]` e `/categoria/[slug]/pagina/[page]`.

- [ ] **Step 2: Confirmar que o sitemap não mudou**

Run: `git log --oneline -1 -- src/app/sitemap.ts`
Expected: o último commit que tocou `src/app/sitemap.ts` é anterior a este trabalho (URLs `/pagina/N` ficam fora do sitemap por design).

- [ ] **Step 3: Smoke test completo (com backend local, se disponível)**

Já cobertos nas Tasks 3, 4 e 6. Se o backend não estava disponível, executar os mesmos curls contra produção após o deploy:
- `curl -s https://verticecripto.com.br/categoria/bitcoin | grep -c 'pagina/'` → >= 1
- `curl -s -o /dev/null -w "%{http_code}" https://verticecripto.com.br/categoria/bitcoin/pagina/2` → 200
- `curl -s -o /dev/null -w "%{http_code}" https://verticecripto.com.br/categoria/bitcoin/pagina/999` → 404
- Post antigo com 3 links da mesma categoria no "Leia Também".

- [ ] **Step 4: Push (deploy é automático na Vercel a partir do main)**

Confirmar com o usuário antes do push, conforme prática do projeto:

```bash
git push origin main
```
