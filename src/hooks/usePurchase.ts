import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type PurchasePaymentStatus = 'pending' | 'partial' | 'paid' | 'completed' | 'advance'

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
  paymentStatus: PurchasePaymentStatus
  note?: string
  createdAt?: string
  updatedAt?: string
}

export type PurchaseSupplierSummary = {
  supplierId: string | null
  supplierName: string
  mobileNumber?: string
  isWalkIn?: boolean
  purchaseCount: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
}

export type PurchasePaymentStatusSummary = {
  count: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
}

export type PurchaseSummary = {
  showingPurchases?: number
  totalValue?: number
  totalPaid?: number
  totalDue?: number
  totalPurchaseAmount: number
  totalPaidAmount: number
  totalDueAmount: number
  purchaseCount: number
  byPaymentStatus: Record<string, PurchasePaymentStatusSummary>
  bySupplier: PurchaseSupplierSummary[]
}

export type PurchaseListResponse = {
  data: PurchaseRecord[]
  summary: PurchaseSummary
}

export type PurchaseListFilters = {
  supplierId?: string
  paymentStatus?: PurchasePaymentStatus
  fromDate?: string
  toDate?: string
  search?: string
}

const EMPTY_SUMMARY: PurchaseSummary = {
  totalPurchaseAmount: 0,
  totalPaidAmount: 0,
  totalDueAmount: 0,
  purchaseCount: 0,
  byPaymentStatus: {
    pending: { count: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0 },
    partial: { count: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0 },
    paid: { count: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0 },
    completed: { count: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0 },
    advance: { count: 0, totalAmount: 0, paidAmount: 0, dueAmount: 0 },
  },
  bySupplier: [],
}

const getPurchases = async (filters: PurchaseListFilters): Promise<PurchaseListResponse> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  )

  const res = await API.get(API_ENDPOINTS.PURCHASE.BASE, { params })
  const payload = res.data?.data

  if (Array.isArray(payload)) {
    return {
      data: payload,
      summary: {
        ...EMPTY_SUMMARY,
        purchaseCount: payload.length,
        totalPurchaseAmount: payload.reduce((acc, row) => acc + Number(row?.totalAmount || 0), 0),
        totalPaidAmount: payload.reduce((acc, row) => acc + Number(row?.paidAmount || 0), 0),
        totalDueAmount: payload.reduce((acc, row) => acc + Number(row?.dueAmount || 0), 0),
      },
    }
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      summary: payload.summary || EMPTY_SUMMARY,
    }
  }

  if (payload?.purchases && Array.isArray(payload.purchases)) {
    const summaryFromPayload = {
      ...EMPTY_SUMMARY,
      showingPurchases: Number(payload.showingPurchases || payload.purchases.length || 0),
      totalValue: Number(payload.totalValue || 0),
      totalPaid: Number(payload.totalPaid || 0),
      totalDue: Number(payload.totalDue || 0),
      purchaseCount: Number(payload.showingPurchases || payload.purchases.length || 0),
      totalPurchaseAmount: Number(payload.totalValue || 0),
      totalPaidAmount: Number(payload.totalPaid || 0),
      totalDueAmount: Number(payload.totalDue || 0),
    }

    return {
      data: payload.purchases,
      summary: summaryFromPayload,
    }
  }

  return {
    data: [],
    summary: EMPTY_SUMMARY,
  }
}

export const usePurchase = (filters: PurchaseListFilters = {}) => {
  return useQuery({
    queryKey: [
      'purchases',
      filters.supplierId || '',
      filters.paymentStatus || '',
      filters.fromDate || '',
      filters.toDate || '',
      filters.search || '',
    ],
    queryFn: () => getPurchases(filters),

    retry: false,
  })
}
