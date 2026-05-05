import { API } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { AxiosError } from 'axios'

const toast = ToasterUtil()

export type PaymentSplitPayload = { mode: 'cash' | 'card' | 'cheque' | 'upi'; amount: number }

export type CreatePaymentPayload = {
  paidToType: 'supplier' | 'customer'
  supplierId?: string
  supplierName?: string
  customerId?: string
  customerName?: string
  amount?: number
  paymentSplits?: PaymentSplitPayload[]
  note?: string
  invoiceNumber?: string
}

export const usePaymentActions = () => {
  const queryClient = useQueryClient()

  const invalidatePaymentRelatedData = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['payment-dues'] })
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  const createPayment = useMutation({
    mutationFn: (payload: CreatePaymentPayload) =>
      API.post(API_ENDPOINTS.PAYMENT.CREATE, payload).then((res) => res.data?.data ?? res.data),

    onSuccess: () => {
      invalidatePaymentRelatedData()
      toast('Payment recorded successfully', 'success')
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        toast(error.response?.data?.message || 'Failed to record payment', 'error')
        return
      }

      toast('Failed to record payment', 'error')
    },
  })

  return {
    createPayment,
  }
}
