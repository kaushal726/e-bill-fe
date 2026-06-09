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

// Professional slate + indigo palette
const C = {
  border: '#e2e8f0', // slate-200
  borderSoft: '#eef2f6', // slate-100-ish
  headerFrom: '#1e293b', // slate-800
  headerTo: '#0f172a', // slate-900
  headerText: '#cbd5e1', // slate-300
  rowAlt: '#f8fafc', // slate-50
  rowHover: '#eef2ff', // indigo-50
  text: '#475569', // slate-600
  textStrong: '#0f172a', // slate-900
  accent: '#4f46e5', // indigo-600
  accentSoft: '#818cf8', // indigo-400
  accentBorder: '#c7d2fe', // indigo-200
  scrollTrack: '#f1f5f9', // slate-100
  scrollThumb: '#cbd5e1', // slate-300
  scrollThumbHover: '#94a3b8', // slate-400
}

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
      borderColor={C.border}
      borderRadius="14px"
      bg="white"
      boxShadow="0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px rgba(15, 23, 42, 0.06)"
      css={{
        scrollbarWidth: 'thin',
        msOverflowStyle: 'auto',
        '&::-webkit-scrollbar': { height: '8px', width: '8px' },
        '&::-webkit-scrollbar-track': { background: C.scrollTrack },
        '&::-webkit-scrollbar-thumb': {
          background: C.scrollThumb,
          borderRadius: '999px',
          border: `2px solid ${C.scrollTrack}`,
        },
        '&::-webkit-scrollbar-thumb:hover': { background: C.scrollThumbHover },
        '&::-webkit-scrollbar-corner': { background: C.scrollTrack },
      }}
    >
      <Table.Root size="sm" stickyHeader variant="line" tableLayout="fixed">
        <Table.Header
          position="sticky"
          top={0}
          zIndex={1}
          css={{
            '& tr': { boxShadow: `inset 0 -2px 0 0 ${C.accent}` },
          }}
        >
          <Table.Row bg={`linear-gradient(180deg, ${C.headerFrom} 0%, ${C.headerTo} 100%)`}>
            {columns.map((c) => (
              <Table.ColumnHeader
                key={c.key}
                fontWeight="600"
                color={C.headerText}
                fontSize="11px"
                letterSpacing="0.05em"
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
                fontWeight="600"
                color={C.headerText}
                fontSize="11px"
                letterSpacing="0.05em"
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
              <Table.Row key={i} bg={i % 2 === 0 ? 'white' : C.rowAlt}>
                {columns.map((c, ci) => (
                  <Table.Cell
                    key={c.key}
                    width={c.width ?? DEFAULT_COLUMN_WIDTH}
                    maxW={c.width ?? DEFAULT_COLUMN_WIDTH}
                    px={4}
                    py={3.5}
                  >
                    <Skeleton
                      height="14px"
                      width={ci === 0 ? '70%' : `${60 + ((i + ci) % 4) * 10}%`}
                      borderRadius="6px"
                      variant="shine"
                      css={{
                        '--start-color': 'var(--chakra-colors-gray-100)',
                        '--end-color': 'var(--chakra-colors-gray-200)',
                      }}
                    />
                  </Table.Cell>
                ))}
                {actions && (
                  <Table.Cell width={ACTION_COLUMN_WIDTH} px={2} py={2}>
                    <HStack gap={1} justify="center">
                      {[...Array(2)].map((_, ai) => (
                        <Skeleton
                          key={ai}
                          height="26px"
                          width="34px"
                          borderRadius="8px"
                          variant="shine"
                          css={{
                            '--start-color': 'var(--chakra-colors-gray-100)',
                            '--end-color': 'var(--chakra-colors-gray-200)',
                          }}
                        />
                      ))}
                    </HStack>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        ) : (
          <Table.Body>
            {hasRows ? (
              data.map((row, rowIndex) => (
                <Table.Row
                  key={rowKey(row)}
                  bg={rowIndex % 2 === 0 ? 'white' : C.rowAlt}
                  borderBottom="1px solid"
                  borderColor={C.borderSoft}
                  transition="background 0.15s ease, box-shadow 0.15s ease"
                  css={{
                    '&:hover': {
                      background: C.rowHover,
                      boxShadow: `inset 3px 0 0 0 ${C.accent}`,
                    },
                    '&:hover td': { color: C.textStrong },
                    '&:hover td:first-of-type': { color: C.accent },
                  }}
                >
                  {columns.map((c, ci) => (
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
                      py={3.5}
                      fontSize="sm"
                      fontWeight={ci === 0 ? '600' : '400'}
                      color={ci === 0 ? C.textStrong : C.text}
                      transition="color 0.15s ease"
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
                            minW="32px"
                            h="32px"
                            p={0}
                            bg={C.rowAlt}
                            color={action.color || C.text}
                            border="1px solid"
                            borderColor={C.border}
                            borderRadius="9px"
                            aria-label={action.label}
                            title={action.label}
                            transition="all 0.15s ease"
                            css={{
                              '& svg': { width: '15px', height: '15px' },
                              '&:hover': {
                                background: '#ffffff',
                                borderColor: C.accentBorder,
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.18)',
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: 'none',
                              },
                            }}
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
                  <VStack gap={3}>
                    <Box
                      w="56px"
                      h="56px"
                      borderRadius="full"
                      bg={`linear-gradient(180deg, ${C.headerFrom} 0%, ${C.headerTo} 100%)`}
                      border="1px solid"
                      borderColor={C.border}
                      display="grid"
                      placeItems="center"
                      color={C.accent}
                    >
                      <Inbox size={24} />
                    </Box>
                    <Text fontSize="sm" color={C.text} fontWeight="600">
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
