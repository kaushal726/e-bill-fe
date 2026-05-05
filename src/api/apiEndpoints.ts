export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    VIEW: '/auth/view',
    EDIT: '/auth/edit',
    FORGOT_PASSWORD: '/auth/forgot-password',
    SUBSCRIPTION: '/auth/subscription',
  },

  MERCHANT: {
    PROFILE: '/auth/view',
  },

  CUSTOMERS: {
    BASE: '/customers/getCustomer',
    SEARCH: '/customers/search',
    CREATE: '/customers/createCustomer',
    UPDATE: '/customers/updateCustomer',
    DELETE: '/customers/deleteCustomer',
    IMPORT: '/customers/import',
    EXPORT: '/customers/export',
    TEMPLATE: '/customers/template/sample',
  },

  PRODUCTS: {
    BASE: '/products/getProducts',
    SEARCH: '/products/search',
    CREATE: '/products/createProduct',
    UPDATE: '/products/updateProduct',
    DELETE: '/products/deleteProduct',
    IMPORT: '/products/import',
    EXPORT: '/products/export',
    ANALYTICS: '/products/analytics',
    TEMPLATE: '/products/template/sample',
  },

  CATEGORY: {
    BASE: '/category/list',
    SEARCH: '/category/search',
    CREATE: '/category/create',
    UPDATE: '/category/update',
    DELETE: '/category/delete',
    IMPORT: '/category/import',
    EXPORT: '/category/export',
    TEMPLATE: '/category/template/sample',
  },

  BRAND: {
    BASE: '/brand/list',
    SEARCH: '/brand/search',
    CREATE: '/brand/create',
    UPDATE: '/brand/update',
    DELETE: '/brand/delete',
    IMPORT: '/brand/import',
    EXPORT: '/brand/export',
    TEMPLATE: '/brand/template/sample',
  },

  SUPPLIERS: {
    BASE: '/supplier/list',
    CREATE: '/supplier/create',
    UPDATE: '/supplier/update',
    DELETE: '/supplier/delete',
    EXPORT: '/supplier/export',
    IMPORT: '/supplier/import',
    TEMPLATE: '/supplier/template/sample',
  },

  STAFF: {
    BASE: '/staff/list',
    CREATE: '/staff/create',
    UPDATE: '/staff/update',
    DELETE: '/staff/delete',
    EXPORT: '/staff/export',
    IMPORT: '/staff/import',
    TEMPLATE: '/staff/template/sample',
  },

  PURCHASE: {
    BASE: '/purchase/list',
    CREATE: '/purchase/create',
    GET_BY_ID: '/purchase',
    UPDATE: '/purchase/update',
    DELETE: '/purchase/delete',
    INVOICE: '/purchase',
    EXPORT: '/purchase/export',
    IMPORT: '/purchase/import',
    TEMPLATE: '/purchase/template/sample',
  },

  PURCHASE_RETURN: {
    BASE: '/purchase-return/list',
    CREATE: '/purchase-return/create',
    GET_BY_ID: '/purchase-return',
  },

  SALE: {
    BASE: '/sale/list',
    CREATE: '/sale/create',
    GET_BY_ID: '/sale',
    UPDATE: '/sale/update',
    DELETE: '/sale/delete',
    INVOICE: '/sale/invoice',
    NEXT_INVOICE: '/sale/next-invoice-number',
    STAFF_INCENTIVE_SUMMARY: '/sale/staff-incentive-summary',
    STAFF_MONTHLY_INCENTIVE: '/sale/staff-incentive',
  },

  SALE_RETURN: {
    BASE: '/sale-return/list',
    CREATE: '/sale-return/create',
    GET_BY_ID: '/sale-return',
  },

  PAYMENT: {
    BASE: '/payment/list',
    CREATE: '/payment/create',
    DUES: '/payment/dues',
    SUMMARY: '/payment/summary',
    ANALYTICS: '/payment/analytics',
    GET_BY_ID: '/payment',
  },

  STOCK_HISTORY: {
    BASE: '/stock-history/list',
    PRODUCT: '/stock-history/product',
    ADJUST: '/stock-history/adjust',
  },

  DASHBOARD: {
    STATS: '/dashboard/stats',
  },

  ATTENDANCE: {
    MARK: '/attendance/mark',
    MARK_BULK: '/attendance/mark-bulk',
    STAFF: '/attendance/staff',
    DATE: '/attendance/date',
    WEEKLY_SALARY: '/attendance/weekly-salary',
    MONTHLY_SALARY: '/attendance/monthly-salary',
  },

  BILL: {
    BASE: '/bill/list',
    CREATE: '/bill/create',
    GET_BY_ID: '/bill',
    UPDATE: '/bill/update',
    DELETE: '/bill/delete',
  },

  SYSTEM: {
    CHECK_CONNECTION: '/checkConnection',
  },
}

export default API_ENDPOINTS
