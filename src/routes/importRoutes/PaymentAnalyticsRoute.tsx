import { PaymentAnalytics } from '@/pages'
import { Route } from 'react-router-dom'

export const PaymentAnalyticsRoute = () => {
  return <Route path="/payments/analytics" element={<PaymentAnalytics />} />
}
