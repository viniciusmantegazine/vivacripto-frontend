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
