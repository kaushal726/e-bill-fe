import { Box, Text, HStack, VStack, Button, Separator } from '@chakra-ui/react'
import { Card } from '../Card'

type Item = {
  name: string
  sku?: string
  qty: number
}

const items: Item[] = [
  { name: 'Sofa', sku: 'sku001', qty: 528 },
  { name: 'Coffee Table', qty: 320 },
  { name: 'Storage Cabinet', qty: 220 },
  { name: 'Queen Size bed', qty: 210 },
  { name: 'Jug', sku: '4.0', qty: 110 },
]

export function TopStockedItems() {
  return (
    <Card>
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="600">Top Stocked Items</Text>
        <Text fontSize="sm" color="gray.500">
          As of:{' '}
          <Text as="span" color="gray.800">
            This Month â–¾
          </Text>
        </Text>
      </HStack>

      <HStack gap={2} mb={4}>
        <Button size="xs" colorPalette="blue">
          By Quantity
        </Button>
        <Button size="xs" variant="subtle">
          By Value
        </Button>
      </HStack>

      <VStack align="stretch" gap={0}>
        {items.map((item, index) => (
          <Box key={item.name}>
            <HStack justify="space-between" align="center" py={3}>
              <HStack gap={3}>
                <Box w="36px" h="36px" bg="gray.100" borderRadius="md" />

                <Box>
                  <Text fontSize="sm" color="blue.600" fontWeight="500">
                    {item.name}
                  </Text>
                  {item.sku && (
                    <Text fontSize="xs" color="gray.500">
                      SKU: {item.sku}
                    </Text>
                  )}
                </Box>
              </HStack>

              <Text fontSize="sm" fontWeight="600">
                {item.qty}
              </Text>
            </HStack>

            {index !== items.length - 1 && <Separator borderColor="gray.200" />}
          </Box>
        ))}
      </VStack>
    </Card>
  )
}
