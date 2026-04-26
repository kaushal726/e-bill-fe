import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type CategoryQueryParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  fromDate?: string
  toDate?: string
}

export const getCategories = async (params: CategoryQueryParams = {}) => {
  const res = await API.get(API_ENDPOINTS.CATEGORY.SEARCH, { params })

  return res.data?.data || null
}

export const useCategory = (params: CategoryQueryParams = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),

    retry: false,
  })
}
