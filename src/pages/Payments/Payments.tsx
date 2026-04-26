import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge, Input } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import PaymentModal from '@/components/modals/PaymentModal'

import { usePayment, usePaymentDues, usePaymentSummary } from '@/hooks/usePayment'

const paymentTypeColor = {
  supplier: 'orange',
  customer: 'blue',
} as const

const getInvoiceFromPayment = (payment: any) => {
  const directInvoice =
    payment?.invoiceNumber ||
    payment?.billNumber ||
    payment?.saleId?.invoiceNumber ||
    payment?.purchaseId?.invoiceNumber

  if (directInvoice) return String(directInvoice)

  const note = String(payment?.note || '')
  const invFromNote = note.match(/INV\s*:\s*([^|\n]+)/i)?.[1]?.trim()
  if (invFromNote) return invFromNote

  return ''
}

const Payments = () => {
  const dispatch = useDispatch()

  const [modalOpen, setModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<'supplier' | 'customer'>('supplier')

  const [typeFilter, setTypeFilter] = useState<'all' | 'supplier' | 'customer'>('all')
  const [modeFilter, setModeFilter] = useState('')
  const [partyId, setPartyId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [page, setPage] = useState(1)
  const limit = 20

  const { data: paymentResponse, isLoading } = usePayment({
    page,
    limit,
    search: debouncedSearch || undefined,
    paidToType: typeFilter === 'all' ? undefined : typeFilter,
    paymentMode: (modeFilter as any) || undefined,
    partyId: partyId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const paymentData = paymentResponse?.payments || []
  const { data: paymentSummary } = usePaymentSummary()
  const { data: duesData } = usePaymentDues()

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Payments',
        subtitle: 'Track all supplier and customer payments',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, typeFilter, modeFilter, partyId, fromDate, toDate, minAmount, maxAmount])

  const payments = paymentData

  const pagination = paymentResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalPayments: paymentData.length,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const summary = {
    total: pagination.totalPayments || paymentData.length,
    showing: payments.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  const activeFilterCount = [
    typeFilter !== 'all',
    Boolean(modeFilter),
    Boolean(partyId),
    Boolean(fromDate),
    Boolean(toDate),
    Boolean(minAmount),
    Boolean(maxAmount),
  ].filter(Boolean).length

  const clearFilters = () => {
    setTypeFilter('all')
    setModeFilter('')
    setPartyId('')
    setFromDate('')
    setToDate('')
    setMinAmount('')
    setMaxAmount('')
  }

  const paymentColumns = [
    {
      key: 'paidToType',
      header: 'Type',
      width: '130px',
      render: (p: any) => (
        <Badge
          colorPalette={paymentTypeColor[p.paidToType as keyof typeof paymentTypeColor] || 'gray'}
          textTransform="capitalize"
        >
          {p.paidToType === 'supplier' ? 'Pay Supplier' : 'From Customer'}
        </Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      width: '200px',
      render: (p: any) => p.supplierId?.name || p.customerId?.name || p.partyName || '-',
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      width: '160px',
      render: (p: any) => getInvoiceFromPayment(p) || '-',
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      width: '160px',
      render: (p: any) =>
        p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '130px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.amount || 0)),
    },
    {
      key: 'paymentMode',
      header: 'Payment Mode',
      width: '130px',
      render: (p: any) => (
        <Text fontSize="sm" textTransform="capitalize">
          {p.paymentMode || '-'}
        </Text>
      ),
    },
    {
      key: 'note',
      header: 'Note',
      width: '150px',
      render: (p: any) => <Text fontSize="sm">{p.note || '-'}</Text>,
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
        overflowY="auto"
      >
        <SimpleGrid minChildWidth={{ base: '140px', md: '180px' }} gap={3}>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Payments
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {paymentSummary?.totalPayments ?? summary.total}
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
              Total Amount
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(paymentSummary?.totalAmount ?? 0))}
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
              From Customers
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(paymentSummary?.totalFromCustomers ?? 0))}
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
              To Suppliers
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="orange.600">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(paymentSummary?.totalToSuppliers ?? 0))}
            </Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mt={3}>
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              This Month
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="gray.900">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(paymentSummary?.thisMonthAmount ?? 0))}
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
              Customer Payments Count
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="gray.900">
              {paymentSummary?.customerPaymentsCount ?? 0}
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
              Supplier Payments Count
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="gray.900">
              {paymentSummary?.supplierPaymentsCount ?? 0}
            </Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mt={3}>
          <Box bg="white" border="1px solid" borderColor="orange.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="orange.500" textTransform="uppercase" letterSpacing="0.06em">
              Walk-in Supplier Due
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="orange.600">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(
                Number(
                  paymentResponse?.walkInSupplierDueAmount ??
                    paymentSummary?.supplier?.walkInDueAmount ??
                    0,
                ),
              )}
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
              Walk-in Supplier Payments
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="gray.900">
              {paymentResponse?.walkInSupplierPaymentsCount ?? 0}
            </Text>
          </Box>

          <Box bg="white" border="1px solid" borderColor="green.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="green.500" textTransform="uppercase" letterSpacing="0.06em">
              Walk-in Supplier Paid
            </Text>
            <Text mt={1} fontSize="lg" fontWeight="700" color="green.600">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(paymentResponse?.totalWalkInSupplierPaid ?? 0))}
            </Text>
          </Box>
        </SimpleGrid>

        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          mt={4}
          w="100%"
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          <HStack gap={2} align="center" flexWrap="wrap">
            <ExpandableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice, party, mode, note..."
              expandedWidth="300px"
            />
            <FilterDrawer
              title="Payment Filters"
              subtitle="Filter by direction, payment mode, party, date, and amount range."
              activeCount={activeFilterCount}
              onClearAll={clearFilters}
              sections={[
                {
                  key: 'type',
                  title: 'Payment Direction',
                  description: 'Supplier means money paid out. Customer means money received.',
                  content: (
                    <HStack
                      bg="white"
                      border="1px solid"
                      borderColor="gray.100"
                      borderRadius="10px"
                      p={1}
                    >
                      {(['all', 'supplier', 'customer'] as const).map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          variant={typeFilter === t ? 'solid' : 'ghost'}
                          bg={typeFilter === t ? 'gray.900' : 'transparent'}
                          color={typeFilter === t ? 'white' : 'gray.700'}
                          _hover={{ bg: typeFilter === t ? 'gray.900' : 'gray.100' }}
                          onClick={() => setTypeFilter(t)}
                          textTransform="capitalize"
                        >
                          {t === 'all' ? 'All' : t === 'supplier' ? 'Supplier' : 'Customer'}
                        </Button>
                      ))}
                    </HStack>
                  ),
                },
                {
                  key: 'mode-party',
                  title: 'Mode and Party',
                  description:
                    'Mode filters payment channel. Party filters a specific supplier/customer.',
                  content: (
                    <VStack align="stretch" gap={2}>
                      <Box>
                        <select
                          value={modeFilter}
                          onChange={(e) => setModeFilter(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid #CBD5E0',
                            borderRadius: '12px',
                            padding: '0 12px',
                            background: 'white',
                          }}
                        >
                          <option value="">All modes</option>
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="bank">Bank</option>
                          <option value="other">Other</option>
                        </select>
                      </Box>
                      <Box>
                        <select
                          value={partyId}
                          onChange={(e) => setPartyId(e.target.value)}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid #CBD5E0',
                            borderRadius: '12px',
                            padding: '0 12px',
                            background: 'white',
                          }}
                        >
                          <option value="">All parties</option>
                          {[...(duesData?.customers || []), ...(duesData?.suppliers || [])]
                            .filter(
                              (p, i, arr) =>
                                p.partyId && arr.findIndex((x) => x.partyId === p.partyId) === i,
                            )
                            .map((party: any) => (
                              <option key={party.partyId} value={party.partyId}>
                                {party.partyName}
                              </option>
                            ))}
                        </select>
                      </Box>
                    </VStack>
                  ),
                },
                {
                  key: 'date',
                  title: 'Date Range',
                  description: 'From and To apply to payment date/created date range.',
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
                  description: 'Min/Max filters payment amount values.',
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

          <HStack gap={2}>
            <Button
              bg="orange.500"
              color="white"
              h="38px"
              px={4}
              _hover={{ bg: 'orange.600' }}
              onClick={() => {
                setDefaultType('supplier')
                setModalOpen(true)
              }}
            >
              <HStack gap={1.5}>
                <Plus size={16} />
                <Text fontSize="sm" fontWeight="700">
                  Pay Supplier
                </Text>
              </HStack>
            </Button>

            <Button
              bg="blue.600"
              color="white"
              h="38px"
              px={4}
              _hover={{ bg: 'blue.700' }}
              onClick={() => {
                setDefaultType('customer')
                setModalOpen(true)
              }}
            >
              <HStack gap={1.5}>
                <Plus size={16} />
                <Text fontSize="sm" fontWeight="700">
                  Receive from Customer
                </Text>
              </HStack>
            </Button>
          </HStack>
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
            columns={paymentColumns}
            data={payments}
            isLoading={isLoading}
            rowKey={(p) => p._id}
            emptyMessage={debouncedSearch ? 'No payments match your search.' : 'No payments found.'}
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

          <Text fontSize="xs" color="gray.600">
            Showing {payments.length} of {summary.total} payments
          </Text>
        </VStack>
      </Flex>
      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={defaultType}
      />
    </>
  )
}

export default Payments
