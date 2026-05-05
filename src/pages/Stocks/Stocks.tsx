import {
  Flex,
  HStack,
  Text,
  Button,
  Box,
  SimpleGrid,
  VStack,
  Badge,
  Input,
  Grid,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { useStockHistory } from '@/hooks/useStockHistory'
import { useProducts } from '@/hooks/useProducts'
import { AlertTriangle, Package } from 'lucide-react'

const Stocks = () => {
  const dispatch = useDispatch()

  const [activeTab, setActiveTab] = useState<'history' | 'inventory'>('history')

  // Stock history state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [typeFilter, setTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all')
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'purchase' | 'sale' | 'adjustment' | 'damage'
  >('all')
  const [productFilter, setProductFilter] = useState<'all' | string>('all')
  const [page, setPage] = useState(1)
  const limit = 20

  // Current inventory state
  const [invSearch, setInvSearch] = useState('')
  const [invPage, setInvPage] = useState(1)
  const invLimit = 30

  const { data: productData, isLoading: productsLoading } = useProducts({
    page: invPage,
    limit: invLimit,
    search: invSearch || undefined,
  })
  const { data: historyData = [], isLoading } = useStockHistory({
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    ...(sourceFilter !== 'all' ? { source: sourceFilter } : {}),
    ...(productFilter !== 'all' ? { productId: productFilter } : {}),
  })

  // Products for history filter dropdown (small set)
  const { data: allProductData } = useProducts({ page: 1, limit: 100 })
  const allProducts = allProductData?.products ?? []

  const inventoryProducts = productData?.products ?? []
  const invPagination = productData?.pagination

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Stocks',
        subtitle: 'View current inventory levels and track all stock movements',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, typeFilter, sourceFilter, productFilter])

  useEffect(() => {
    setInvPage(1)
  }, [invSearch])

  const filteredData = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    if (!keyword) return historyData
    return historyData.filter((row) => {
      const haystack = [row.productId?.name || '', row.source || '', row.type || '', row.note || '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [historyData, debouncedSearch])

  const pagedData = useMemo(() => {
    const start = (page - 1) * limit
    return filteredData.slice(start, start + limit)
  }, [filteredData, page])

  const pagination = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(filteredData.length / limit)),
    hasNextPage: page * limit < filteredData.length,
    hasPreviousPage: page > 1,
  }

  const totalIn = filteredData
    .filter((row) => row.type === 'IN')
    .reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const totalOut = filteredData
    .filter((row) => row.type === 'OUT')
    .reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const summary = { total: filteredData.length, totalIn, totalOut, netMovement: totalIn - totalOut }

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    typeFilter !== 'all' ||
    sourceFilter !== 'all' ||
    productFilter !== 'all'

  const sourceOptions: Array<{
    value: 'all' | 'purchase' | 'sale' | 'adjustment' | 'damage'
    label: string
  }> = [
    { value: 'all', label: 'All Sources' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'sale', label: 'Sale' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'damage', label: 'Damage' },
  ]

  const stockColumns = [
    {
      key: 'product',
      header: 'Product',
      width: '220px',
      render: (row: any) => row.productId?.name || '-',
    },
    {
      key: 'type',
      header: 'Type',
      width: '110px',
      render: (row: any) => (
        <Badge colorPalette={row.type === 'IN' ? 'green' : 'red'}>{row.type}</Badge>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      width: '140px',
      render: (row: any) => row.source || '-',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: '120px',
      render: (row: any) => row.quantity,
    },
    {
      key: 'date',
      header: 'Date',
      width: '160px',
      render: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-',
    },
    {
      key: 'note',
      header: 'Note',
      width: '260px',
      render: (row: any) => row.note || '-',
    },
  ]

  const tabBtn = (active: boolean) => ({
    size: 'sm' as const,
    bg: active ? 'gray.900' : 'white',
    color: active ? 'white' : 'gray.600',
    border: '1px solid',
    borderColor: active ? 'gray.900' : 'gray.200',
    borderRadius: '10px',
    px: 4,
  })

  return (
    <>
      <Flex
        bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
        width="100%"
        minH="100%"
        flexDir="column"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        gap={4}
      >
        {/* Tab switcher */}
        <HStack gap={2}>
          <Button {...tabBtn(activeTab === 'history')} onClick={() => setActiveTab('history')}>
            Stock History
          </Button>
          <Button {...tabBtn(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>
            <HStack gap={1.5}>
              <Package size={13} />
              <Text>Current Inventory</Text>
            </HStack>
          </Button>
        </HStack>

        {/* ===== STOCK HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <>
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 4, xl: 6 }} gap={3}>
              {[
                { label: 'Records', value: summary.total, color: 'gray.900' },
                { label: 'Total In', value: summary.totalIn, color: 'green.700' },
                { label: 'Total Out', value: summary.totalOut, color: 'red.700' },
                {
                  label: 'Net Movement',
                  value: summary.netMovement,
                  color: summary.netMovement >= 0 ? 'blue.700' : 'orange.700',
                },
              ].map((card) => (
                <Box
                  key={card.label}
                  bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
                  border="1px solid"
                  borderColor="teal.100"
                  borderRadius="14px"
                  p={2.5}
                  boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
                >
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    {card.label}
                  </Text>
                  <Text mt={1} fontSize="xl" fontWeight="800" color={card.color}>
                    {card.value}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            <Box
              bg="rgba(255,255,255,0.92)"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="16px"
              p={{ base: 3, md: 4 }}
              boxShadow="0 8px 24px rgba(15, 23, 42, 0.05)"
            >
              <VStack align="stretch" gap={3}>
                <HStack gap={2} align="center" flexWrap="wrap" justify="space-between">
                  <HStack gap={2} flexWrap="wrap">
                    <ExpandableSearch
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search product, note, source..."
                      expandedWidth="320px"
                    />
                    <HStack
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="10px"
                      p={1}
                    >
                      {(['all', 'IN', 'OUT'] as const).map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          bg={
                            typeFilter === t
                              ? t === 'IN'
                                ? 'green.600'
                                : t === 'OUT'
                                  ? 'red.600'
                                  : 'gray.900'
                              : 'transparent'
                          }
                          color={typeFilter === t ? 'white' : 'gray.700'}
                          onClick={() => setTypeFilter(t)}
                        >
                          {t === 'all' ? 'All Types' : t}
                        </Button>
                      ))}
                    </HStack>
                  </HStack>
                </HStack>

                <HStack gap={2} flexWrap="wrap">
                  <select
                    style={{
                      height: '38px',
                      minWidth: '180px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: 'white',
                    }}
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as any)}
                  >
                    {sourceOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <select
                    style={{
                      height: '38px',
                      minWidth: '220px',
                      maxWidth: '320px',
                      padding: '0 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      background: 'white',
                    }}
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                  >
                    <option value="all">All Products</option>
                    {allProducts.map((p: any) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    h="38px"
                    px={3}
                    bg="white"
                    color="gray.800"
                    border="1px solid"
                    borderColor="gray.200"
                    onClick={() => {
                      setSearch('')
                      setTypeFilter('all')
                      setSourceFilter('all')
                      setProductFilter('all')
                    }}
                    disabled={!hasActiveFilters}
                  >
                    Clear Filters
                  </Button>
                </HStack>
              </VStack>
            </Box>

            <Box
              bg="rgba(255,255,255,0.86)"
              rounded="2xl"
              shadow="lightGray"
              border="1px solid"
              borderColor="whiteAlpha.800"
              p={{ base: 2, md: 4 }}
            >
              <CommonTable
                columns={stockColumns}
                data={pagedData}
                isLoading={isLoading}
                rowKey={(row) => row._id}
                emptyMessage={
                  debouncedSearch
                    ? 'No stock movements match your search.'
                    : 'No stock history found.'
                }
              />
            </Box>

            <VStack
              justify="center"
              align="center"
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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.600">
                Showing {pagedData.length} of {filteredData.length} stock movements
              </Text>
            </VStack>
          </>
        )}

        {/* ===== CURRENT INVENTORY TAB ===== */}
        {activeTab === 'inventory' && (
          <>
            <HStack gap={3} flexWrap="wrap">
              <Box position="relative" flex="1" minW="200px" maxW="360px">
                <Input
                  pl={8}
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  placeholder="Search products..."
                  bg="white"
                  borderColor="gray.200"
                  size="sm"
                />
              </Box>
            </HStack>

            <Box
              bg="white"
              borderRadius="20px"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
              boxShadow="0 2px 12px rgba(0,0,0,0.04)"
            >
              <Box overflowX="auto">
                <Grid
                  templateColumns="2fr 80px 80px 90px 110px 1fr"
                  px={4}
                  py={2.5}
                  bg="gray.50"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  minW="700px"
                >
                  {['Product', 'Unit', 'Stock', 'Min Stock', 'Sell Price', 'Variants'].map((h) => (
                    <Text
                      key={h}
                      fontSize="xs"
                      fontWeight="700"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.06em"
                    >
                      {h}
                    </Text>
                  ))}
                </Grid>

                {productsLoading ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.400">Loading...</Text>
                  </Box>
                ) : inventoryProducts.length === 0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.400">No products found</Text>
                  </Box>
                ) : (
                  <VStack gap={0} align="stretch" minW="700px">
                    {inventoryProducts.map((p: any) => {
                      const isLow = p.minimumStock > 0 && p.stock <= p.minimumStock
                      const isOut = p.stock === 0
                      return (
                        <Grid
                          key={p._id}
                          templateColumns="2fr 80px 80px 90px 110px 1fr"
                          px={4}
                          py={3}
                          borderBottom="1px solid"
                          borderColor="gray.50"
                          alignItems="center"
                          bg={isOut ? 'red.50' : isLow ? 'orange.50' : 'white'}
                        >
                          <HStack gap={2}>
                            <Text fontSize="sm" fontWeight="600" color="gray.900">
                              {p.name}
                            </Text>
                            {isOut && (
                              <Badge colorPalette="red" borderRadius="full" fontSize="xs">
                                Out of Stock
                              </Badge>
                            )}
                            {isLow && !isOut && (
                              <Badge colorPalette="orange" borderRadius="full" fontSize="xs">
                                Low
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {p.unit || 'pcs'}
                          </Text>
                          <HStack gap={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="700"
                              color={isOut ? 'red.600' : isLow ? 'orange.600' : 'gray.900'}
                            >
                              {p.stock}
                            </Text>
                            {isLow && (
                              <AlertTriangle size={11} color={isOut ? '#dc2626' : '#ea580c'} />
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {p.minimumStock || '—'}
                          </Text>
                          <Text fontSize="sm" color="gray.700">
                            {Number(p.sellingPrice || 0).toFixed(2)}
                          </Text>
                          <HStack gap={1} flexWrap="wrap">
                            {p.size && (
                              <Badge colorPalette="purple" borderRadius="full" fontSize="xs">
                                {p.size}
                              </Badge>
                            )}
                            {p.color && (
                              <Badge colorPalette="blue" borderRadius="full" fontSize="xs">
                                {p.color}
                              </Badge>
                            )}
                            {p.material && (
                              <Badge colorPalette="teal" borderRadius="full" fontSize="xs">
                                {p.material}
                              </Badge>
                            )}
                            {!p.size && !p.color && !p.material && (
                              <Text fontSize="xs" color="gray.400">
                                —
                              </Text>
                            )}
                          </HStack>
                        </Grid>
                      )
                    })}
                  </VStack>
                )}
              </Box>
            </Box>

            {invPagination && invPagination.totalPages > 1 && (
              <VStack
                justify="center"
                align="center"
                p={3}
                bg="rgba(255,255,255,0.86)"
                borderRadius="18px"
                border="1px solid"
                borderColor="whiteAlpha.800"
                gap={2}
              >
                <HStack gap={2} justify="center">
                  <Button
                    onClick={() => setInvPage((p) => p - 1)}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    disabled={!invPagination.hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    Page {invPagination.currentPage} of {invPagination.totalPages}
                  </Text>
                  <Button
                    onClick={() => setInvPage((p) => p + 1)}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    disabled={!invPagination.hasNextPage}
                  >
                    Next
                  </Button>
                </HStack>
              </VStack>
            )}
          </>
        )}
      </Flex>
    </>
  )
}

export default Stocks
