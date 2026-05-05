import { lazy } from 'react'
import { Route } from 'react-router-dom'

const ProductAnalytics = lazy(() => import('@/pages/ProductAnalytics/ProductAnalytics'))

export const ProductAnalyticsRoute = () => {
  return <Route path="/product-analytics" element={<ProductAnalytics />} />
}
