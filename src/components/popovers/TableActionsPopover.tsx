import { Button, HStack, Popover, Separator, Text, VStack } from '@chakra-ui/react'
import {
  MoreHorizontal,
  ArrowUp,
  ArrowUpDown,
  Upload,
  Download,
  Settings,
  RotateCcw,
  Columns,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

export type SortOrder = 'asc' | 'desc'

export type SortOption = {
  key: string
  label: string
}

type Props = {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  sortOptions?: SortOption[]
  onSortChange?: (key: string, order: 'asc' | 'desc') => void
  onImport?: () => void
  onExport?: () => void
  onDownloadTemplate?: () => void
  onRefresh?: () => void
  refreshLabel?: string
  refreshIcon?: React.ElementType
  showUtilityActions?: boolean
  showRefreshAction?: boolean
}

export function TableActionsPopover({
  sortBy,
  sortOrder = 'asc',
  sortOptions = [],
  onSortChange,
  onImport,
  onExport,
  onDownloadTemplate,
  onRefresh,
  refreshLabel = 'Refresh List',
  refreshIcon = RotateCcw,
  showUtilityActions = true,
  showRefreshAction = true,
}: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const hasSortOptions = sortOptions.length > 0

  return (
    <Popover.Root positioning={{ placement: 'bottom-end', offset: { mainAxis: 8 } }}>
      <Popover.Trigger asChild>
        <Button
          size="sm"
          px="2"
          bg="teal.700"
          color="white"
          border="1px solid"
          borderColor="teal.700"
          borderRadius="10px"
        >
          <MoreHorizontal size={18} />
        </Button>
      </Popover.Trigger>

      <Popover.Positioner>
        <Popover.Content
          w="260px"
          bg="white"
          borderRadius="14px"
          border="1px solid"
          borderColor="teal.100"
          boxShadow="0 16px 32px rgba(15, 23, 42, 0.15)"
          p="2"
        >
          <VStack align="stretch" gap="1">
            {hasSortOptions ? (
              <Popover.Root
                open={sortOpen}
                onOpenChange={(e) => setSortOpen(e.open)}
                positioning={{ placement: 'left-start', offset: { mainAxis: 8 } }}
              >
                <Popover.Trigger asChild>
                  <HStack
                    px="3"
                    py="2"
                    borderRadius="md"
                    cursor="pointer"
                    bg={sortOpen ? 'teal.50' : 'transparent'}
                    onMouseEnter={() => setSortOpen(true)}
                    onMouseLeave={() => setSortOpen(false)}
                  >
                    <ArrowUpDown size={16} />
                    <Text fontSize="sm">Sort by</Text>
                    <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                  </HStack>
                </Popover.Trigger>

                <Popover.Positioner>
                  <Popover.Content
                    w="220px"
                    bg="white"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="teal.100"
                    boxShadow="0 16px 32px rgba(15, 23, 42, 0.15)"
                    p="2"
                    onMouseEnter={() => setSortOpen(true)}
                    onMouseLeave={() => setSortOpen(false)}
                  >
                    <VStack align="stretch" gap="1">
                      {sortOptions.map((item) => {
                        const active = sortBy === item.key

                        return (
                          <HStack
                            key={item.key}
                            px="3"
                            py="2"
                            borderRadius="md"
                            cursor="pointer"
                            bg={active ? 'teal.700' : 'transparent'}
                            color={active ? 'white' : 'gray.800'}
                            onClick={() => {
                              const nextOrder = active && sortOrder === 'asc' ? 'desc' : 'asc'

                              onSortChange?.(item.key, nextOrder)
                              setSortOpen(false)
                            }}
                          >
                            <Text fontSize="sm">{item.label}</Text>

                            {active &&
                              (sortOrder === 'asc' ? (
                                <ArrowUp size={14} style={{ marginLeft: 'auto' }} />
                              ) : (
                                <ArrowUp
                                  size={14}
                                  style={{
                                    marginLeft: 'auto',
                                    transform: 'rotate(180deg)',
                                  }}
                                />
                              ))}
                          </HStack>
                        )
                      })}
                    </VStack>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            ) : null}

            <Separator my="1" />

            <ActionItem icon={Upload} label="Import" onClick={onImport} />
            <ActionItem icon={Download} label="Export" onClick={onExport} />
            <ActionItem icon={Download} label="Download Template" onClick={onDownloadTemplate} />
            {showUtilityActions ? <ActionItem icon={Settings} label="Preferences" /> : null}
            {showRefreshAction ? (
              <ActionItem icon={refreshIcon} label={refreshLabel} onClick={onRefresh} />
            ) : null}
            {showUtilityActions ? <ActionItem icon={Columns} label="Reset Column Width" /> : null}
          </VStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
}) {
  return (
    <HStack px="3" py="2" borderRadius="md" cursor="pointer" color="gray.900" onClick={onClick}>
      <Icon size={16} />
      <Text fontSize="sm">{label}</Text>
    </HStack>
  )
}
