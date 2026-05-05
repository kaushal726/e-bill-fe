import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

export type SplitMode = 'cash' | 'card' | 'cheque' | 'upi'
export type PaymentSplitRecord = { mode: SplitMode; amount: number }

export type PaymentRecord = {
  _id: string
  paidToType: 'supplier' | 'customer'
  supplierId?: {
    _id: string
    name: string
    mobileNumber?: string
    pendingAmount?: number
  } | null
  customerId?: {
    _id: string
    name: string
    mobileNumber?: string
  } | null
  partyName?: string
  invoiceNumber?: string
  billNumber?: string
  saleId?: {
    _id: string
    invoiceNumber?: string
  } | null
  purchaseId?: {
    _id: string
    invoiceNumber?: string
  } | null
  amount: number
  paymentMode: 'cash' | 'upi' | 'bank' | 'other' | 'card' | 'cheque'
  paymentSplits?: PaymentSplitRecord[]
  note?: string
  paymentDate?: string
  createdAt?: string
  updatedAt?: string
}

export type WalkInSupplierDueRow = {
  supplierName: string
  dueAmount: number
}

export type PaymentListResponse = {
  payments: PaymentRecord[]
  walkInSupplierPayments: PaymentRecord[]
  walkInSupplierPaymentsCount: number
  totalWalkInSupplierPaid: number
  walkInSupplierDueAmount: number
  walkInSupplierDueBreakdown: WalkInSupplierDueRow[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalPayments: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type PaymentQueryParams = {
  search?: string
  paidToType?: 'supplier' | 'customer'
  paymentMode?: 'cash' | 'upi' | 'bank' | 'other' | 'card' | 'cheque'
  partyId?: string
  fromDate?: string
  toDate?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

const EMPTY_PAYMENT_LIST: PaymentListResponse = {
  payments: [],
  walkInSupplierPayments: [],
  walkInSupplierPaymentsCount: 0,
  totalWalkInSupplierPaid: 0,
  walkInSupplierDueAmount: 0,
  walkInSupplierDueBreakdown: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
}

const getPayments = async (params: PaymentQueryParams = {}): Promise<PaymentListResponse> => {
  const res = await API.get(API_ENDPOINTS.PAYMENT.BASE, { params })
  const payload = res.data?.data || res.data || {}

  if (Array.isArray(payload)) {
    return {
      ...EMPTY_PAYMENT_LIST,
      payments: payload,
    }
  }

  if (Array.isArray(payload?.payments)) {
    return {
      payments: payload.payments,
      walkInSupplierPayments: payload.walkInSupplierPayments || [],
      walkInSupplierPaymentsCount: Number(payload.walkInSupplierPaymentsCount || 0),
      totalWalkInSupplierPaid: Number(payload.totalWalkInSupplierPaid || 0),
      walkInSupplierDueAmount: Number(payload.walkInSupplierDueAmount || 0),
      walkInSupplierDueBreakdown: payload.walkInSupplierDueBreakdown || [],
      pagination: {
        currentPage: Number(payload?.pagination?.currentPage || params.page || 1),
        totalPages: Number(payload?.pagination?.totalPages || 1),
        totalPayments: Number(payload?.pagination?.totalPayments || payload?.payments?.length || 0),
        limit: Number(payload?.pagination?.limit || params.limit || 20),
        hasNextPage: Boolean(payload?.pagination?.hasNextPage),
        hasPrevPage: Boolean(payload?.pagination?.hasPrevPage),
      },
    }
  }

  return EMPTY_PAYMENT_LIST
}

export type PartyDueRow = {
  paidToType: 'supplier' | 'customer'
  partyType: 'registered' | 'anonymous'
  partyId?: string
  partyName: string
  mobileNumber?: string
  totalDue: number
  totalAmount?: number
  totalPaid?: number
  transactionCount?: number
  lastTransactionDate?: string
}

export type PaymentDuesResponse = {
  customers: PartyDueRow[]
  suppliers: PartyDueRow[]
}

export type PaymentSummary = {
  customer?: {
    receivableAmount?: number
    advanceAmount?: number
    dueCount?: number
    advanceCount?: number
  }
  supplier?: {
    payableAmount?: number
    advancePaidAmount?: number
    dueCount?: number
    advanceCount?: number
    walkInDueAmount?: number
    walkInAdvanceAmount?: number
    walkInDueCount?: number
    walkInAdvanceCount?: number
  }
  netOutstanding?: number
  totalPayments: number
  totalAmount: number
  totalFromCustomers: number
  totalToSuppliers: number
  customerPaymentsCount: number
  supplierPaymentsCount: number
  thisMonthAmount: number
}

export type AnalyticsPartyRow = {
  partyId?: string | null
  partyName: string
  partyType?: 'registered' | 'anonymous'
  mobileNumber?: string
  amount: number
  totalAmount?: number
  totalPaid?: number
  lastTransactionDate?: string
}

export type PaymentAnalytics = {
  summary: {
    totalToCollectFromCustomers: number
    totalToPaySuppliers: number
    totalCustomerAdvance: number
    totalSupplierAdvancePaid: number
    netOutstanding: number
    totalPaidToSuppliers: number
    totalCollectedFromCustomers: number
    totalPaymentTransactions: number
    totalPaymentAmount: number
  }
  counts: {
    customerDueCount: number
    customerAdvanceCount: number
    supplierDueCount: number
    supplierAdvanceCount: number
    supplierPaymentsCount: number
    customerPaymentsCount: number
  }
  paymentModeBreakdown: {
    cash: number
    upi: number
    bank: number
    other: number
    card: number
    cheque: number
  }
  actionables: {
    topSupplierPayables: AnalyticsPartyRow[]
    topCustomerReceivables: AnalyticsPartyRow[]
  }
  details: {
    customer: {
      receivables: AnalyticsPartyRow[]
      advances: AnalyticsPartyRow[]
    }
    supplier: {
      payables: AnalyticsPartyRow[]
      advances: AnalyticsPartyRow[]
    }
  }
  recentPayments: PaymentRecord[]
  meta: {
    recentLimit: number
    topLimit: number
    lastPaymentDate?: string | null
  }
}

const getPaymentDues = async (): Promise<PaymentDuesResponse> => {
  const res = await API.get(API_ENDPOINTS.PAYMENT.DUES)
  return (
    res.data?.data || {
      customers: [],
      suppliers: [],
    }
  )
}

const pickNumber = (obj: any, keys: string[]) => {
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }
  return 0
}

const getPaymentSummary = async (): Promise<PaymentSummary> => {
  const res = await API.get(API_ENDPOINTS.PAYMENT.SUMMARY)
  const raw = res.data?.data || res.data || {}
  const customer = raw?.customer || {}
  const supplier = raw?.supplier || {}

  return {
    customer,
    supplier,
    netOutstanding: pickNumber(raw, ['netOutstanding']),
    totalPayments: pickNumber(raw, ['totalPayments', 'count', 'totalCount', 'paymentsCount']),
    totalAmount:
      pickNumber(raw, ['totalAmount', 'amount', 'total', 'grossAmount']) ||
      pickNumber(customer, ['receivableAmount']) +
        pickNumber(customer, ['advanceAmount']) +
        pickNumber(supplier, ['payableAmount']) +
        pickNumber(supplier, ['advancePaidAmount']),
    totalFromCustomers:
      pickNumber(raw, [
        'totalFromCustomers',
        'customerAmount',
        'receivedFromCustomers',
        'customerReceived',
      ]) || pickNumber(customer, ['receivableAmount']) + pickNumber(customer, ['advanceAmount']),
    totalToSuppliers:
      pickNumber(raw, ['totalToSuppliers', 'supplierAmount', 'paidToSuppliers', 'supplierPaid']) ||
      pickNumber(supplier, ['payableAmount']) + pickNumber(supplier, ['advancePaidAmount']),
    customerPaymentsCount:
      pickNumber(raw, ['customerPaymentsCount', 'customerCount', 'fromCustomerCount']) ||
      pickNumber(customer, ['dueCount']) + pickNumber(customer, ['advanceCount']),
    supplierPaymentsCount:
      pickNumber(raw, ['supplierPaymentsCount', 'supplierCount', 'toSupplierCount']) ||
      pickNumber(supplier, ['dueCount']) + pickNumber(supplier, ['advanceCount']),
    thisMonthAmount:
      pickNumber(raw, ['thisMonthAmount', 'monthAmount', 'monthlyAmount']) ||
      Math.abs(pickNumber(raw, ['netOutstanding'])),
  }
}

const getPaymentAnalytics = async (): Promise<PaymentAnalytics> => {
  const res = await API.get(API_ENDPOINTS.PAYMENT.ANALYTICS)
  const raw = res.data?.data || {}

  return {
    summary: {
      totalToCollectFromCustomers: Number(raw?.summary?.totalToCollectFromCustomers || 0),
      totalToPaySuppliers: Number(raw?.summary?.totalToPaySuppliers || 0),
      totalCustomerAdvance: Number(raw?.summary?.totalCustomerAdvance || 0),
      totalSupplierAdvancePaid: Number(raw?.summary?.totalSupplierAdvancePaid || 0),
      netOutstanding: Number(raw?.summary?.netOutstanding || 0),
      totalPaidToSuppliers: Number(raw?.summary?.totalPaidToSuppliers || 0),
      totalCollectedFromCustomers: Number(raw?.summary?.totalCollectedFromCustomers || 0),
      totalPaymentTransactions: Number(raw?.summary?.totalPaymentTransactions || 0),
      totalPaymentAmount: Number(raw?.summary?.totalPaymentAmount || 0),
    },
    counts: {
      customerDueCount: Number(raw?.counts?.customerDueCount || 0),
      customerAdvanceCount: Number(raw?.counts?.customerAdvanceCount || 0),
      supplierDueCount: Number(raw?.counts?.supplierDueCount || 0),
      supplierAdvanceCount: Number(raw?.counts?.supplierAdvanceCount || 0),
      supplierPaymentsCount: Number(raw?.counts?.supplierPaymentsCount || 0),
      customerPaymentsCount: Number(raw?.counts?.customerPaymentsCount || 0),
    },
    paymentModeBreakdown: {
      cash: Number(raw?.paymentModeBreakdown?.cash || 0),
      upi: Number(raw?.paymentModeBreakdown?.upi || 0),
      bank: Number(raw?.paymentModeBreakdown?.bank || 0),
      other: Number(raw?.paymentModeBreakdown?.other || 0),
      card: Number(raw?.paymentModeBreakdown?.card || 0),
      cheque: Number(raw?.paymentModeBreakdown?.cheque || 0),
    },
    actionables: {
      topSupplierPayables: raw?.actionables?.topSupplierPayables || [],
      topCustomerReceivables: raw?.actionables?.topCustomerReceivables || [],
    },
    details: {
      customer: {
        receivables: raw?.details?.customer?.receivables || [],
        advances: raw?.details?.customer?.advances || [],
      },
      supplier: {
        payables: raw?.details?.supplier?.payables || [],
        advances: raw?.details?.supplier?.advances || [],
      },
    },
    recentPayments: raw?.recentPayments || [],
    meta: {
      recentLimit: Number(raw?.meta?.recentLimit || 20),
      topLimit: Number(raw?.meta?.topLimit || 20),
      lastPaymentDate: raw?.meta?.lastPaymentDate || null,
    },
  }
}

export const usePayment = (params: PaymentQueryParams = {}) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => getPayments(params),

    retry: false,
  })
}

export const usePaymentDues = () => {
  return useQuery({
    queryKey: ['payment-dues'],
    queryFn: getPaymentDues,
    retry: false,
  })
}

export const usePaymentSummary = () => {
  return useQuery({
    queryKey: ['payment-summary'],
    queryFn: getPaymentSummary,
    retry: false,
  })
}

export const usePaymentAnalytics = () => {
  return useQuery({
    queryKey: ['payment-analytics'],
    queryFn: getPaymentAnalytics,
    retry: false,
  })
}
