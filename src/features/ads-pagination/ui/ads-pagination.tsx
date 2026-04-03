import { Button } from "@/shared/ui/shadcn"

import { useAdsPagination } from "../model"

interface AdsPaginationProps {
  total: number
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages])

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page)
    }
  }

  return Array.from(pages).sort((leftPage, rightPage) => leftPage - rightPage)
}

export function AdsPagination({ total }: AdsPaginationProps) {
  const { currentPage, goToPage, totalPages } = useAdsPagination({ total })

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <nav aria-label="Пагинация объявлений" className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Назад
      </Button>

      {visiblePages.map((page, index) => {
        const previousPage = visiblePages[index - 1]
        const hasGap = previousPage !== undefined && page - previousPage > 1

        return (
          <div key={page} className="flex items-center gap-2">
            {hasGap ? (
              <span className="text-muted-foreground text-sm">…</span>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Вперёд
      </Button>
    </nav>
  )
}
