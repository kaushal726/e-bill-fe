import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'
import { useStockHistory } from '@/hooks/useStockHistory'
import { useProducts } from '@/hooks/useProducts'

const Stocks = () => {
  const dispatch = useDispatch()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [typeFilter, setTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all')
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'purchase' | 'sale' | 'adjustment' | 'damage'
  >('all')
  const [productFilter, setProductFilter] = useState<'all' | string>('all')

  const [page, setPage] = useState(1)
  const limit = 20

  const { data: productData } = useProducts({ page: 1, limit: 50 })
  const { data: historyData = [], isLoading } = useStockHistory({
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    ...(sourceFilter !== 'all' ? { source: sourceFilter } : {}),
    ...(productFilter !== 'all' ? { productId: productFilter } : {}),
  })

  const products = productData?.products ?? []

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Stock History',
        subtitle: 'Track all stock movements and adjust inventory manually when needed',
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

  const summary = {
    total: filteredData.length,
    totalIn,
    totalOut,
    netMovement: totalIn - totalOut,
  }

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
              Records
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.total}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total In
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="green.700">
              {summary.totalIn}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Out
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="red.700">
              {summary.totalOut}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Net Movement
            </Text>
            <Text
              mt={1}
              fontSize="xl"
              fontWeight="800"
              color={summary.netMovement >= 0 ? 'blue.700' : 'orange.700'}
            >
              {summary.netMovement}
            </Text>
          </Box>
        </SimpleGrid>

        <Box
          mt={4}
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
                  <Button
                    size="sm"
                    variant={typeFilter === 'all' ? 'solid' : 'ghost'}
                    bg={typeFilter === 'all' ? 'gray.900' : 'transparent'}
                    color={typeFilter === 'all' ? 'white' : 'gray.700'}
                    _hover={{ bg: typeFilter === 'all' ? 'gray.900' : 'gray.100' }}
                    onClick={() => setTypeFilter('all')}
                  >
                    All Types
                  </Button>
                  <Button
                    size="sm"
                    variant={typeFilter === 'IN' ? 'solid' : 'ghost'}
                    bg={typeFilter === 'IN' ? 'green.600' : 'transparent'}
                    color={typeFilter === 'IN' ? 'white' : 'gray.700'}
                    _hover={{ bg: typeFilter === 'IN' ? 'green.600' : 'gray.100' }}
                    onClick={() => setTypeFilter('IN')}
                  >
                    IN
                  </Button>
                  <Button
                    size="sm"
                    variant={typeFilter === 'OUT' ? 'solid' : 'ghost'}
                    bg={typeFilter === 'OUT' ? 'red.600' : 'transparent'}
                    color={typeFilter === 'OUT' ? 'white' : 'gray.700'}
                    _hover={{ bg: typeFilter === 'OUT' ? 'red.600' : 'gray.100' }}
                    onClick={() => setTypeFilter('OUT')}
                  >
                    OUT
                  </Button>
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
                onChange={(e) =>
                  setSourceFilter(
                    e.target.value as 'all' | 'purchase' | 'sale' | 'adjustment' | 'damage',
                  )
                }
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                {products.map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <Button
                h="38px"
                px={3}
                variant="outline"
                borderColor="gray.300"
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
          mt={6}
          rounded="2xl"
          shadow="lightGray"
          border="1px solid"
          borderColor="whiteAlpha.800"
          w="100%"
          p={{ base: 2, md: 4 }}
        >
          <CommonTable
            columns={stockColumns}
            data={pagedData}
            isLoading={isLoading}
            rowKey={(row) => row._id}
            emptyMessage={
              debouncedSearch ? 'No stock movements match your search.' : 'No stock history found.'
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
            Showing {pagedData.length} of {filteredData.length} stock movements
          </Text>
        </VStack>
      </Flex>
    </>
  )
}

export default Stocks
