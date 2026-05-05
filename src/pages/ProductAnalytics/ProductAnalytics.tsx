import {
  Box,
  Flex,
  Grid,
  HStack,
  Input,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useQuery } from '@tanstack/react-query'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'
import { TrendingUp, TrendingDown, AlertTriangle, Package, IndianRupee, Search } from 'lucide-react'

type ProductAnalyticsItem = {
  _id: string
  name: string
  brandName: string
  categoryName: string
  unit: string
  currentStock: number
  minimumStock: number
  purchasePrice: number
  sellingPrice: number
  size: string
  color: string
  material: string
  totalSold: number
  stockValue: number
  revenueEstimate: number
  isLowStock: boolean
}

type AnalyticsSummary = {
  totalProducts: number
  totalStockValue: number
  totalRevenueEstimate: number
  lowStockCount: number
  zeroSalesCount: number
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

function StatCard({
  label,
  value,
  sub,
  color = 'gray',
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon: React.ReactNode
}) {
  const bgMap: Record<string, string> = {
    teal: 'linear-gradient(135deg,#f0fdfa 0%,#ffffff 100%)',
    orange: 'linear-gradient(135deg,#fff7ed 0%,#ffffff 100%)',
    red: 'linear-gradient(135deg,#fef2f2 0%,#ffffff 100%)',
    blue: 'linear-gradient(135deg,#eff6ff 0%,#ffffff 100%)',
    gray: 'linear-gradient(135deg,#f9fafb 0%,#ffffff 100%)',
  }
  const borderMap: Record<string, string> = {
    teal: 'teal.100',
    orange: 'orange.100',
    red: 'red.100',
    blue: 'blue.100',
    gray: 'gray.100',
  }
  const iconBgMap: Record<string, string> = {
    teal: 'teal.50',
    orange: 'orange.50',
    red: 'red.50',
    blue: 'blue.50',
    gray: 'gray.50',
  }

  return (
    <Box
      p={5}
      borderRadius="20px"
      bg={bgMap[color] ?? bgMap.gray}
      border="1px solid"
      borderColor={borderMap[color] ?? 'gray.100'}
      boxShadow="0 2px 8px rgba(0,0,0,0.04)"
    >
      <HStack justify="space-between" mb={3}>
        <Box p={2} borderRadius="10px" bg={iconBgMap[color] ?? 'gray.50'}>
          {icon}
        </Box>
      </HStack>
      <Text fontSize="2xl" fontWeight="800" color="gray.900">
        {value}
      </Text>
      <Text fontSize="sm" fontWeight="600" color="gray.700" mt={0.5}>
        {label}
      </Text>
      {sub && (
        <Text fontSize="xs" color="gray.400" mt={0.5}>
          {sub}
        </Text>
      )}
    </Box>
  )
}

export default function ProductAnalytics() {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'top' | 'slow' | 'low'>('all')

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Product Analytics',
        subtitle: 'Understand what sells, what sits, and what needs restocking',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const { data, isLoading } = useQuery<{
    products: ProductAnalyticsItem[]
    summary: AnalyticsSummary
  }>({
    queryKey: ['productAnalytics'],
    queryFn: () =>
      API.get(API_ENDPOINTS.PRODUCTS.ANALYTICS).then((res) => res.data?.data ?? res.data),
    staleTime: 60 * 1000,
  })

  const products = data?.products ?? []
  const summary = data?.summary

  const filtered = useMemo(() => {
    let list = products
    if (search.trim()) {
      const kw = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.brandName.toLowerCase().includes(kw) ||
          p.categoryName.toLowerCase().includes(kw),
      )
    }
    if (tab === 'top') return [...list].sort((a, b) => b.totalSold - a.totalSold).slice(0, 20)
    if (tab === 'slow') return [...list].sort((a, b) => a.totalSold - b.totalSold).slice(0, 20)
    if (tab === 'low') return list.filter((p) => p.isLowStock)
    return list
  }, [products, search, tab])

  const tabStyle = (active: boolean) => ({
    px: 4,
    py: 1.5,
    borderRadius: '10px',
    fontSize: 'sm',
    fontWeight: '700',
    cursor: 'pointer',
    bg: active ? 'gray.900' : 'white',
    color: active ? 'white' : 'gray.600',
    border: '1px solid',
    borderColor: active ? 'gray.900' : 'gray.200',
  })

  return (
    <Box
      minH="100%"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      bg="linear-gradient(180deg, #fffdf8 0%, #f8fafc 46%, #f0fdfa 100%)"
    >
      <VStack align="stretch" gap={5} maxW="1280px" mx="auto">
        {/* Summary cards */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 2, md: 5 }} gap={4}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height="120px" borderRadius="20px" />
            ))}
          </SimpleGrid>
        ) : summary ? (
          <SimpleGrid columns={{ base: 2, md: 5 }} gap={4}>
            <StatCard
              label="Total Products"
              value={summary.totalProducts}
              color="blue"
              icon={<Package size={18} color="#2563eb" />}
            />
            <StatCard
              label="Stock Value"
              value={`${fmt(summary.totalStockValue)}`}
              sub="purchase price × stock"
              color="teal"
              icon={<IndianRupee size={18} color="#0d9488" />}
            />
            <StatCard
              label="Revenue Estimate"
              value={`${fmt(summary.totalRevenueEstimate)}`}
              sub="selling price × sold"
              color="orange"
              icon={<TrendingUp size={18} color="#ea580c" />}
            />
            <StatCard
              label="Low Stock"
              value={summary.lowStockCount}
              sub="below minimum"
              color="red"
              icon={<AlertTriangle size={18} color="#dc2626" />}
            />
            <StatCard
              label="No Sales Yet"
              value={summary.zeroSalesCount}
              sub="never sold"
              color="gray"
              icon={<TrendingDown size={18} color="#6b7280" />}
            />
          </SimpleGrid>
        ) : null}

        {/* Filters */}
        <Flex gap={3} align="center" wrap="wrap">
          <Box position="relative" flex="1" minW="200px" maxW="360px">
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
            >
              <Search size={14} color="#9ca3af" />
            </Box>
            <Input
              pl={8}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              bg="white"
              borderColor="gray.200"
              size="sm"
            />
          </Box>
          <HStack gap={2} wrap="wrap">
            <Box as="button" {...tabStyle(tab === 'all')} onClick={() => setTab('all')}>
              All
            </Box>
            <Box as="button" {...tabStyle(tab === 'top')} onClick={() => setTab('top')}>
              Top Selling
            </Box>
            <Box as="button" {...tabStyle(tab === 'slow')} onClick={() => setTab('slow')}>
              Slow Moving
            </Box>
            <Box as="button" {...tabStyle(tab === 'low')} onClick={() => setTab('low')}>
              Low Stock
              {summary?.lowStockCount ? (
                <Badge ml={1.5} colorPalette="red" borderRadius="full" fontSize="xs">
                  {summary.lowStockCount}
                </Badge>
              ) : null}
            </Box>
          </HStack>
        </Flex>

        {/* Product table */}
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
              as="div"
              templateColumns="2fr 1fr 1fr 80px 80px 90px 90px 80px"
              px={4}
              py={2.5}
              bg="gray.50"
              borderBottom="1px solid"
              borderColor="gray.100"
              minW="860px"
            >
              {[
                'Product',
                'Category',
                'Brand',
                'Stock',
                'Min Stock',
                'Sold',
                'Revenue',
                'Value',
              ].map((h) => (
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

            {isLoading ? (
              <VStack gap={0} minW="860px">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Box
                    key={i}
                    px={4}
                    py={3}
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    w="full"
                  >
                    <Skeleton height="18px" />
                  </Box>
                ))}
              </VStack>
            ) : filtered.length === 0 ? (
              <Box p={10} textAlign="center">
                <Text color="gray.400">No products found</Text>
              </Box>
            ) : (
              <VStack gap={0} align="stretch" minW="860px">
                {filtered.map((p) => (
                  <Grid
                    key={p._id}
                    templateColumns="2fr 1fr 1fr 80px 80px 90px 90px 80px"
                    px={4}
                    py={3}
                    borderBottom="1px solid"
                    borderColor="gray.50"
                    alignItems="center"
                  >
                    <VStack align="start" gap={0.5}>
                      <Text fontSize="sm" fontWeight="600" color="gray.900">
                        {p.name}
                      </Text>
                      <HStack gap={1.5} flexWrap="wrap">
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
                          <Badge colorPalette="orange" borderRadius="full" fontSize="xs">
                            {p.material}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                    <Text fontSize="sm" color="gray.600">
                      {p.categoryName || '—'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {p.brandName || '—'}
                    </Text>
                    <HStack gap={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color={
                          p.isLowStock
                            ? 'red.600'
                            : p.currentStock === 0
                              ? 'orange.500'
                              : 'gray.900'
                        }
                      >
                        {p.currentStock}
                      </Text>
                      {p.isLowStock && <AlertTriangle size={11} color="#dc2626" />}
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {p.minimumStock}
                    </Text>
                    <HStack gap={1}>
                      {p.totalSold > 0 ? (
                        <TrendingUp size={12} color="#16a34a" />
                      ) : (
                        <TrendingDown size={12} color="#9ca3af" />
                      )}
                      <Text
                        fontSize="sm"
                        fontWeight="700"
                        color={p.totalSold > 0 ? 'green.700' : 'gray.400'}
                      >
                        {p.totalSold}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      {fmt(p.revenueEstimate)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {fmt(p.stockValue)}
                    </Text>
                  </Grid>
                ))}
              </VStack>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
