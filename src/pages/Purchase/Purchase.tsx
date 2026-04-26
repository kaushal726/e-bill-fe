import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge, Input } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Download, CalendarDays, FilterX } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { toaster } from '@/components/ui/toaster'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { FaEdit, FaTrash } from '@/components/icons'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'
import PurchaseModal from '@/components/modals/PurchaseModal'
import PurchasePaymentModal from '@/components/modals/PurchasePaymentModal'

import { usePurchase, type PurchasePaymentStatus } from '@/hooks/usePurchase'
import { usePurchaseActions } from '@/hooks/usePurchaseActions'

const paymentStatusColor = {
  pending: 'orange',
  partial: 'yellow',
  paid: 'green',
  completed: 'green',
  advance: 'blue',
} as const

function Purchase() {
  const dispatch = useDispatch()

  const [createOpen, setCreateOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null)
  const [activePaidAmount, setActivePaidAmount] = useState<number>(0)
  const [activeNote, setActiveNote] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [supplierIdFilter, setSupplierIdFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState('')
  const [toDateFilter, setToDateFilter] = useState('')
  const fromDateRef = useRef<HTMLInputElement>(null)
  const toDateRef = useRef<HTMLInputElement>(null)

  const [page, setPage] = useState(1)
  const limit = 20

  const [isExporting, setIsExporting] = useState(false)

  const { data: purchaseResponse, isLoading } = usePurchase({
    supplierId: supplierIdFilter || undefined,
    paymentStatus: (paymentStatusFilter || undefined) as PurchasePaymentStatus | undefined,
    fromDate: fromDateFilter || undefined,
    toDate: toDateFilter || undefined,
    search: debouncedSearch || undefined,
  })
  const purchaseData = purchaseResponse?.data || []
  const apiSummary = purchaseResponse?.summary
  const { deletePurchase } = usePurchaseActions()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value || 0))

  const getItemSummary = (p: any) => {
    const items = Array.isArray(p.items) ? p.items : []
    if (!items.length) return '-'

    const productNames = items
      .map((item: any) => item?.productId?.name || item?.productName)
      .filter(Boolean)

    if (!productNames.length) return '-'

    return productNames.length > 2
      ? `${productNames[0]}, ${productNames[1]} + ${productNames.length - 2} more`
      : productNames.join(', ')
  }

  const getItemTotals = (p: any) => {
    const items = Array.isArray(p.items) ? p.items : []
    return items.reduce(
      (
        acc: { quantity: number; discount: number; gst: number; cgst: number; sgst: number },
        item: any,
      ) => {
        const qty = Number(item?.quantity || 0)
        acc.quantity += qty
        acc.discount += Number(item?.discount || 0) * qty
        acc.gst += Number(item?.gst || 0) * qty
        acc.cgst += Number(item?.cgst || 0) * qty
        acc.sgst += Number(item?.sgst || 0) * qty
        return acc
      },
      { quantity: 0, discount: 0, gst: 0, cgst: 0, sgst: 0 },
    )
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const res = await API.get(API_ENDPOINTS.PURCHASE.EXPORT, {
        responseType: 'blob',
      })
      const filename = `purchases_${new Date().toISOString().split('T')[0]}.xlsx`
      downloadFile(new Blob([res.data]), filename)
      toaster.success({ title: 'Purchases exported successfully' })
    } catch (error) {
      toaster.error({ title: 'Failed to export purchases' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadInvoice = async (purchase: any) => {
    try {
      const res = await API.get(`${API_ENDPOINTS.PURCHASE.INVOICE}/${purchase._id}/invoice`, {
        responseType: 'blob',
      })

      const safeInvoice = String(purchase.invoiceNumber || purchase._id || 'purchase-invoice')
        .replace(/[^a-zA-Z0-9-_]+/g, '_')
        .trim()
      downloadFile(new Blob([res.data], { type: 'application/pdf' }), `${safeInvoice}.pdf`)
      toaster.success({ title: 'Purchase invoice downloaded successfully' })
    } catch (error) {
      toaster.error({ title: 'Failed to download purchase invoice' })
    }
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Purchases',
        subtitle: 'Track purchase invoices, supplier dues, and stock inflow history',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, supplierIdFilter, paymentStatusFilter, fromDateFilter, toDateFilter])

  const purchases = useMemo(() => {
    const start = (page - 1) * limit
    return purchaseData.slice(start, start + limit)
  }, [purchaseData, page])

  const pagination = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(purchaseData.length / limit)),
    hasNextPage: page * limit < purchaseData.length,
    hasPreviousPage: page > 1,
  }

  const supplierBreakdown = apiSummary?.bySupplier || []
  const supplierFilterOptions = supplierBreakdown.filter((sup) => Boolean(sup.supplierId))
  const hasFilters =
    Boolean(debouncedSearch) ||
    Boolean(supplierIdFilter) ||
    Boolean(paymentStatusFilter) ||
    Boolean(fromDateFilter) ||
    Boolean(toDateFilter)

  const summary = {
    total: Number(apiSummary?.showingPurchases ?? purchaseData.length),
    showing: purchases.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
    purchaseValue: Number(apiSummary?.totalPurchaseAmount ?? apiSummary?.totalValue ?? 0),
    paidValue: Number(apiSummary?.totalPaidAmount ?? apiSummary?.totalPaid ?? 0),
    dueValue: Number(apiSummary?.totalDueAmount ?? apiSummary?.totalDue ?? 0),
  }

  const purchaseColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      width: '180px',
      render: (p: any) => p.invoiceNumber || '-',
    },
    {
      key: 'purchaseDate',
      header: 'Purchase Date',
      width: '140px',
      render: (p: any) =>
        p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      width: '140px',
      render: (p: any) =>
        p.updatedAt
          ? new Date(p.updatedAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      key: 'supplier',
      header: 'Supplier Name',
      width: '180px',
      render: (p: any) => p.supplierId?.name || p.supplierName || 'Walk-in / No Supplier',
    },
    {
      key: 'supplierMobile',
      header: 'Supplier Mobile',
      width: '150px',
      render: (p: any) => p.supplierId?.mobileNumber || '-',
    },
    {
      key: 'supplierPending',
      header: 'Supplier Pending',
      width: '150px',
      render: (p: any) =>
        p.supplierId?.pendingAmount !== undefined
          ? formatCurrency(p.supplierId.pendingAmount)
          : '-',
    },
    {
      key: 'items',
      header: 'Products',
      width: '220px',
      render: (p: any) => getItemSummary(p),
    },
    {
      key: 'itemCount',
      header: 'Item Lines',
      width: '100px',
      render: (p: any) => Number(p.items?.length || 0),
    },
    {
      key: 'totalQuantity',
      header: 'Total Qty',
      width: '100px',
      render: (p: any) => getItemTotals(p).quantity,
    },
    {
      key: 'discountTotal',
      header: 'Discount',
      width: '120px',
      render: (p: any) => formatCurrency(getItemTotals(p).discount),
    },
    {
      key: 'gstTotal',
      header: 'GST',
      width: '110px',
      render: (p: any) => formatCurrency(getItemTotals(p).gst),
    },
    {
      key: 'cgstTotal',
      header: 'CGST',
      width: '110px',
      render: (p: any) => formatCurrency(getItemTotals(p).cgst),
    },
    {
      key: 'sgstTotal',
      header: 'SGST',
      width: '110px',
      render: (p: any) => formatCurrency(getItemTotals(p).sgst),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      width: '130px',
      render: (p: any) => formatCurrency(Number(p.totalAmount || 0)),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      width: '130px',
      render: (p: any) => formatCurrency(Number(p.paidAmount || 0)),
    },
    {
      key: 'dueAmount',
      header: 'Due',
      width: '130px',
      render: (p: any) => formatCurrency(Number(p.dueAmount || 0)),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      width: '120px',
      render: (p: any) => (
        <Badge
          colorPalette={
            paymentStatusColor[p.paymentStatus as keyof typeof paymentStatusColor] || 'gray'
          }
        >
          {String(p.paymentStatus || '-').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'note',
      header: 'Note',
      width: '220px',
      render: (p: any) => p.note?.trim() || '-',
    },
  ]

  const purchaseActions = [
    {
      label: 'Download Invoice',
      icon: <Download size={14} color="#0f172a" />,
      onClick: (item: any) => {
        handleDownloadInvoice(item)
      },
    },
    {
      label: 'Update Purchase',
      icon: <FaEdit size="14px" color="#0f172a" />,
      onClick: (item: any) => {
        setActivePurchaseId(item._id)
        setActivePaidAmount(item.paidAmount || 0)
        setActiveNote(item.note || '')
        setPaymentOpen(true)
      },
    },
    {
      label: 'Delete',
      icon: <FaTrash size="14px" color="#EF4444" />,
      onClick: (item: any) => {
        setDeleteId(item._id)
        setDeleteName(item.invoiceNumber || item._id)
        setDeleteOpen(true)
      },
    },
  ]

  return (
    <>
      <Flex
        bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
        width="100%"
        minH="100%"
        flexDir="column"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 4, xl: 6 }} gap={3}>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Showing Purchases
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.total}
            </Text>
          </Box>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Value
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {formatCurrency(summary.purchaseValue)}
            </Text>
          </Box>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Paid
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {formatCurrency(summary.paidValue)}
            </Text>
          </Box>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Due
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {formatCurrency(summary.dueValue)}
            </Text>
          </Box>
        </SimpleGrid>

        <Box
          mt={4}
          bg="rgba(255,255,255,0.92)"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="18px"
          p={{ base: 3, md: 4 }}
          boxShadow="0 8px 24px rgba(15, 23, 42, 0.06)"
        >
          <Flex
            justify="space-between"
            align={{ base: 'stretch', lg: 'center' }}
            gap={4}
            direction={{ base: 'column', lg: 'row' }}
          >
            <VStack gap={3} align="stretch" flex="1">
              <Text
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="gray.600"
              >
                Search & Filters
              </Text>

              <HStack gap={2} align="center" flexWrap="wrap">
                <ExpandableSearch
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoice or supplier..."
                  expandedWidth="300px"
                />

                <select
                  style={{
                    height: '38px',
                    minWidth: '210px',
                    padding: '0 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: 'white',
                  }}
                  value={supplierIdFilter}
                  onChange={(e) => setSupplierIdFilter(e.target.value)}
                >
                  <option value="">All Suppliers</option>
                  {supplierFilterOptions.map((sup, idx) => (
                    <option key={`${sup.supplierId}-${idx}`} value={sup.supplierId || ''}>
                      {sup.supplierName}
                    </option>
                  ))}
                </select>

                <select
                  style={{
                    height: '38px',
                    minWidth: '170px',
                    padding: '0 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: 'white',
                  }}
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="advance">Advance</option>
                </select>
              </HStack>

              <HStack
                gap={2}
                p={2}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="12px"
                bg="gray.50"
                flexWrap="wrap"
              >
                <Text fontSize="xs" color="gray.600" fontWeight="700" px={1}>
                  Date Range
                </Text>

                <HStack
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="10px"
                  px={2}
                >
                  <Input
                    ref={fromDateRef}
                    type="date"
                    h="34px"
                    border="none"
                    bg="transparent"
                    minW="150px"
                    value={fromDateFilter}
                    onChange={(e) => setFromDateFilter(e.target.value)}
                    _focusVisible={{ boxShadow: 'none' }}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    color="gray.600"
                    onClick={() => {
                      const el = fromDateRef.current as
                        | (HTMLInputElement & { showPicker?: () => void })
                        | null
                      el?.showPicker?.()
                      if (!el?.showPicker) {
                        el?.click()
                      }
                    }}
                    aria-label="Open start date calendar"
                  >
                    <CalendarDays size={14} />
                  </Button>
                </HStack>

                <Text fontSize="sm" color="gray.500">
                  to
                </Text>

                <HStack
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="10px"
                  px={2}
                >
                  <Input
                    ref={toDateRef}
                    type="date"
                    h="34px"
                    border="none"
                    bg="transparent"
                    minW="150px"
                    value={toDateFilter}
                    onChange={(e) => setToDateFilter(e.target.value)}
                    _focusVisible={{ boxShadow: 'none' }}
                  />
                  <Button
                    size="xs"
                    variant="ghost"
                    color="gray.600"
                    onClick={() => {
                      const el = toDateRef.current as
                        | (HTMLInputElement & { showPicker?: () => void })
                        | null
                      el?.showPicker?.()
                      if (!el?.showPicker) {
                        el?.click()
                      }
                    }}
                    aria-label="Open end date calendar"
                  >
                    <CalendarDays size={14} />
                  </Button>
                </HStack>

                <Button
                  h="34px"
                  px={3}
                  size="sm"
                  variant="subtle"
                  borderColor="gray.300"
                  onClick={() => {
                    setSupplierIdFilter('')
                    setPaymentStatusFilter('')
                    setFromDateFilter('')
                    setToDateFilter('')
                    setSearch('')
                  }}
                  disabled={!hasFilters}
                >
                  <HStack gap={1}>
                    <FilterX size={14} />
                    <Text fontSize="xs">Clear</Text>
                  </HStack>
                </Button>
              </HStack>
            </VStack>

            <HStack gap={2} alignSelf={{ base: 'flex-end', lg: 'center' }}>
              <Button
                bg="teal.700"
                color="white"
                h="38px"
                px={4}
                _hover={{ bg: 'teal.800' }}
                onClick={() => setCreateOpen(true)}
              >
                <HStack gap={1.5}>
                  <Plus size={18} />
                  <Text fontSize="sm" fontWeight="700">
                    Add Purchase
                  </Text>
                </HStack>
              </Button>

              <Button
                bg="green.600"
                color="white"
                h="38px"
                px={3}
                loading={isExporting}
                _hover={{ bg: 'green.700' }}
                onClick={handleExport}
              >
                <HStack gap={1}>
                  <Download size={16} />
                  <Text fontSize="sm" fontWeight="700">
                    Export
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </Flex>
        </Box>

        <Box
          bg="rgba(255,255,255,0.86)"
          mt={6}
          rounded="2xl"
          shadow="lightGray"
          border="1px solid"
          borderColor="whiteAlpha.800"
          w="100%"
          p={{ base: 2, md: 4 }}
        >
          <CommonTable
            columns={purchaseColumns}
            data={purchases}
            isLoading={isLoading}
            rowKey={(p) => p._id}
            actions={purchaseActions}
            emptyMessage={
              hasFilters ? 'No purchases match selected filters.' : 'No purchases found.'
            }
          />
        </Box>

        <VStack
          justify="center"
          align="center"
          mt={3}
          p={3}
          bg="rgba(255,255,255,0.86)"
          borderRadius="18px"
          border="1px solid"
          borderColor="whiteAlpha.800"
          gap={2}
          width="100%"
          flexWrap="wrap"
        >
          <HStack gap={2} flexWrap="wrap" justify="center">
            <Button
              onClick={() => setPage(pagination.currentPage - 1)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>

            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pg = i + 1
              return (
                <Button
                  key={pg}
                  bg={pg === pagination.currentPage ? 'teal.700' : 'white'}
                  color={pg === pagination.currentPage ? 'white' : 'gray.700'}
                  border="1px solid"
                  borderColor={pg === pagination.currentPage ? 'teal.700' : 'teal.100'}
                  _hover={{ bg: pg === pagination.currentPage ? 'teal.700' : 'teal.50' }}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              )
            })}

            <Button
              onClick={() => setPage(pagination.currentPage + 1)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.600">
            Showing {purchases.length} of {purchaseData.length} purchases
          </Text>
        </VStack>
      </Flex>

      <PurchaseModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <PurchasePaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        purchaseId={activePurchaseId ?? undefined}
        defaultPaidAmount={activePaidAmount}
        defaultNote={activeNote}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Purchase"
        description={`Are you sure you want to delete purchase \"${deleteName}\"?`}
        loading={deletePurchase.isPending}
        onConfirm={() => {
          if (!deleteId) return

          deletePurchase.mutate(deleteId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}

export default Purchase
