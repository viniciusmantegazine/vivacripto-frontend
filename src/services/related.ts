import { getPosts, Post } from '@/services/api'
import { getCategoryPosts } from '@/services/category-posts'

export const RELATED_COUNT = 3

/**
 * Hash determinístico de string (variante djb2/xor). Sempre >= 0 e estável
 * entre renders — nada de Math.random()/Date.now(), que quebrariam o ISR.
 */
export function hashSlug(slug: string): number {
  let hash = 5381
  for (let i = 0; i < slug.length; i++) {
    hash = (Math.imul(hash, 33) ^ slug.charCodeAt(i)) >>> 0
  }
  // fmix32 (Murmur3): espalha os bits para que slugs quase idênticos não
  // caiam nas mesmas páginas do arquivo após o módulo.
  hash ^= hash >>> 16
  hash = Math.imul(hash, 2246822507) >>> 0
  hash ^= hash >>> 13
  hash = Math.imul(hash, 3266489909) >>> 0
  hash ^= hash >>> 16
  return hash >>> 0
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
 * página do arquivo da categoria, de onde saem os 3 relacionados. A escolha
 * é determinística dentro da janela de cache do ISR (mesma entrada → mesma
 * saída); a longo prazo o trio desliza conforme posts novos deslocam a
 * paginação da categoria. Ver spec
 * docs/superpowers/specs/2026-08-20-internal-linking-design.md.
 *
 * Pode retornar menos de RELATED_COUNT quando a categoria tem poucos posts;
 * chamadores devem tolerar arrays curtos.
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

    // getCategoryPosts compartilha o cache ISR com a página da categoria
    // (mesmos parâmetros de getPosts por baixo) e traz de graça a guarda
    // contra backend que ignora o filtro de categoria. Determinismo assume
    // que a ordenação padrão /posts do backend é estável entre requisições.
    const first = await getCategoryPosts(category, 1)
    const totalPages = Math.max(first.totalPages, 1)
    const targetPage = (seed % totalPages) + 1

    const pool =
      targetPage === 1 ? first : await getCategoryPosts(category, targetPage)

    // Offset independente da escolha de página (evita correlação entre os
    // dois módulos quando totalPages divide candidates.length).
    const offsetSeed = Math.imul(seed, 2654435761) >>> 0
    const related = pickRelated(pool.posts, post.id, offsetSeed)

    // Página sorteada curta (fim do arquivo/categoria pequena): completa
    // com os mais recentes da categoria, sem duplicar.
    if (related.length < RELATED_COUNT) {
      for (const p of first.posts) {
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
