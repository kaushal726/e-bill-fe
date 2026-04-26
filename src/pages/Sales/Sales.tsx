import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge, Input } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useDispatch } from 'react-redux'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { FilterSelect } from '@/components/common/FilterSelect'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import { FaEdit, FaTrash } from '@/components/icons'
import { FiDownload } from 'react-icons/fi'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import SaleModal from '@/components/modals/SaleModal'
import SalePaymentModal from '@/components/modals/SalePaymentModal'

import { useSalesList } from '@/hooks/useSale'
import { useSaleActions } from '@/hooks/useSaleActions'
import { useCustomers } from '@/hooks/useCustomer'

const paymentStatusColor = {
  pending: 'orange',
  partial: 'yellow',
  paid: 'green',
  advance: 'blue',
} as const

function Sales() {
  const dispatch = useDispatch()

  const [createOpen, setCreateOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [activeSaleId, setActiveSaleId] = useState<string | null>(null)
  const [activePaidAmount, setActivePaidAmount] = useState<number>(0)
  const [activeNote, setActiveNote] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [paymentFilter, setPaymentFilter] = useState<string[]>([])
  const [customerId, setCustomerId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const paymentStatus =
    paymentFilter[0] && paymentFilter[0] !== 'all' ? paymentFilter[0] : undefined

  const { data: salesResponse, isLoading } = useSalesList({
    page,
    limit,
    search: debouncedSearch || undefined,
    paymentStatus: paymentStatus as any,
    customerId: customerId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const { data: customerData } = useCustomers({ page: 1, limit: 200 })
  const { deleteSale } = useSaleActions()

  const sales = salesResponse?.sales || []
  const pagination =
    salesResponse?.pagination ||
    ({
      currentPage: 1,
      totalPages: 1,
      totalSales: 0,
      hasNextPage: false,
      hasPrevPage: false,
    } as any)

  const paymentFilterOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Partial', value: 'partial' },
    { label: 'Paid', value: 'paid' },
    { label: 'Advance', value: 'advance' },
  ]

  const downloadInvoice = async (saleId: string, invoiceNumber: string) => {
    try {
      const response = await API.get(`${API_ENDPOINTS.SALE.GET_BY_ID}/${saleId}/invoice`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoiceNumber || saleId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      // toast shown by interceptor
    }
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Sales',
        subtitle: 'Track sale invoices, customer dues, and stock outflow history',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, paymentStatus, customerId, fromDate, toDate, minAmount, maxAmount])

  const summary = {
    total: pagination.totalSales || 0,
    showing: sales.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  const activeFilterCount = [
    Boolean(paymentStatus),
    Boolean(customerId),
    Boolean(fromDate),
    Boolean(toDate),
    Boolean(minAmount),
    Boolean(maxAmount),
  ].filter(Boolean).length

  const clearFilters = () => {
    setPaymentFilter(['all'])
    setCustomerId('')
    setFromDate('')
    setToDate('')
    setMinAmount('')
    setMaxAmount('')
  }

  const saleColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      width: '160px',
      render: (s: any) => s.invoiceNumber || '-',
    },
    {
      key: 'customer',
      header: 'Customer',
      width: '200px',
      render: (s: any) => s.customerName || s.customerId?.name || 'Walk-in',
    },
    {
      key: 'saleDate',
      header: 'Sale Date',
      width: '140px',
      render: (s: any) => (s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN') : '-'),
    },
    {
      key: 'items',
      header: 'Items',
      width: '80px',
      render: (s: any) => s.items?.length ?? 0,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      width: '130px',
      render: (s: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(s.totalAmount || 0)),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      width: '130px',
      render: (s: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(s.paidAmount || 0)),
    },
    {
      key: 'dueAmount',
      header: 'Due',
      width: '130px',
      render: (s: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(s.dueAmount || 0)),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      width: '120px',
      render: (s: any) => (
        <Badge
          colorPalette={
            paymentStatusColor[s.paymentStatus as keyof typeof paymentStatusColor] || 'gray'
          }
        >
          {String(s.paymentStatus || '-').toUpperCase()}
        </Badge>
      ),
    },
  ]

  const saleActions = [
    {
      label: 'Download Invoice',
      icon: <FiDownload size="14px" color="#0f172a" />,
      onClick: (item: any) => downloadInvoice(item._id, item.invoiceNumber),
    },
    {
      label: 'Update Payment',
      icon: <FaEdit size="14px" color="#0f172a" />,
      onClick: (item: any) => {
        setActiveSaleId(item._id)
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
        <SimpleGrid minChildWidth={{ base: '140px', md: '180px' }} gap={3}>
          {[
            { label: 'Total', value: summary.total },
            { label: 'Showing', value: summary.showing },
            { label: 'Page', value: summary.activePage },
            { label: 'Total Pages', value: summary.totalPages },
          ].map((card) => (
            <Box
              key={card.label}
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="16px"
              p={3}
            >
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
                {card.label}
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
                {card.value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          mt={4}
          w="100%"
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          <HStack gap={2} flex={1} minW={0}>
            <ExpandableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales..."
              expandedWidth="300px"
            />
            <FilterDrawer
              title="Sales Filters"
              subtitle="Filter by status, customer, date range, and amount range."
              activeCount={activeFilterCount}
              onClearAll={clearFilters}
              sections={[
                {
                  key: 'status',
                  title: 'Payment Status',
                  description: 'Use this to view only pending, partial, paid, or advance sales.',
                  content: (
                    <FilterSelect
                      options={paymentFilterOptions}
                      value={paymentFilter}
                      defaultValue={['all']}
                      placeholder="Filter by status"
                      width="100%"
                      onChange={setPaymentFilter}
                    />
                  ),
                },
                {
                  key: 'customer',
                  title: 'Customer',
                  description: "Select a customer to show only that customer's sales.",
                  content: (
                    <Box>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #CBD5E0',
                          borderRadius: '12px',
                          padding: '0 12px',
                          background: 'white',
                        }}
                      >
                        <option value="">All customers</option>
                        {(customerData?.customers || []).map((c: any) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Box>
                  ),
                },
                {
                  key: 'date',
                  title: 'Date Range',
                  description: 'From and To dates apply to sale creation/sale date window.',
                  content: (
                    <VStack align="stretch" gap={2}>
                      <DateInputWithIcon value={fromDate} onChange={setFromDate} />
                      <DateInputWithIcon value={toDate} onChange={setToDate} />
                    </VStack>
                  ),
                },
                {
                  key: 'amount',
                  title: 'Amount Range',
                  description: 'Min/Max amount filters the sale total amount range.',
                  content: (
                    <HStack>
                      <Input
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="Min amount"
                        type="number"
                        bg="white"
                        borderColor="gray.200"
                        borderRadius="12px"
                        h="40px"
                      />
                      <Input
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        placeholder="Max amount"
                        type="number"
                        bg="white"
                        borderColor="gray.200"
                        borderRadius="12px"
                        h="40px"
                      />
                    </HStack>
                  ),
                },
              ]}
            />
          </HStack>

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
                Add Sale
              </Text>
            </HStack>
          </Button>
        </Flex>

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
            columns={saleColumns}
            data={sales}
            isLoading={isLoading}
            rowKey={(s) => s._id}
            actions={saleActions}
            emptyMessage={debouncedSearch ? 'No sales match your search.' : 'No sales found.'}
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
              disabled={!pagination.hasPrevPage}
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
        </VStack>
      </Flex>

      <SaleModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <SalePaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        saleId={activeSaleId ?? undefined}
        defaultPaidAmount={activePaidAmount}
        defaultNote={activeNote}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (deleteId) deleteSale.mutate(deleteId)
          setDeleteOpen(false)
        }}
        itemName={deleteName}
      />
    </>
  )
}

export default Sales
