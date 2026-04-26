import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type SupplierItem = {
  _id: string
  name: string
  mobileNumber: string
  address?: string
  pendingAmount?: number
  totalPurchaseAmount?: number
  createdAt?: string
  updatedAt?: string
}

export type SupplierQueryParams = {
  page?: number
  limit?: number
  search?: string
  minPending?: number
  maxPending?: number
  minPurchase?: number
  maxPurchase?: number
  fromDate?: string
  toDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type SupplierListResponse = {
  suppliers: SupplierItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalSuppliers: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const getSuppliers = async (): Promise<SupplierItem[]> => {
  const res = await API.get(API_ENDPOINTS.SUPPLIERS.BASE)
  const payload = res.data?.data
  if (Array.isArray(payload)) return payload
  return payload?.suppliers || []
}

const getSuppliersList = async (
  params: SupplierQueryParams = {},
): Promise<SupplierListResponse> => {
  const res = await API.get(API_ENDPOINTS.SUPPLIERS.BASE, { params })
  const payload = res.data?.data || {}

  return {
    suppliers: payload?.suppliers || [],
    pagination: {
      currentPage: Number(payload?.pagination?.currentPage || params.page || 1),
      totalPages: Number(payload?.pagination?.totalPages || 1),
      totalSuppliers: Number(payload?.pagination?.totalSuppliers || 0),
      limit: Number(payload?.pagination?.limit || params.limit || 20),
      hasNextPage: Boolean(payload?.pagination?.hasNextPage),
      hasPrevPage: Boolean(payload?.pagination?.hasPrevPage),
    },
  }
}

export const useSupplier = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,

    retry: false,
  })
}

export const useSuppliers = (params: SupplierQueryParams = {}) => {
  return useQuery({
    queryKey: ['suppliers-list', params],
    queryFn: () => getSuppliersList(params),
    retry: false,
  })
}
