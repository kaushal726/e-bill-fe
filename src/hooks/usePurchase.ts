import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type PurchaseItem = {
  _id?: string
  productId:
    | {
        _id: string
        name: string
        unit?: string
      }
    | string
    | null
  productName?: string
  quantity: number
  invoicePrice?: number
  discount?: number
  gst?: number
  cgst?: number
  sgst?: number
  totalPrice?: number
}

export type PurchaseRecord = {
  _id: string
  invoiceNumber: string
  purchaseDate: string
  supplierName?: string
  supplierId: {
    _id: string
    name: string
    mobileNumber?: string
    pendingAmount?: number
  } | null
  items: PurchaseItem[]
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'completed' | 'advance'
  note?: string
  createdAt?: string
  updatedAt?: string
}

const getPurchases = async (): Promise<PurchaseRecord[]> => {
  const res = await API.get(API_ENDPOINTS.PURCHASE.BASE)
  const payload = res.data?.data

  if (Array.isArray(payload)) {
    return payload
  }

  if (payload?.purchases && Array.isArray(payload.purchases)) {
    return payload.purchases
  }

  return []
}

export const usePurchase = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchases,

    retry: false,
  })
}
