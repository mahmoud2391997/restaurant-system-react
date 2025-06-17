export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  order: "asc" | "desc"
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined
}

export interface QueryParams extends PaginationParams {
  sort?: SortParams
  filters?: FilterParams
  search?: string
  searchFields?: string[]
}

export const buildQueryString = (params: QueryParams): string => {
  const queryParams = new URLSearchParams()

  // Add pagination
  queryParams.append("page", params.page.toString())
  queryParams.append("limit", params.limit.toString())

  // Add sorting
  if (params.sort) {
    queryParams.append("sortBy", params.sort.field)
    queryParams.append("sortOrder", params.sort.order)
  }

  // Add search
  if (params.search && params.search.trim() !== "") {
    queryParams.append("search", params.search)

    if (params.searchFields && params.searchFields.length > 0) {
      queryParams.append("searchFields", params.searchFields.join(","))
    }
  }

  // Add filters
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(`filter[${key}]`, value.toString())
      }
    })
  }

  return queryParams.toString()
}

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE = 1

export const getDefaultPaginationParams = (): PaginationParams => ({
  page: DEFAULT_PAGE,
  limit: DEFAULT_PAGE_SIZE,
})
