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

/* ------------------ Fake Purchase Order Data ------------------ */

type PurchaseOrder = {
  id: string
  poNumber: string
  supplier: string
  orderDate: string
  expectedDate: string
  totalItems: number
  totalCost: number
  status: 'Draft' | 'Ordered' | 'Received'
}

const FAKE_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2026-001',
    supplier: 'ABC Packaging Ltd',
    orderDate: '2026-01-03',
    expectedDate: '2026-01-08',
    totalItems: 500,
    totalCost: 6200,
    status: 'Received',
  },
  {
    id: '2',
    poNumber: 'PO-2026-002',
    supplier: 'XYZ Textiles',
    orderDate: '2026-01-09',
    expectedDate: '2026-01-15',
    totalItems: 200,
    totalCost: 18400,
    status: 'Ordered',
  },
  {
    id: '3',
    poNumber: 'PO-2026-003',
    supplier: 'National Plastics',
    orderDate: '2026-01-12',
    expectedDate: '—',
    totalItems: 1000,
    totalCost: 9000,
    status: 'Draft',
  },
]

/* ------------------ Component ------------------ */

const PurchaseOrders = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Purchase Orders' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_PURCHASE_ORDERS]

    if (!filter.includes('all')) {
      rows = rows.filter((po) =>
        filter.includes(
          po.status === 'Received' ? 'received' : po.status === 'Ordered' ? 'ordered' : 'draft',
        ),
      )
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

  const purchaseOrderColumns = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (po: PurchaseOrder) => po.poNumber,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (po: PurchaseOrder) => po.supplier,
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (po: PurchaseOrder) => po.orderDate,
    },
    {
      key: 'expectedDate',
      header: 'Expected Delivery',
      render: (po: PurchaseOrder) => po.expectedDate,
    },
    {
      key: 'totalItems',
      header: 'Total Items',
      render: (po: PurchaseOrder) => po.totalItems,
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (po: PurchaseOrder) => `${po.totalCost}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (po: PurchaseOrder) => (
        <Text
          fontWeight="medium"
          color={
            po.status === 'Received'
              ? 'green.600'
              : po.status === 'Ordered'
                ? 'blue.600'
                : 'orange.500'
          }
        >
          {po.status}
        </Text>
      ),
    },
  ]

  const purchaseOrderFilters = [
    { label: 'All orders', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Ordered', value: 'ordered' },
    { label: 'Received', value: 'received' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Purchase Order Filters"
          subtitle="Filter purchase orders by lifecycle status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Order Status',
              description: 'Draft, ordered, or received purchase orders.',
              content: (
                <FilterSelect
                  options={purchaseOrderFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All purchase orders"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton
            aria-label="Add Purchase Order"
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
          columns={purchaseOrderColumns}
          data={data}
          isLoading={false}
          rowKey={(po) => po.id}
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

export default PurchaseOrders
