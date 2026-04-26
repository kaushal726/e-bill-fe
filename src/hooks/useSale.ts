import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type SaleItem = {
  productId: {
    _id: string
    name: string
    unit?: string
  } | null
  quantity: number
  price: number
  discount: number
  gst?: number
  gstPercentage?: number
  gstInclusive?: boolean
  discountType?: 'percentage' | 'absolute'
  discountValue?: number
  lineBaseAmount?: number
  lineDiscountAmount?: number
  lineTaxableAmount?: number
  lineTotalAmount?: number
}

export type SaleRecord = {
  _id: string
  invoiceNumber: string
  saleDate: string
  customerId: {
    _id: string
    name: string
    mobileNumber?: string
  } | null
  customerName: string
  items: SaleItem[]
  subtotalAmount?: number
  totalDiscountAmount?: number
  taxableAmount?: number
  totalGstAmount?: number
  extraCharges?: Array<{
    label?: string
    amount: number
  }>
  extraChargesTotal?: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid' | 'advance'
  note?: string
  createdAt?: string
  updatedAt?: string
}

export type SaleQueryParams = {
  search?: string
  customerId?: string
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'advance'
  fromDate?: string
  toDate?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type SalesListResponse = {
  sales: SaleRecord[]
  pagination: {
    currentPage: number
    totalPages: number
    totalSales: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const getSales = async (): Promise<SaleRecord[]> => {
  const res = await API.get(API_ENDPOINTS.SALE.BASE)
  const payload = res.data?.data
  if (Array.isArray(payload)) return payload
  return payload?.sales || []
}

const getSalesList = async (params: SaleQueryParams = {}): Promise<SalesListResponse> => {
  const res = await API.get(API_ENDPOINTS.SALE.BASE, { params })
  const payload = res.data?.data || {}
  return {
    sales: payload?.sales || [],
    pagination: {
      currentPage: Number(payload?.pagination?.currentPage || params.page || 1),
      totalPages: Number(payload?.pagination?.totalPages || 1),
      totalSales: Number(payload?.pagination?.totalSales || 0),
      limit: Number(payload?.pagination?.limit || params.limit || 20),
      hasNextPage: Boolean(payload?.pagination?.hasNextPage),
      hasPrevPage: Boolean(payload?.pagination?.hasPrevPage),
    },
  }
}

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
    retry: false,
  })
}

export const useSalesList = (params: SaleQueryParams = {}) => {
  return useQuery({
    queryKey: ['sales-list', params],
    queryFn: () => getSalesList(params),
    retry: false,
  })
}
