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

const getSuppliers = async (): Promise<SupplierItem[]> => {
  const res = await API.get(API_ENDPOINTS.SUPPLIERS.BASE)
  return res.data?.data || []
}

export const useSupplier = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,

    retry: false,
  })
}
