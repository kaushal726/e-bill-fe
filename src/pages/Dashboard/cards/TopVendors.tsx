import { Box, HStack, Text, Button, VStack } from '@chakra-ui/react'
import { Card } from '../Card'

type Vendor = {
  name: string
  percent: number
  color: string
}

const vendors: Vendor[] = [
  { name: 'Emily J...', percent: 28, color: '#3B82F6' },
  { name: 'David Williams Vendor', percent: 25, color: '#60A5FA' },
  { name: 'Michael Davis Vendor', percent: 20, color: '#93C5FD' },
  { name: 'Zoe Turner Vendor', percent: 15, color: '#BFDBFE' },
  { name: 'John Smith Vendor', percent: 12, color: '#DBEAFE' },
]

export function TopVendors() {
  return (
    <Card>
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="600">Top Vendors</Text>
        <Text fontSize="sm" color="gray.500">
          This Month â–¾
        </Text>
      </HStack>

      <HStack gap={2} mb={4}>
        <Button size="xs" colorPalette="blue">
          By Quantity
        </Button>
        <Button size="xs" bg="white" color="gray.700" border="1px solid" borderColor="gray.200">
          By Value
        </Button>
      </HStack>

      <Box borderRadius="md" overflow="hidden" h="260px">
        <HStack h="100%" gap={0}>
          <Box w="32%" bg={vendors[0].color} p={3} color="white">
            <Text fontSize="sm" fontWeight="600">
              {vendors[0].name}
            </Text>
            <Text fontSize="sm">{vendors[0].percent.toFixed(1)}%</Text>
          </Box>

          <VStack h="100%" gap={0} flex="1">
            {vendors.slice(1).map((vendor) => (
              <Box key={vendor.name} bg={vendor.color} w="100%" flex={`${vendor.percent}`} p={3}>
                <Text fontSize="sm" fontWeight="600">
                  {vendor.name}
                </Text>
                <Text fontSize="sm">{vendor.percent.toFixed(1)}%</Text>
              </Box>
            ))}
          </VStack>
        </HStack>
      </Box>
    </Card>
  )
}
