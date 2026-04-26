import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type SaleCreatePayload = {
  customerId?: string
  customerName?: string
  invoiceNumber?: string
  saleDate?: string
  items: Array<{
    productId: string
    quantity: number
    price?: number
    discountType?: 'percentage' | 'absolute'
    discountValue?: number
    gstPercentage?: number
    gstInclusive?: boolean
  }>
  extraCharges?: Array<{
    label?: string
    amount: number
  }>
  paidAmount?: number
  note?: string
}

export type SaleUpdatePayload = {
  paidAmount?: number
  note?: string
}

export const useSaleActions = () => {
  const queryClient = useQueryClient()

  const invalidateSales = () => {
    queryClient.invalidateQueries({ queryKey: ['sales'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const createSale = useMutation({
    mutationFn: (payload: SaleCreatePayload) =>
      API.post(API_ENDPOINTS.SALE.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidateSales()
      toast('Sale created successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to create sale', 'error')
        return
      }
      toast('Failed to create sale', 'error')
    },
  })

  const updateSale = useMutation({
    mutationFn: ({ saleId, payload }: { saleId: string; payload: SaleUpdatePayload }) =>
      API.patch(`${API_ENDPOINTS.SALE.UPDATE}/${saleId}`, payload).then(
        (res) => res.data?.data ?? res.data,
      ),

    onSuccess: () => {
      invalidateSales()
      toast('Sale updated successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to update sale', 'error')
        return
      }
      toast('Failed to update sale', 'error')
    },
  })

  const deleteSale = useMutation({
    mutationFn: (saleId: string) =>
      API.delete(`${API_ENDPOINTS.SALE.DELETE}/${saleId}`).then((res) => res.data),

    onSuccess: () => {
      invalidateSales()
      toast('Sale deleted successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to delete sale', 'error')
        return
      }
      toast('Failed to delete sale', 'error')
    },
  })

  return { createSale, updateSale, deleteSale }
}
