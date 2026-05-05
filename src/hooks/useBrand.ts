import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type BrandQueryParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  fromDate?: string
  toDate?: string
}

export const getBrands = async (params: BrandQueryParams = {}) => {
  const res = await API.get(API_ENDPOINTS.BRAND.SEARCH, { params })
  return res.data?.data || null
}

export const useBrand = (params: BrandQueryParams = {}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => getBrands(params),
    retry: false,
  })
}
