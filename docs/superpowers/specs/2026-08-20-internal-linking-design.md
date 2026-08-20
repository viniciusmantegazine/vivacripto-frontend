# Design: Linking interno para indexação (paginação + relacionados)

**Data:** 2026-08-20
**Repo:** vivacripto-frontend
**Status:** aprovado em conversa; aguardando revisão final do spec

## Problema

O GSC reporta 638 páginas "Detectada, mas não indexada" (e subindo ~3/dia).
Causa confirmada por inspeção do HTML de produção em 2026-08-20: dos 701
posts, só os ~15–27 mais recentes recebem links internos em qualquer
momento:

- A home linka os 15 posts mais novos.
- Cada categoria linka 12 posts; as páginas seguintes só existem atrás do
  botão client-side "Carregar mais" (`LoadMorePosts`), que o Googlebot não
  aciona. Não há paginação por URL.
- O "Leia Também" dos posts (`posts/[slug]/page.tsx`) busca os 10 posts
  mais recentes **do site inteiro** e exibe 3 — nunca linka o arquivo.

Resultado: ~670 posts órfãos, conhecidos pelo Google apenas via sitemap →
fila de rastreio de baixa prioridade.

## Objetivo

Todo post do arquivo deve ser alcançável por links `<a>` em HTML
server-renderizado, por dois caminhos independentes: paginação de categoria
e malha de "Leia Também".

## Não-objetivos

- Página de arquivo geral `/posts` (descartada por redundância).
- Similaridade editorial por tags (exigiria endpoint novo no backend).
- Mudanças no backend: a API atual (`page`, `page_size`, `category`,
  `total_pages`) já cobre tudo.

## Decisões (com o usuário, 2026-08-20)

1. Escopo: paginação de categorias + relacionados. Sem página de arquivo.
2. URL de paginação: segmento de rota `/categoria/[slug]/pagina/[N]`
   (ISR + canonical próprio), não query string.
3. UX: paginação numerada substitui o botão "Carregar mais" nas categorias.
4. Relacionados: mesma categoria com espalhamento determinístico por hash
   do slug (opção B), cobrindo o arquivo inteiro.

## Parte 1 — Paginação de categorias

### Rota nova: `src/app/categoria/[slug]/pagina/[page]/page.tsx`

- Reusa a lógica de fetch da categoria: `getCategoryPosts(slug, page)` é
  extraída para módulo compartilhado (hoje vive inline em
  `categoria/[slug]/page.tsx`), passando a aceitar o número da página.
- `revalidate = 300`, `dynamicParams = true`. `generateStaticParams`
  pré-gera as páginas 2 de cada categoria (as demais renderizam sob demanda
  e ficam no cache ISR).
- Validações → `notFound()`:
  - `page` não numérico ou não inteiro;
  - `page < 2` (a página 1 é sempre `/categoria/[slug]`; `/pagina/1` não
    existe, evitando conteúdo duplicado);
  - `page > total_pages`;
  - slug de categoria inválido.
- Metadata: `title` = `"<Categoria> – Página N"`, canonical =
  `SITE_URL/categoria/<slug>/pagina/N`, indexável (sem `noindex` — páginas
  paginadas indexáveis com canonical self são a prática padrão e preservam
  o fluxo de link equity).

### Componente novo: `src/components/ui/Pagination.tsx`

- Server component, links puros com `<Link>` (rendem `<a href>` no HTML).
- Layout: `« Anterior | 1 2 3 … 17 | Próxima »`; janela de até 5 números
  ao redor da atual + primeira/última com elipse.
- O número 1 linka para `/categoria/<slug>` (sem `/pagina/1`).
- Props: `{ basePath: string; currentPage: number; totalPages: number }`.
- Não renderiza nada se `totalPages <= 1`.

### Mudança em `src/app/categoria/[slug]/page.tsx`

- Remove `LoadMorePosts`; rende o grid de `PostCard` direto no servidor e
  `<Pagination>` abaixo.
- Mantém o fallback existente de "backend ignorou o filtro de categoria"
  (`canPaginate = false`): nesse caso a paginação não renderiza,
  comportamento equivalente ao atual.
- `LoadMorePosts.tsx` permanece se a home ainda o usar; se ficar sem
  consumidores, é removido (verificar na implementação).

### Sitemap

As URLs `/pagina/N` **não** entram no sitemap — são caminho de rastreio,
não landing page. `src/app/sitemap.ts` não muda.

## Parte 2 — "Leia Também" determinístico

### Função nova: `getRelatedPosts(post)` (em `src/services/`)

Substitui o bloco atual de `posts/[slug]/page.tsx` (linhas ~115–122).

1. Post **sem categoria** → fallback: comportamento atual (últimos posts do
   site, excluindo o próprio).
2. Post com categoria:
   a. `getPosts({ category, page: 1, pageSize: 12 })` para obter
      `total_pages` (mesma chamada que a página da categoria faz —
      compartilha o cache ISR de 5 min).
   b. `targetPage = (hashSlug(post.slug) % total_pages) + 1`, onde
      `hashSlug` é um hash simples e estável (ex.: acumulador
      multiplicativo sobre char codes, sem dependências).
   c. `getPosts({ category, page: targetPage, pageSize: 12 })`; remove o
      próprio post; seleciona 3 começando em offset também derivado do
      hash (posts distintos que caiam na mesma página linkam trios
      diferentes).
   d. Se sobrarem <3, completa com os mais recentes da categoria (itens já
      obtidos no passo a), sem duplicar.
3. Qualquer erro → lista vazia, seção não renderiza (postura atual:
   relacionados não são críticos).

`hashSlug` e a seleção do trio são funções puras exportadas (testáveis).

**Propriedade de estabilidade:** o trio é função pura de
`(slug, total_pages)` — só muda quando `total_pages` da categoria cresce
(~a cada 12 posts novos na categoria). Sem `Math.random()`/`Date.now()`,
compatível com ISR.

### Componente `RelatedPosts.tsx`

Não muda — apenas recebe posts diferentes.

## Testes e verificação

- Repo sem suíte de testes hoje; se houver runner configurado, testes
  unitários para `hashSlug`/seleção (estabilidade, distribuição,
  fallbacks). Caso contrário, as funções puras ficam prontas para teste
  futuro.
- Verificação local: `npm run build` limpo; no HTML renderizado:
  - categoria contém `<a href="/categoria/<slug>/pagina/2">`;
  - post antigo contém 3 links de posts da mesma categoria (não os 3 mais
    recentes do site);
  - `/categoria/<slug>/pagina/999` e `/pagina/1` → 404.
- Pós-deploy: mesmos checks via `curl` em produção; acompanhar no GSC a
  fila de 638 "Detectada, mas não indexada" nas semanas seguintes
  (expectativa: começar a cair conforme o recrawl percorre a malha nova).

## Riscos

- **Carga na API (Railway):** o crawler passará a alcançar ~670 páginas de
  post + ~60 páginas de paginação; com ISR (300s/60s) a API só vê 1 render
  por página por janela de revalidação. Risco baixo.
- **Backend ignorar filtro de categoria:** já há fallback herdado; a
  paginação some e o site degrada para o comportamento atual.
- **GSC "Duplicate content" nas páginas de paginação:** mitigado por
  canonical self + título com "Página N" + conjuntos de posts disjuntos.
