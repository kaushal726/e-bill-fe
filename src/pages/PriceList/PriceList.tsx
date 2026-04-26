import { Flex, HStack, Text, Heading, Button, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { useProducts } from '@/hooks/useProducts'

function PriceList() {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useProducts()

  const products = data?.products ?? []
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }

  const priceListColumns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p: any) => p.name,
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (p: any) => p.sku,
    },
    {
      key: 'barcode',
      header: 'Barcode',
      render: (p: any) => p.barcode,
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: any) => p.categoryId,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (p: any) => p.supplierId,
    },
    {
      key: 'purchasePrice',
      header: 'Purchase Price',
      render: (p: any) => p.purchasePrice,
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      render: (p: any) => p.sellingPrice,
    },
    {
      key: 'tax',
      header: 'Tax (%)',
      render: (p: any) => p.tax,
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (p: any) => p.unit,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p: any) => p.stock,
    },
    {
      key: 'lowStockAlert',
      header: 'Low Stock Alert',
      render: (p: any) => p.lowStockAlert,
    },
    {
      key: 'maxDiscount',
      header: 'Max Discount',
      render: (p: any) => p.maxDiscount,
    },
    {
      key: 'minDiscount',
      header: 'Min Discount',
      render: (p: any) => p.minDiscount,
    },
  ]

  useEffect(() => {
    dispatch(setHeader({ title: 'Price List' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  return (
    <Flex
      bg="gray.100"
      width="100%"
      minH="100%"
      overflowX="auto"
      flexDir="column"
      pl={{ base: 3, sm: 2, md: 6 }}
      pr={{ base: 3, sm: 2, md: 6 }}
      pt={{ base: 3, sm: 4, md: 1 }}
      mb={3}
    >
      <Flex justify="space-between" align="center" mt={8} w="100%">
        <Heading size="xl" color="gray.800">
          Price List
        </Heading>
      </Flex>

      <Box
        bg="white"
        mt={6}
        rounded="lg"
        shadow="lightGray"
        border="1px solid"
        borderColor="gray.100"
        w="100%"
        p={{ base: 2, md: 4 }}
      >
        <CommonTable
          columns={priceListColumns}
          data={products}
          isLoading={isLoading}
          rowKey={(p) => p._id}
        />
      </Box>

      <Flex
        justify="center"
        align="center"
        borderRadius="lg"
        mt={2}
        mb={2}
        p={2}
        bg="white"
        shadow="lightGray"
        gap={4}
        width="100%"
      >
        <Button
          onClick={() => setPage(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          variant="subtle"
          bg="white"
          rounded="lg"
        >
          <Text color="gray.800">Previous</Text>
        </Button>

        <HStack gap={2}>
          {Array.from({ length: pagination.totalPages }).map((_, index) => {
            const pg = index + 1
            return (
              <Button
                key={pg}
                onClick={() => setPage(pg)}
                rounded="lg"
                bg={pg === pagination.currentPage ? 'purple.100' : 'transparent'}
                color={pg === pagination.currentPage ? 'purple.600' : 'gray.700'}
                _hover={{ bg: 'purple.50' }}
              >
                {pg}
              </Button>
            )
          })}
        </HStack>

        <Button
          onClick={() => setPage(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          variant="subtle"
          bg="white"
          rounded="lg"
        >
          <Text color="gray.800">Next</Text>
        </Button>
      </Flex>
    </Flex>
  )
}

export default PriceList
