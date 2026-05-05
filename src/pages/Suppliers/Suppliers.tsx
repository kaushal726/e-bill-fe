import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toaster } from '@/components/ui/toaster'
import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import { FaEdit, FaTrash } from '@/components/icons'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'
import SupplierModal, { SupplierFormValues } from '@/components/modals/SupplierModal'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'

import { useSuppliers } from '@/hooks/useSupplier'
import { useSupplierActions } from '@/hooks/useSupplierActions'

type SupplierSortKey =
  | 'name'
  | 'mobileNumber'
  | 'pendingAmount'
  | 'totalPurchaseAmount'
  | 'createdAt'

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

const SUPPLIER_SORT_OPTIONS: Array<{ key: SupplierSortKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'pendingAmount', label: 'Pending Amount' },
  { key: 'totalPurchaseAmount', label: 'Total Purchased' },
  { key: 'createdAt', label: 'Created Date' },
]

function Suppliers() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<SupplierFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [sortBy, setSortBy] = useState<SupplierSortKey>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [minPending, setMinPending] = useState('')
  const [maxPending, setMaxPending] = useState('')
  const [minPurchase, setMinPurchase] = useState('')
  const [maxPurchase, setMaxPurchase] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [page, setPage] = useState(1)
  const limit = 20

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: suppliersResponse, isLoading } = useSuppliers({
    page,
    limit,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
    minPending: minPending ? Number(minPending) : undefined,
    maxPending: maxPending ? Number(maxPending) : undefined,
    minPurchase: minPurchase ? Number(minPurchase) : undefined,
    maxPurchase: maxPurchase ? Number(maxPurchase) : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })
  const { deleteSupplier } = useSupplierActions()

  const suppliers = suppliersResponse?.suppliers || []
  const pagination = suppliersResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalSuppliers: suppliers.length,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.SUPPLIERS.TEMPLATE, {
        responseType: 'blob',
      })
      downloadFile(new Blob([res.data]), 'supplier_sample.xlsx')
      toaster.success({ title: 'Template downloaded successfully' })
    } catch (error) {
      toaster.error({ title: 'Failed to download template' })
    }
  }

  const handleExport = async () => {
    try {
      if (isExporting) return
      setIsExporting(true)
      const res = await API.get(API_ENDPOINTS.SUPPLIERS.EXPORT, {
        responseType: 'blob',
      })
      const filename = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`
      downloadFile(new Blob([res.data]), filename)
      toaster.success({ title: 'Suppliers exported successfully' })
    } catch (error) {
      toaster.error({ title: 'Failed to export suppliers' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    try {
      if (isImporting) return
      setIsImporting(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await API.post(API_ENDPOINTS.SUPPLIERS.IMPORT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { created = 0, updated = 0, failed = 0 } = res.data?.data || {}

      if (failed > 0) {
        toaster.error({
          title: `Import completed with errors`,
          description: `Created: ${created}, Updated: ${updated}, Failed: ${failed}`,
        })
      } else {
        toaster.success({
          title: 'Suppliers imported successfully',
          description: `Created: ${created}, Updated: ${updated}`,
        })
      }

      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    } catch (error: any) {
      toaster.error({
        title: 'Import failed',
        description: error.response?.data?.message || 'Please check the file format',
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportClick = () => {
    if (isImporting) return
    fileInputRef.current?.click()
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Suppliers',
        subtitle: 'Manage vendors, contact details, and pending payable balances',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    sortBy,
    sortOrder,
    minPending,
    maxPending,
    minPurchase,
    maxPurchase,
    fromDate,
    toDate,
  ])

  const summary = {
    total: pagination.totalSuppliers || suppliers.length,
    showing: suppliers.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  const activeFilterCount = [
    Boolean(minPending),
    Boolean(maxPending),
    Boolean(minPurchase),
    Boolean(maxPurchase),
    Boolean(fromDate),
    Boolean(toDate),
  ].filter(Boolean).length

  const clearFilters = () => {
    setMinPending('')
    setMaxPending('')
    setMinPurchase('')
    setMaxPurchase('')
    setFromDate('')
    setToDate('')
  }

  const activeSortLabel =
    SUPPLIER_SORT_OPTIONS.find((option) => option.key === sortBy)?.label || 'Name'

  const supplierColumns = [
    {
      key: 'name',
      header: 'Supplier Name',
      width: '220px',
      render: (s: any) => s.name || '-',
    },
    {
      key: 'supplierId',
      header: 'Supplier ID',
      width: '170px',
      render: (s: any) => (s?._id ? `SUP-${s._id.slice(-6).toUpperCase()}` : '-'),
    },
    {
      key: 'mobileNumber',
      header: 'Mobile',
      width: '170px',
      render: (s: any) => s.mobileNumber || '-',
    },
    {
      key: 'address',
      header: 'Address',
      width: '260px',
      render: (s: any) => s.address || '-',
    },
    {
      key: 'pendingAmount',
      header: 'Pending Amount',
      width: '180px',
      render: (s: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(s.pendingAmount || 0)),
    },
    {
      key: 'totalPurchaseAmount',
      header: 'Total Purchased',
      width: '180px',
      render: (s: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(s.totalPurchaseAmount || 0)),
    },
  ]

  const supplierActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#0f172a" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({
          name: item.name,
          mobileNumber: item.mobileNumber,
          address: item.address,
          pendingAmount: Number(item.pendingAmount || 0),
          totalPurchaseAmount: Number(item.totalPurchaseAmount || 0),
        })
        setOpen(true)
      },
    },
    {
      label: 'Delete',
      icon: <FaTrash size="14px" color="#EF4444" />,
      onClick: (item: any) => {
        setDeleteId(item._id)
        setDeleteName(item.name)
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
          <Box
            bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
            border="1px solid"
            borderColor="teal.100"
            borderRadius="14px"
            p={2.5}
            boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total
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
              Showing
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.showing}
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
              Page
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.activePage}
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
              placeholder="Search suppliers..."
              expandedWidth="300px"
            />

            <Text
              fontSize="xs"
              color="gray.700"
              bg="white"
              px={3}
              py={2}
              borderRadius="10px"
              border="1px solid"
              borderColor="gray.200"
            >
              Sorted by {activeSortLabel} ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
            </Text>
            <FilterDrawer
              title="Supplier Filters"
              subtitle="Filter by pending/purchase ranges and created date range."
              activeCount={activeFilterCount}
              onClearAll={clearFilters}
              sections={[
                {
                  key: 'pending',
                  title: 'Pending Amount Range',
                  description: 'Min/Max pending filters supplier payable pending amount.',
                  content: (
                    <HStack>
                      <input
                        value={minPending}
                        onChange={(e) => setMinPending(e.target.value)}
                        placeholder="Min pending"
                        type="number"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #CBD5E0',
                          borderRadius: '12px',
                          padding: '0 10px',
                          background: 'white',
                        }}
                      />
                      <input
                        value={maxPending}
                        onChange={(e) => setMaxPending(e.target.value)}
                        placeholder="Max pending"
                        type="number"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #CBD5E0',
                          borderRadius: '12px',
                          padding: '0 10px',
                          background: 'white',
                        }}
                      />
                    </HStack>
                  ),
                },
                {
                  key: 'purchase',
                  title: 'Purchase Amount Range',
                  description: 'Min/Max purchase filters supplier total purchase amount.',
                  content: (
                    <HStack>
                      <input
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(e.target.value)}
                        placeholder="Min purchase"
                        type="number"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #CBD5E0',
                          borderRadius: '12px',
                          padding: '0 10px',
                          background: 'white',
                        }}
                      />
                      <input
                        value={maxPurchase}
                        onChange={(e) => setMaxPurchase(e.target.value)}
                        placeholder="Max purchase"
                        type="number"
                        style={{
                          width: '100%',
                          height: '40px',
                          border: '1px solid #CBD5E0',
                          borderRadius: '12px',
                          padding: '0 10px',
                          background: 'white',
                        }}
                      />
                    </HStack>
                  ),
                },
                {
                  key: 'date',
                  title: 'Created Date Range',
                  description: 'From and To date apply to supplier created date.',
                  content: (
                    <VStack align="stretch" gap={2}>
                      <DateInputWithIcon value={fromDate} onChange={setFromDate} />
                      <DateInputWithIcon value={toDate} onChange={setToDate} />
                    </VStack>
                  ),
                },
              ]}
            />
          </HStack>

          <HStack gap={2}>
            <Button
              bg="teal.700"
              color="white"
              h="38px"
              px={4}
              onClick={() => {
                setDialogMode('add')
                setEditId(null)
                setEditDefaults(undefined)
                setOpen(true)
              }}
            >
              <HStack gap={1.5}>
                <Plus size={18} />
                <Text fontSize="sm" fontWeight="700">
                  Add Supplier
                </Text>
              </HStack>
            </Button>

            <Button
              bg="white"
              color="gray.800"
              border="1px solid"
              borderColor="gray.200"
              h="38px"
              px={3}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['suppliers'] })}
            >
              <HStack gap={1}>
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="700" color="black">
                  Sync Suppliers
                </Text>
              </HStack>
            </Button>

            <TableActionsPopover
              sortBy={sortBy}
              sortOrder={sortOrder}
              sortOptions={SUPPLIER_SORT_OPTIONS}
              onSortChange={(key, order) => {
                setPage(1)
                setSortBy(key as SupplierSortKey)
                setSortOrder(order)
              }}
              onImport={handleImportClick}
              onExport={handleExport}
              onDownloadTemplate={handleDownloadTemplate}
              refreshLabel="Sync Suppliers"
              refreshIcon={RefreshCw}
              showUtilityActions={false}
              showRefreshAction={false}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImport(file)
                }
              }}
            />
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
            columns={supplierColumns}
            data={suppliers}
            isLoading={isLoading}
            rowKey={(s) => s._id}
            actions={supplierActions}
            emptyMessage={
              debouncedSearch ? 'No suppliers match your search.' : 'No suppliers found.'
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
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.600">
            Showing {suppliers.length} of {summary.total} suppliers
          </Text>
        </VStack>
      </Flex>

      <SupplierModal
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteName}"?`}
        loading={deleteSupplier.isPending}
        onConfirm={() => {
          if (!deleteId) return

          deleteSupplier.mutate(deleteId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}

export default Suppliers
