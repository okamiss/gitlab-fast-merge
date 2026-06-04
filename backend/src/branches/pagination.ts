const BRANCH_PAGE_SIZE = 10

function normalizePositiveInteger(value: number | string | undefined, fallback: number) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function normalizeBranchPage(page?: number | string, pageSize?: number | string) {
  const normalizedPage = normalizePositiveInteger(page, 1)
  const normalizedPageSize = normalizePositiveInteger(pageSize, BRANCH_PAGE_SIZE)

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    skip: (normalizedPage - 1) * normalizedPageSize
  }
}
