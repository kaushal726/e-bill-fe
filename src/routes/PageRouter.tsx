import Auth from '@/pages/Layouts/Auth.tsx'
import Layout from '@/pages/Layouts/Layout.tsx'
import { Fragment } from 'react'

import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom'

import {
  LoginRoute,
  ForgotPasswordRoute,
  CustomerRoute,
  ProductRoute,
  DashboardRoute,
  ProfileRoute,
  StocksRoute,
  SuppliersRoute,
  PaymentsRoute,
  SettingsRoute,
  LandingRoute,
  PriceListRoute,
  InvoiceRoute,
  SalesOrderRoute,
  AttendanceRoute,
  StaffRoute,
  PurchaseRoute,
  SalesRoute,
  CategoryRoute,
  HelpRoute,
  PaymentsReceivedRoute,
  DeliveryReceiptsRoute,
  PackagingRoute,
  ShipmentsRoute,
  PurchaseOrdersRoute,
  PurchaseReceivedRoute,
  BillRoute,
  CreditsRoute,
  RolesRoute,
  SubscriptionRoute,
  PaymentDuesRoute,
  PaymentAnalyticsRoute,
} from './importRoutes/index'
import { useSelector } from 'react-redux'
import Loading from '@/components/common/Loading'

import { Toaster } from '@/components/ui/toaster'
import ProtectedRoutes from './ProtectedRoutes'
import ScrollRestorationHandler from '@/utils/ScrollRestorationHandler'
import type { RootState } from '@/redux/store'
import { isAuthenticated } from '@/utils/authSession'
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard'
import { hasInactiveSubscriptionFlag, SUBSCRIPTION_ROUTE } from '@/utils/subscriptionAccess'

type RouteFactory = () => JSX.Element

const authRouteFactories: RouteFactory[] = [LoginRoute, ForgotPasswordRoute]

const subscriptionRouteFactories: RouteFactory[] = [SubscriptionRoute]

const protectedRouteFactories: RouteFactory[] = [
  DashboardRoute,
  CustomerRoute,
  ProductRoute,
  ProfileRoute,
  StocksRoute,
  SuppliersRoute,
  PaymentsRoute,
  SettingsRoute,
  PurchaseRoute,
  StaffRoute,
  SalesRoute,
  CategoryRoute,
  HelpRoute,
  AttendanceRoute,
  PriceListRoute,
  InvoiceRoute,
  SalesOrderRoute,
  PaymentsReceivedRoute,
  DeliveryReceiptsRoute,
  PackagingRoute,
  ShipmentsRoute,
  PurchaseOrdersRoute,
  PurchaseReceivedRoute,
  BillRoute,
  CreditsRoute,
  RolesRoute,
  PaymentDuesRoute,
  PaymentAnalyticsRoute,
]

const renderRouteGroup = (routeFactories: RouteFactory[]) =>
  routeFactories.map((routeFactory, index) => (
    <Fragment key={`${routeFactory.name}-${index}`}>{routeFactory()}</Fragment>
  ))

const PageRouter = () => {
  const isLoading = useSelector((state: RootState) => state.ui.isLoading)
  const fallbackPath = isAuthenticated()
    ? hasInactiveSubscriptionFlag()
      ? SUBSCRIPTION_ROUTE
      : '/dashboard'
    : '/'

  return (
    <>
      {isLoading && <Loading />}
      <BrowserRouter>
        <ScrollRestorationHandler />
        <Routes>
          {LandingRoute()}

          <Route element={<Auth />}>{renderRouteGroup(authRouteFactories)}</Route>

          <Route element={<ProtectedRoutes />}>
            <Route element={<SubscriptionGuard />}>
              {renderRouteGroup(subscriptionRouteFactories)}
            </Route>

            <Route element={<SubscriptionGuard />}>
              <Route element={<Layout />}>{renderRouteGroup(protectedRouteFactories)}</Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={fallbackPath} replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
    </>
  )
}

export default PageRouter
