import { Box, Text, HStack, VStack, Separator, Button, Portal } from '@chakra-ui/react'
import { Popover } from '@chakra-ui/react'

type Notification = {
  id: string
  title: string
  description?: string
  time: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New order received',
    description: 'Order #1245 has been placed',
    time: '2 min ago',
  },
  {
    id: '2',
    title: 'Payment successful',
    description: '1,250 credited to your account',
    time: '1 hour ago',
  },
  {
    id: '3',
    title: 'Low stock alert',
    description: 'Printed T-Shirt stock is low',
    time: 'Yesterday',
  },
  {
    id: '4',
    title: 'Low stock alert',
    description: 'Printed T-Shirt stock is low',
    time: 'Yesterday',
  },
  {
    id: '5',
    title: 'Low stock alert',
    description: 'Printed T-Shirt stock is low',
    time: 'Yesterday',
  },
]

export const NotificationsPopover = ({ trigger }: { trigger: React.ReactNode }) => {
  return (
    <Popover.Root positioning={{ placement: 'bottom-end', strategy: 'fixed' }}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="300px"
            maxH="320px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            shadow="lightGray"
            overflow="hidden"
          >
            {/* Body */}
            <Box
              px={4}
              py={3}
              maxH="250px"
              overflowY="auto"
              css={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              <VStack align="stretch" gap={1}>
                {mockNotifications.map((n) => (
                  <Box key={n.id} px={2} py={2} borderRadius="md" cursor="pointer">
                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                      {n.title}
                    </Text>

                    {n.description && (
                      <Text fontSize="xs" color="gray.600">
                        {n.description}
                      </Text>
                    )}

                    <Text fontSize="xs" color="gray.400" mt={0.5}>
                      {n.time}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Separator borderColor="gray.300" />

            {/* Footer */}
            <HStack p={2} gap={2}>
              <Button
                flex={1}
                h="32px"
                fontSize="sm"
                fontWeight="600"
                bg="gray.100"
                color="gray.700"
                borderRadius="md"
                _active={{ bg: 'gray.300' }}
              >
                Clear all
              </Button>

              <Button
                flex={1}
                h="32px"
                fontSize="sm"
                fontWeight="600"
                bg="blue.600"
                color="white"
                borderRadius="md"
                _active={{ bg: 'blue.800' }}
              >
                View all
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
