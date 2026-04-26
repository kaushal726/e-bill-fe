import { Badge, Box, Button, Drawer, Flex, HStack, Portal, Text, VStack } from '@chakra-ui/react'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export type FilterDrawerSection = {
  key: string
  title: string
  description: string
  content: React.ReactNode
}

type FilterDrawerProps = {
  title: string
  subtitle?: string
  sections: FilterDrawerSection[]
  activeCount?: number
  onClearAll?: () => void
}

export const FilterDrawer = ({
  title,
  subtitle,
  sections,
  activeCount = 0,
  onClearAll,
}: FilterDrawerProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root placement="end" size="md" open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Drawer.Trigger asChild>
        <Button
          h="38px"
          px={3}
          bg="white"
          color="gray.800"
          border="1px solid"
          borderColor="teal.200"
          _hover={{ bg: 'teal.50', borderColor: 'teal.300' }}
        >
          <HStack gap={2}>
            <SlidersHorizontal size={16} />
            <Text fontSize="sm" fontWeight="700">
              Filters
            </Text>
            {activeCount > 0 ? (
              <Badge colorPalette="teal" borderRadius="full" px={2}>
                {activeCount}
              </Badge>
            ) : null}
          </HStack>
        </Button>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="white" border="none" boxShadow="0 20px 44px rgba(15, 23, 42, 0.2)">
            <Drawer.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
              <Drawer.Title>
                <VStack align="start" gap={1}>
                  <Text fontSize="lg" fontWeight="800" color="gray.900">
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text fontSize="sm" color="gray.600">
                      {subtitle}
                    </Text>
                  ) : null}
                </VStack>
              </Drawer.Title>
            </Drawer.Header>

            <Drawer.Body p={4}>
              <VStack align="stretch" gap={3}>
                {sections.map((section) => (
                  <Box
                    key={section.key}
                    p={3}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="14px"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" fontWeight="800" color="gray.900">
                      {section.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" mt={1} mb={3}>
                      {section.description}
                    </Text>
                    {section.content}
                  </Box>
                ))}
              </VStack>
            </Drawer.Body>

            <Drawer.Footer borderTop="1px solid" borderColor="gray.100">
              <Flex w="100%" justify="space-between" align="center" gap={2}>
                <Button
                  variant="subtle"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  onClick={onClearAll}
                  disabled={!onClearAll}
                >
                  Clear All
                </Button>
                <Button
                  bg="teal.700"
                  color="white"
                  _hover={{ bg: 'teal.800' }}
                  onClick={() => setOpen(false)}
                >
                  Done
                </Button>
              </Flex>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
