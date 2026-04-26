import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type CustomerQueryParams = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  minBalance?: number
  maxBalance?: number
  balanceType?: 'due' | 'advance' | 'settled'
  fromDate?: string
  toDate?: string
}

export const getCustomers = async (params: CustomerQueryParams = {}) => {
  const res = await API.get(API_ENDPOINTS.CUSTOMERS.SEARCH, { params })

  return res.data?.data || null
}

export const useCustomers = (params: CustomerQueryParams = {}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),

    retry: false,
  })
}
