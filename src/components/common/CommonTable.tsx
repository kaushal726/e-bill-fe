import { Table, Box, Skeleton, HStack, Button, VStack, Text } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'

type RowAction<T> = {
  label: string
  icon: React.ReactNode
  color?: string
  onClick: (row: T) => void
}

export type TableColumn<T> = {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string
}

type CommonTableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  actions?: RowAction<T>[]
  emptyMessage?: string
}

const DEFAULT_COLUMN_WIDTH = '160px'
const ACTION_COLUMN_WIDTH = '180px'

export function CommonTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  actions,
  emptyMessage = 'No records available.',
}: CommonTableProps<T>) {
  const hasRows = data.length > 0

  return (
    <Box
      w="100%"
      maxW="100%"
      maxH="480px"
      overflow="auto"
      border="1px solid"
      borderColor="teal.100"
      borderRadius="16px"
      bg="rgba(255,255,255,0.98)"
      boxShadow="0 16px 34px rgba(15, 23, 42, 0.08)"
      css={{
        scrollbarWidth: 'thin',
        msOverflowStyle: 'auto',
        '&::-webkit-scrollbar': { height: '8px', width: '8px' },
        '&::-webkit-scrollbar-track': { background: '#ecfeff' },
        '&::-webkit-scrollbar-thumb': { background: '#99f6e4', borderRadius: '999px' },
      }}
    >
      <Table.Root size="sm" stickyHeader variant="line" tableLayout="fixed">
        <Table.Header
          borderBottom="1px solid"
          borderColor="gray.200"
          position="sticky"
          top={0}
          zIndex={1}
        >
          <Table.Row bg="linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 100%)">
            {columns.map((c) => (
              <Table.ColumnHeader
                key={c.key}
                fontWeight="700"
                color="teal.900"
                fontSize="xs"
                letterSpacing="0.06em"
                textTransform="uppercase"
                verticalAlign="middle"
                textAlign="start"
                width={c.width ?? DEFAULT_COLUMN_WIDTH}
                maxW={c.width ?? DEFAULT_COLUMN_WIDTH}
                px={4}
                py={3.5}
              >
                {c.header}
              </Table.ColumnHeader>
            ))}
            {actions && (
              <Table.ColumnHeader
                fontWeight="700"
                color="teal.900"
                fontSize="xs"
                letterSpacing="0.06em"
                textTransform="uppercase"
                verticalAlign="middle"
                textAlign="center"
                width={ACTION_COLUMN_WIDTH}
                px={2}
                py={3.5}
              >
                Actions
              </Table.ColumnHeader>
            )}
          </Table.Row>
        </Table.Header>

        {isLoading ? (
          <Table.Body>
            {[...Array(8)].map((_, i) => (
              <Table.Row key={i} bg={i % 2 === 0 ? 'white' : 'gray.50'}>
                <Table.Cell colSpan={columns.length + (actions ? 1 : 0)} px={4} py={3}>
                  <Box w="100%">
                    <Skeleton
                      height="18px"
                      width="100%"
                      variant="shine"
                      css={{
                        '--start-color': 'var(--chakra-colors-gray-100)',
                        '--end-color': 'var(--chakra-colors-gray-200)',
                      }}
                    />
                  </Box>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        ) : (
          <Table.Body>
            {hasRows ? (
              data.map((row) => (
                <Table.Row
                  key={rowKey(row)}
                  bg="white"
                  borderBottom="1px solid"
                  borderColor="teal.50"
                  _hover={{ bg: 'teal.50' }}
                >
                  {columns.map((c) => (
                    <Table.Cell
                      key={c.key}
                      width={c.width ?? DEFAULT_COLUMN_WIDTH}
                      maxW={c.width ?? DEFAULT_COLUMN_WIDTH}
                      verticalAlign="middle"
                      textAlign="start"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      px={4}
                      py={3}
                      fontSize="sm"
                      color="gray.700"
                    >
                      {c.render?.(row)}
                    </Table.Cell>
                  ))}

                  {actions && (
                    <Table.Cell
                      verticalAlign="middle"
                      textAlign="center"
                      width={ACTION_COLUMN_WIDTH}
                      px={2}
                      py={2}
                    >
                      <HStack gap={1} justify="center" flex="wrap">
                        {actions.map((action, i) => (
                          <Button
                            key={i}
                            onClick={() => action.onClick(row)}
                            size="xs"
                            variant="subtle"
                            bg="teal.50"
                            color={action.color || '#0f766e'}
                            border="1px solid"
                            borderColor="teal.100"
                            borderRadius="10px"
                            _hover={{ bg: 'teal.100', borderColor: 'teal.200' }}
                            aria-label={action.label}
                            title={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))}
                      </HStack>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))
            ) : (
              <Table.Row bg="white">
                <Table.Cell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  textAlign="center"
                  py={12}
                  color="gray.500"
                  fontWeight="500"
                >
                  <VStack gap={2}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg="gray.100"
                      display="grid"
                      placeItems="center"
                      color="gray.500"
                    >
                      <Inbox size={18} />
                    </Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="600">
                      {emptyMessage}
                    </Text>
                  </VStack>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        )}
      </Table.Root>
    </Box>
  )
}
