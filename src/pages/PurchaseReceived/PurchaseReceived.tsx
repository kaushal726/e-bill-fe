import { Flex, HStack, Text, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { FilterSelect } from '@/components/common/FilterSelect'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import type { SortKey } from '@/components/popovers/TableActionsPopover'

/* ------------------ Fake Purchase Received Data ------------------ */

type PurchaseReceivedItem = {
  id: string
  grnNumber: string
  poNumber: string
  supplier: string
  receivedDate: string
  receivedItems: number
  totalCost: number
  status: 'Partial' | 'Completed'
}

const FAKE_PURCHASE_RECEIVED: PurchaseReceivedItem[] = [
  {
    id: '1',
    grnNumber: 'GRN-2026-001',
    poNumber: 'PO-2026-001',
    supplier: 'ABC Packaging Ltd',
    receivedDate: '2026-01-09',
    receivedItems: 480,
    totalCost: 5950,
    status: 'Completed',
  },
  {
    id: '2',
    grnNumber: 'GRN-2026-002',
    poNumber: 'PO-2026-002',
    supplier: 'XYZ Textiles',
    receivedDate: '2026-01-14',
    receivedItems: 120,
    totalCost: 10800,
    status: 'Partial',
  },
  {
    id: '3',
    grnNumber: 'GRN-2026-003',
    poNumber: 'PO-2026-003',
    supplier: 'National Plastics',
    receivedDate: '—',
    receivedItems: 0,
    totalCost: 0,
    status: 'Partial',
  },
]

/* ------------------ Component ------------------ */

const PurchaseReceived = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Purchase Received' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_PURCHASE_RECEIVED]

    if (!filter.includes('all')) {
      rows = rows.filter((r) => filter.includes(r.status === 'Completed' ? 'completed' : 'partial'))
    }

    if (sortBy && sortOrder) {
      rows.sort((a: any, b: any) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return rows
  }, [filter, sortBy, sortOrder])

  /* ------------------ Columns ------------------ */

  const purchaseReceivedColumns = [
    {
      key: 'grnNumber',
      header: 'GRN Number',
      render: (r: PurchaseReceivedItem) => r.grnNumber,
    },
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (r: PurchaseReceivedItem) => r.poNumber,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (r: PurchaseReceivedItem) => r.supplier,
    },
    {
      key: 'receivedDate',
      header: 'Received Date',
      render: (r: PurchaseReceivedItem) => r.receivedDate,
    },
    {
      key: 'receivedItems',
      header: 'Items Received',
      render: (r: PurchaseReceivedItem) => r.receivedItems,
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (r: PurchaseReceivedItem) => `₹${r.totalCost}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: PurchaseReceivedItem) => (
        <Text fontWeight="medium" color={r.status === 'Completed' ? 'green.600' : 'orange.500'}>
          {r.status}
        </Text>
      ),
    },
  ]

  const purchaseReceivedFilters = [
    { label: 'All received', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Partial', value: 'partial' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Purchase Received Filters"
          subtitle="Filter GRN/received records by completion status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Receive Status',
              description: 'Completed or partial received entries.',
              content: (
                <FilterSelect
                  options={purchaseReceivedFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All received"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton
            aria-label="Add Purchase Received"
            colorPalette="blue"
            variant="solid"
            px={3}
            h="32px"
          >
            <HStack gap={1}>
              <Plus size={18} />
              <Text fontSize="sm">New</Text>
            </HStack>
          </IconButton>

          <TableActionsPopover
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(key, order) => {
              setPage(1)
              setSortBy(key)
              setSortOrder(order)
            }}
            onRefresh={() => {
              /* fake refresh */
            }}
            onImport={function (): void {
              throw new Error('Function not implemented.')
            }}
            onExport={function (): void {
              throw new Error('Function not implemented.')
            }}
          />
        </HStack>
      </Flex>

      {/* Table */}
      <Box bg="white" mt={6} rounded="lg" p={4}>
        <CommonTable
          columns={purchaseReceivedColumns}
          data={data}
          isLoading={false}
          rowKey={(r) => r.id}
        />
      </Box>

      {/* Pagination */}
      <Flex justify="center" mt={4} gap={2}>
        <Button disabled>Previous</Button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button key={i} bg="purple.100">
            {i + 1}
          </Button>
        ))}
        <Button disabled>Next</Button>
      </Flex>
    </Flex>
  )
}

export default PurchaseReceived
