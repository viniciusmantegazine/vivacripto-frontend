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
