import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack } from '@chakra-ui/react'

import { FaEdit, FaTrash } from '@/components/icons/index.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCustomers } from '@/hooks/useCustomer'
import CustomerDialog, { CustomerFormValues } from '@/components/modals/CustomerModal'
import { useCustomerActions } from '@/hooks/useCustomerActions'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useDispatch } from 'react-redux'
import { Plus, RefreshCw } from 'lucide-react'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { CommonTable } from '@/components/common/CommonTable'

import { isFrontendPagination } from '@/utils/isFrontendPagination'

import { useCustomerImport } from '@/hooks/useCustomerImport'
import { useCustomerExport } from '@/hooks/useCustomerExport'
import { useQueryClient } from '@tanstack/react-query'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { API } from '@/api/api'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { toaster } from '@/components/ui/toaster'

function Customers() {
  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<CustomerFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { deleteCustomer } = useCustomerActions()
  const importCustomers = useCustomerImport()
  const exportCustomers = useCustomerExport()
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)

  const [page, setPage] = useState(1)
  const limit = 20
  const frontend = isFrontendPagination(sortBy, sortOrder)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useCustomers({
    search: debouncedSearch || undefined,
    ...(frontend ? { sortBy, sortOrder } : { page, limit }),
  })

  const rawCustomers = data?.customers ?? []

  const customers = useMemo(() => {
    if (!frontend) return rawCustomers

    const start = (page - 1) * limit
    return rawCustomers.slice(start, start + limit)
  }, [rawCustomers, page, limit, frontend])

  const pagination = frontend
    ? {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(rawCustomers.length / limit)),
        hasNextPage: page * limit < rawCustomers.length,
        hasPreviousPage: page > 1,
      }
    : (data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      })

  useEffect(() => {
    setPage(1)
  }, [sortBy, sortOrder, search])

  const customerColumns = [
    { key: 'name', header: 'Contact Name', width: '220px', render: (c: any) => c.name || '-' },
    {
      key: 'customerId',
      header: 'Customer ID',
      width: '170px',
      render: (c: any) => (c?._id ? `CUS-${c._id.slice(-6).toUpperCase()}` : '-'),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      width: '170px',
      render: (c: any) => c.mobileNumber || '-',
    },
    { key: 'email', header: 'Email', width: '220px', render: (c: any) => c.email || '-' },
    { key: 'address', header: 'Address', width: '240px', render: (c: any) => c.address || '-' },
    {
      key: 'balance',
      header: 'Balance',
      width: '140px',
      render: (c: any) =>
        Number.isFinite(Number(c.balance))
          ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(Number(c.balance))
          : 'INR 0',
    },
    {
      key: 'totalPurchases',
      header: 'Total Purchases',
      width: '160px',
      render: (c: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(c.totalPurchases || 0)),
    },
  ]

  const customerActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#0f172a" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({
          name: item.name,
          mobileNumber: item.mobileNumber,
          email: item.email,
          balance: item.balance,
          address: item.address,
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

  const CUSTOMER_SORT_OPTIONS = [
    { key: 'name', label: 'Name' },
    { key: 'balance', label: 'Balance' },
    { key: 'createdAt', label: 'Created Time' },
  ]

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Customers',
        subtitle: 'Manage buyers, contact records, and outstanding balances in one place',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importCustomers.mutate(file)
    e.target.value = ''
  }

  const handleExportClick = () => {
    exportCustomers.mutate({
      page,
      limit,
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    })
  }

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true)
      const res = await API.get(API_ENDPOINTS.CUSTOMERS.TEMPLATE, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'customer_sample.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toaster.success({ title: 'Template downloaded successfully' })
    } catch (error) {
      toaster.error({ title: 'Failed to download template' })
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const summary = {
    total: rawCustomers.length,
    showing: customers.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />

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
              placeholder="Search customers…"
              expandedWidth="300px"
            />

            <Text
              fontSize="xs"
              color="gray.600"
              bg="white"
              px={3}
              py={2}
              borderRadius="10px"
              border="1px solid"
              borderColor="gray.100"
            >
              Sorted by {sortBy} ({sortOrder})
            </Text>
          </HStack>
          <HStack gap={2}>
            <Button
              bg="gray.950"
              color="white"
              h="38px"
              px={4}
              _hover={{ bg: 'gray.800' }}
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
                  Add Customer
                </Text>
              </HStack>
            </Button>

            <Button
              variant="outline"
              bg="white"
              color="black"
              borderColor="gray.300"
              h="38px"
              px={3}
              _hover={{ bg: 'gray.50' }}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}
            >
              <HStack gap={1}>
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="700" color="black">
                  Sync Customers
                </Text>
              </HStack>
            </Button>

            <TableActionsPopover
              sortBy={sortBy}
              sortOrder={sortOrder}
              sortOptions={CUSTOMER_SORT_OPTIONS}
              onSortChange={(key, order) => {
                setPage(1)
                setSortBy(key)
                setSortOrder(order)
              }}
              onImport={handleImportClick}
              onExport={handleExportClick}
              onDownloadTemplate={handleDownloadTemplate}
              showUtilityActions={false}
              showRefreshAction={false}
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
            columns={customerColumns}
            data={customers}
            isLoading={isLoading}
            rowKey={(c) => c._id}
            actions={customerActions}
            emptyMessage={
              debouncedSearch ? 'No customers match your search.' : 'No customers found.'
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
            Showing {customers.length} of {rawCustomers.length} customers
          </Text>
        </VStack>
      </Flex>

      <CustomerDialog
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteName}"?`}
        loading={deleteCustomer.isPending}
        onConfirm={() => {
          if (!deleteId) return

          deleteCustomer.mutate(deleteId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}

export default Customers
