import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type ProductQueryParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  categoryId?: string
  supplierId?: string
  lowStock?: boolean
  minStock?: number
  maxStock?: number
  minPrice?: number
  maxPrice?: number
  discountType?: 'percentage' | 'amount'
  gstInclusive?: 'true' | 'false'
  fromDate?: string
  toDate?: string
}

export const getProducts = async (params: ProductQueryParams = {}) => {
  const res = await API.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params })

  return res.data?.data || null
}

export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),

    retry: false,
  })
}
