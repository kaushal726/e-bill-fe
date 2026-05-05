import { Brand } from '@/pages'
import { Route } from 'react-router-dom'

export const BrandRoute = () => {
  return <Route path="/brands" element={<Brand />} />
}
