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
