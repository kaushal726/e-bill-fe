import { lazy } from 'react'
import { Route } from 'react-router-dom'

const StaffProfile = lazy(() => import('@/pages/Staff/StaffProfile'))

export const StaffProfileRoute = () => <Route path="/staff/:staffId" element={<StaffProfile />} />
