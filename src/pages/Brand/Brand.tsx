import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { toaster } from '@/components/ui/toaster'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { FilterDrawer } from '@/components/common/FilterDrawer'

import { FaEdit, FaTrash } from '@/components/icons'
import BrandModal, { BrandFormValues } from '@/components/modals/BrandModal'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'

import { useBrand } from '@/hooks/useBrand'
import { useBrandActions } from '@/hooks/useBrandActions'
import { useBrandImport } from '@/hooks/useBrandImport'
import { useBrandExport } from '@/hooks/useBrandExport'

function Brands() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<BrandFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [page, setPage] = useState(1)
  const limit = 20

  const { deleteBrand } = useBrandActions()
  const importBrands = useBrandImport()
  const exportBrands = useBrandExport()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useBrand({
    page,
    limit,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })

  const rawBrands = data?.brands ?? []
  const brands = rawBrands

  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalBrands: rawBrands.length,
  }

  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder, fromDate, toDate])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Brands',
        subtitle: 'Manage your product brands for better filtering and product organization',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const brandColumns = [
    {
      key: 'name',
      header: 'Brand Name',
      width: '240px',
      render: (b: any) => b.name ?? '-',
    },
    {
      key: 'brandId',
      header: 'Brand ID',
      width: '170px',
      render: (b: any) => (b?._id ? `BRD-${b._id.slice(-6).toUpperCase()}` : '-'),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      width: '170px',
      render: (b: any) => (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-'),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      width: '170px',
      render: (b: any) => (b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '-'),
    },
  ]

  const brandActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#7C3AED" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({ name: item.name })
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

  const BRAND_SORT_OPTIONS = [
    { key: 'name', label: 'Name' },
    { key: 'createdAt', label: 'Created Time' },
    { key: 'updatedAt', label: 'Last Modified Time' },
  ]

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importBrands.mutate(file)
    e.target.value = ''
  }

  const handleExportClick = () => {
    exportBrands.mutate({ page, limit, ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}) })
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.BRAND.TEMPLATE, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'brand_sample.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toaster.success({ title: 'Template downloaded successfully' })
    } catch {
      toaster.error({ title: 'Failed to download template' })
    }
  }

  const summary = {
    total: data?.pagination?.totalCount ?? rawBrands.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
    showing: brands.length,
  }

  const activeFilterCount = [Boolean(fromDate), Boolean(toDate)].filter(Boolean).length

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
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
        w="100%"
        h="100%"
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
          mt={2}
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          <HStack gap={2} flexWrap="wrap" align="center">
            <ExpandableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
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
            <FilterDrawer
              title="Brand Filters"
              subtitle="Use date range to narrow brands by created date."
              activeCount={activeFilterCount}
              onClearAll={clearFilters}
              sections={[
                {
                  key: 'date',
                  title: 'Created Date Range',
                  description: 'From and To date apply on brand created date.',
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

          <HStack gap={2} justify={{ base: 'space-between', md: 'flex-end' }}>
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
                  Add Brand
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ['brands'] })}
            >
              <HStack gap={1}>
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="700" color="black">
                  Sync Brands
                </Text>
              </HStack>
            </Button>

            <TableActionsPopover
              sortBy={sortBy}
              sortOrder={sortOrder}
              sortOptions={BRAND_SORT_OPTIONS}
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
          p={4}
          border="1px solid"
          borderColor="whiteAlpha.800"
        >
          <CommonTable
            columns={brandColumns}
            data={brands}
            isLoading={isLoading}
            rowKey={(b) => b._id}
            actions={brandActions}
            emptyMessage={debouncedSearch ? 'No brands match your search.' : 'No brands found.'}
          />
        </Box>

        <VStack
          justify="center"
          align="center"
          mt={3}
          gap={2}
          bg="rgba(255,255,255,0.86)"
          p={3}
          borderRadius="18px"
          border="1px solid"
          borderColor="whiteAlpha.800"
          flexWrap="wrap"
        >
          <HStack gap={2} flexWrap="wrap" justify="center">
            <Button
              onClick={() => setPage(pagination.currentPage - 1)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
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
            Showing {brands.length} of {summary.total} brands
          </Text>
        </VStack>
      </Flex>

      <BrandModal
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deleteName}"?`}
        loading={deleteBrand.isPending}
        onConfirm={() => {
          if (!deleteId) return
          deleteBrand.mutate(deleteId, { onSuccess: () => setDeleteOpen(false) })
        }}
      />
    </>
  )
}

export default Brands
