import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Plus, Download } from 'lucide-react'
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

import { usePurchase } from '@/hooks/usePurchase'
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

  const [page, setPage] = useState(1)
  const limit = 20

  const [isExporting, setIsExporting] = useState(false)

  const { data: purchaseData = [], isLoading } = usePurchase()
  const { deletePurchase } = usePurchaseActions()

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
  }, [debouncedSearch])

  const filteredPurchases = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    if (!keyword) return purchaseData

    return purchaseData.filter((p) => {
      const haystack = [
        p.invoiceNumber,
        p.supplierId?.name || p.supplierName || '',
        p.paymentStatus,
        p.note || '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [purchaseData, debouncedSearch])

  const purchases = useMemo(() => {
    const start = (page - 1) * limit
    return filteredPurchases.slice(start, start + limit)
  }, [filteredPurchases, page])

  const pagination = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(filteredPurchases.length / limit)),
    hasNextPage: page * limit < filteredPurchases.length,
    hasPreviousPage: page > 1,
  }

  const summary = {
    total: filteredPurchases.length,
    showing: purchases.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  const purchaseColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      width: '180px',
      render: (p: any) => p.invoiceNumber || '-',
    },
    {
      key: 'supplier',
      header: 'Supplier',
      width: '200px',
      render: (p: any) => p.supplierId?.name || p.supplierName || 'Walk-in / No Supplier',
    },
    {
      key: 'purchaseDate',
      header: 'Purchase Date',
      width: '160px',
      render: (p: any) =>
        p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'items',
      header: 'Items',
      width: '90px',
      render: (p: any) => p.items?.length ?? 0,
    },
    {
      key: 'totalAmount',
      header: 'Total',
      width: '130px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.totalAmount || 0)),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      width: '130px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.paidAmount || 0)),
    },
    {
      key: 'dueAmount',
      header: 'Due',
      width: '130px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.dueAmount || 0)),
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
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.total}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Showing
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.showing}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Page
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.activePage}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Pages
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.totalPages}
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
              placeholder="Search purchases..."
              expandedWidth="300px"
            />
          </HStack>

          <HStack gap={2}>
            <Button
              bg="gray.950"
              color="white"
              h="38px"
              px={4}
              _hover={{ bg: 'gray.800' }}
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
              isLoading={isExporting}
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
              debouncedSearch ? 'No purchases match your search.' : 'No purchases found.'
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
                  bg={pg === pagination.currentPage ? 'gray.900' : 'white'}
                  color={pg === pagination.currentPage ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={pg === pagination.currentPage ? 'gray.900' : 'gray.200'}
                  _hover={{ bg: pg === pagination.currentPage ? 'gray.900' : 'gray.100' }}
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
            Showing {purchases.length} of {filteredPurchases.length} purchases
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
