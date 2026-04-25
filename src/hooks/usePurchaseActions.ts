import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type PurchaseCreatePayload = {
  supplierId?: string
  supplierName?: string
  invoiceNumber?: string
  purchaseDate?: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    discount?: number
  }>
  paidAmount?: number
  note?: string
}

export type PurchaseUpdatePayload = {
  paidAmount?: number
  note?: string
}

export const usePurchaseActions = () => {
  const queryClient = useQueryClient()

  const invalidatePurchases = () => {
    queryClient.invalidateQueries({ queryKey: ['purchases'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  }

  const createPurchase = useMutation({
    mutationFn: (payload: PurchaseCreatePayload) =>
      API.post(API_ENDPOINTS.PURCHASE.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidatePurchases()
      toast('Purchase created successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to create purchase', 'error')
        return
      }
      toast('Failed to create purchase', 'error')
    },
  })

  const updatePurchase = useMutation({
    mutationFn: ({ purchaseId, payload }: { purchaseId: string; payload: PurchaseUpdatePayload }) =>
      API.put(`${API_ENDPOINTS.PURCHASE.UPDATE}/${purchaseId}`, payload).then(
        (res) => res.data?.data ?? res.data,
      ),

    onSuccess: () => {
      invalidatePurchases()
      toast('Purchase updated successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to update purchase', 'error')
        return
      }
      toast('Failed to update purchase', 'error')
    },
  })

  const deletePurchase = useMutation({
    mutationFn: (purchaseId: string) =>
      API.delete(`${API_ENDPOINTS.PURCHASE.DELETE}/${purchaseId}`).then((res) => res.data),

    onSuccess: () => {
      invalidatePurchases()
      toast('Purchase deleted successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to delete purchase', 'error')
        return
      }
      toast('Failed to delete purchase', 'error')
    },
  })

  return {
    createPurchase,
    updatePurchase,
    deletePurchase,
  }
}
