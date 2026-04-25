import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack } from '@chakra-ui/react'

import { FaEdit, FaTrash } from '@/components/icons'

import { useEffect, useMemo, useRef, useState } from 'react'

import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'
import ProductDialog, { ProductFormValues } from '@/components/modals/ProductModal'
import { useProducts } from '@/hooks/useProducts'
import { useProductActions } from '@/hooks/useProductActions'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useDispatch } from 'react-redux'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { Plus, RefreshCw } from 'lucide-react'
import { CommonTable } from '@/components/common/CommonTable'
import { useProductImport } from '@/hooks/useProductImport'
import { useProductExport } from '@/hooks/useProductExport'
import { useQueryClient } from '@tanstack/react-query'
import { isFrontendPagination } from '@/utils/isFrontendPagination'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'

function Products() {
  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<ProductFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { deleteProduct } = useProductActions()
  const importProducts = useProductImport()
  const exportProducts = useProductExport()
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [page, setPage] = useState(1)
  const limit = 20

  const frontend = isFrontendPagination(sortBy, sortOrder)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    ...(frontend ? { sortBy, sortOrder } : { page, limit }),
  })

  const rawProducts = data?.products ?? []

  const products = useMemo(() => {
    if (!frontend) return rawProducts

    const start = (page - 1) * limit
    return rawProducts.slice(start, start + limit)
  }, [rawProducts, page, limit, frontend])

  const pagination = frontend
    ? {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(rawProducts.length / limit)),
        hasNextPage: page * limit < rawProducts.length,
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

  const productColumns = [
    {
      key: 'name',
      header: 'Product Name',
      width: '220px',
      render: (p: any) => p.name || '-',
    },
    {
      key: 'productId',
      header: 'Product ID',
      width: '170px',
      render: (p: any) => (p?._id ? `PRD-${p._id.slice(-6).toUpperCase()}` : '-'),
    },
    {
      key: 'brand',
      header: 'Brand',
      width: '170px',
      render: (p: any) => p.brand || '-',
    },
    {
      key: 'category',
      header: 'Category',
      width: '170px',
      render: (p: any) => p.categoryId?.name ?? '—',
    },
    {
      key: 'supplier',
      header: 'Supplier',
      width: '240px',
      render: (p: any) =>
        p.supplierId?.name
          ? `${p.supplierId.name}${p.supplierId.mobileNumber ? ` (${p.supplierId.mobileNumber})` : ''}`
          : '—',
    },

    {
      key: 'purchasePrice',
      header: 'Purchase Price',
      width: '170px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.purchasePrice || 0)),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      width: '170px',
      render: (p: any) =>
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(p.sellingPrice || 0)),
    },
    {
      key: 'unit',
      header: 'Unit',
      width: '100px',
      render: (p: any) => p.unit || 'pcs',
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '110px',
      render: (p: any) => p.stock ?? 0,
    },
    {
      key: 'minimumStock',
      header: 'Min Stock',
      width: '110px',
      render: (p: any) => p.minimumStock ?? 0,
    },
    {
      key: 'gstPercentage',
      header: 'GST %',
      width: '100px',
      render: (p: any) => `${Number(p.gstPercentage ?? 0).toFixed(2)}%`,
    },
    {
      key: 'gstInclusive',
      header: 'GST Inclusive',
      width: '130px',
      render: (p: any) => (p.gstInclusive ? 'Yes' : 'No'),
    },
    {
      key: 'discountType',
      header: 'Discount Type',
      width: '130px',
      render: (p: any) => (p.discountType === 'percentage' ? '%' : '₹'),
    },
    {
      key: 'discountValue',
      header: 'Discount Value',
      width: '130px',
      render: (p: any) => Number(p.discountValue ?? 0),
    },
  ]

  const productActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="16px" color="#0f172a" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({
          name: item.name,
          brand: item.brand,
          categoryId: item.categoryId?._id,
          supplierId: item.supplierId?._id,
          purchasePrice: String(item.purchasePrice ?? 0),
          sellingPrice: String(item.sellingPrice ?? 0),
          unit: item.unit || 'pcs',
          stock: String(item.stock ?? 0),
          gstPercentage: String(item.gstPercentage ?? 0),
          gstInclusive: item.gstInclusive ?? false,
          discountType: item.discountType || 'percentage',
          discountValue: String(item.discountValue ?? 0),
          minimumStock: String(item.minimumStock ?? 0),
          newCategoryName: '',
        })
        setOpen(true)
      },
    },
    {
      label: 'Delete',
      icon: <FaTrash size="16px" color="#EF4444" />,
      onClick: (item: any) => {
        setDeleteId(item._id)
        setDeleteName(item.name)
        setDeleteOpen(true)
      },
    },
  ]

  const PRODUCT_SORT_OPTIONS = [
    { key: 'name', label: 'Name' },
    { key: 'sellingPrice', label: 'Selling Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'createdAt', label: 'Created Time' },
  ]
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Products',
        subtitle: 'Manage catalog, pricing, stock, and supplier mapping from one workspace',
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
    importProducts.mutate(file)
    e.target.value = ''
  }

  const handleExportClick = () => {
    exportProducts.mutate({
      page,
      limit,
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    })
  }

  const summary = {
    total: rawProducts.length,
    showing: products.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
  }

  const activeSortLabel =
    PRODUCT_SORT_OPTIONS.find((option) => option.key === sortBy)?.label || 'Name'

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
        overflowX="auto"
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
              placeholder="Search Products"
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
                  Add Product
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            >
              <HStack gap={1}>
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="700" color="black">
                  Sync Products
                </Text>
              </HStack>
            </Button>

            <TableActionsPopover
              sortBy={sortBy}
              sortOrder={sortOrder}
              sortOptions={PRODUCT_SORT_OPTIONS}
              onSortChange={(key, order) => {
                setPage(1)
                setSortBy(key)
                setSortOrder(order)
              }}
              onImport={handleImportClick}
              onExport={handleExportClick}
              showUtilityActions={false}
              showRefreshAction={false}
            />
          </HStack>
        </Flex>

        <Box mt={5} w="100%" p={0}>
          <CommonTable
            columns={productColumns}
            data={products}
            isLoading={isLoading}
            rowKey={(p) => p._id}
            actions={productActions}
            emptyMessage={debouncedSearch ? 'No products match your search.' : 'No products found.'}
          />
        </Box>

        <VStack
          justify="center"
          align="center"
          mt={3}
          p={2}
          bg="white"
          borderRadius="12px"
          border="1px solid"
          borderColor="gray.200"
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

            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pg = index + 1
              return (
                <Button
                  key={pg}
                  onClick={() => setPage(pg)}
                  bg={pg === pagination.currentPage ? 'gray.900' : 'white'}
                  color={pg === pagination.currentPage ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={pg === pagination.currentPage ? 'gray.900' : 'gray.200'}
                  _hover={{ bg: pg === pagination.currentPage ? 'gray.900' : 'gray.100' }}
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
            Showing {products.length} of {rawProducts.length} products
          </Text>
        </VStack>
      </Flex>

      <ProductDialog
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteProduct.isPending}
        onConfirm={() => {
          if (!deleteId) return

          deleteProduct.mutate(deleteId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}

export default Products
