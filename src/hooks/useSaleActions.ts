import { API } from '@/api/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type PaymentSplitPayload = { mode: 'cash' | 'card' | 'cheque' | 'upi'; amount: number }

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
  paymentSplits?: PaymentSplitPayload[]
  note?: string
  staffId?: string
  staffIncentive?: number
}

export type SaleUpdatePayload = SaleCreatePayload

export const useSaleActions = () => {
  const queryClient = useQueryClient()

  const invalidateSales = () => {
    queryClient.invalidateQueries({ queryKey: ['sales'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['customers'] })
    queryClient.invalidateQueries({ queryKey: ['staffIncentiveSummary'] })
    queryClient.invalidateQueries({ queryKey: ['productAnalytics'] })
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
      API.put(`${API_ENDPOINTS.SALE.UPDATE}/${saleId}`, payload).then(
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

export type NextInvoiceNumberData = {
  nextNumber: string
  financialYear: string
  seq: number
}

export const useNextInvoiceNumber = (enabled = true) => {
  return useQuery<NextInvoiceNumberData>({
    queryKey: ['nextInvoiceNumber'],
    queryFn: () =>
      API.get(API_ENDPOINTS.SALE.NEXT_INVOICE).then((res) => res.data?.data ?? res.data),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })
}

export type StaffIncentiveRecord = {
  _id: string
  totalIncentive: number
  saleCount: number
}

export const useStaffIncentiveSummary = () => {
  return useQuery<StaffIncentiveRecord[]>({
    queryKey: ['staffIncentiveSummary'],
    queryFn: () =>
      API.get(API_ENDPOINTS.SALE.STAFF_INCENTIVE_SUMMARY).then((res) => res.data?.data ?? res.data),
    staleTime: 60 * 1000,
  })
}
