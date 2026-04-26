import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { useQuery } from '@tanstack/react-query'

type CountTotal = {
  total: number
  count: number
}

type StatusBucket = {
  pending: CountTotal
  paid: CountTotal
  partial: CountTotal
  advance: CountTotal
}

type ChartPoint = {
  date?: string
  month?: string
  label: string
  sales: number
  salesCount: number
  purchases: number
  purchasesCount: number
  profit?: number
}

type StockCategory = {
  _id?: string
  totalProducts?: number
  totalStock: number
  categoryName: string
}

type TopCustomer = {
  _id: string
  name: string
  mobileNumber: string
  balance: number
  totalPurchases: number
}

type TopSupplier = {
  _id?: string
  name?: string
  mobileNumber?: string
  balance?: number
  totalPurchases?: number
}

type SellingProduct = {
  _id?: string
  totalQtySold: number
  totalRevenue: number
  productName: string
  unit: string
}

type RecentSale = {
  _id: string
  customerName: string
  invoiceNumber: string
  saleDate: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
}

type RecentPurchase = {
  _id: string
  invoiceNumber: string
  purchaseDate: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
}

type DashboardStats = {
  totals: {
    products: number
    categories: number
    suppliers: number
    customers: number
    staff: number
  }
  sales: {
    today: CountTotal
    thisMonth: CountTotal
    allTime: CountTotal
    byStatus: StatusBucket
  }
  purchases: {
    today: CountTotal
    thisMonth: CountTotal
    allTime: CountTotal
    byStatus: StatusBucket
  }
  profit: {
    thisMonth: number
    allTime: number
  }
  kpis: {
    cashflow: {
      salesInflowThisMonth: number
      purchaseOutflowThisMonth: number
      netCashflowThisMonth: number
    }
    exposure: {
      receivable: number
      payable: number
      customerAdvance: number
      netExposure: number
    }
    growth: {
      salesMoMPercent: number
      purchasesMoMPercent: number
      profitMoMPercent: number
    }
  }
  due: {
    customerDue: CountTotal
    customerAdvance: CountTotal
    supplierDue: CountTotal
  }
  stock: {
    outOfStock: {
      count: number
      products: Array<{ _id?: string; name?: string }>
    }
    lowStock: {
      count: number
      products: Array<{ _id?: string; name?: string }>
    }
    stockValue: {
      atPurchasePrice: number
      atSellingPrice: number
    }
    byCategory: StockCategory[]
  }
  top: {
    customers: TopCustomer[]
    suppliers: TopSupplier[]
    sellingProducts: SellingProduct[]
  }
  charts: {
    daily7: ChartPoint[]
    daily30: ChartPoint[]
    monthly6: ChartPoint[]
    salesByStatus: Array<{ label: string; value: number; count: number }>
    purchasesByStatus: Array<{ label: string; value: number; count: number }>
    stockByCategory: Array<{ label: string; value: number; productCount: number }>
    topSellingProducts: Array<{ label: string; unit: string; qtySold: number; revenue: number }>
    customerDueBar: Array<{ label: string; balance: number; totalPurchases: number }>
  }
  recent: {
    sales: RecentSale[]
    purchases: RecentPurchase[]
  }
  attendance: {
    today: {
      present: number
      absent: number
      leave: number
      totalStaff: number
    }
    thisMonth: {
      totalRecords: number
    }
  }
}

export const getDashboardStats = async () => {
  const response = await API.get(API_ENDPOINTS.DASHBOARD.STATS)
  return (response?.data?.data || null) as DashboardStats | null
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,

    retry: false,
    refetchOnWindowFocus: false,
  })
}

export type { DashboardStats }
