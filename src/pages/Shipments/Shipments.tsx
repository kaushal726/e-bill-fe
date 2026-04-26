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

/* ------------------ Fake Shipment Data ------------------ */

type Shipment = {
  id: string
  orderId: string
  carrier: string
  trackingNumber: string
  shippedDate: string
  deliveryDate: string
  cost: number
  status: 'Pending' | 'In Transit' | 'Delivered'
}

const FAKE_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    orderId: 'ORD-1023',
    carrier: 'Delhivery',
    trackingNumber: 'DLV839201',
    shippedDate: '2026-01-08',
    deliveryDate: '2026-01-11',
    cost: 120,
    status: 'Delivered',
  },
  {
    id: '2',
    orderId: 'ORD-1027',
    carrier: 'Blue Dart',
    trackingNumber: 'BD774201',
    shippedDate: '2026-01-10',
    deliveryDate: '—',
    cost: 180,
    status: 'In Transit',
  },
  {
    id: '3',
    orderId: 'ORD-1031',
    carrier: 'India Post',
    trackingNumber: 'IP553910',
    shippedDate: '—',
    deliveryDate: '—',
    cost: 90,
    status: 'Pending',
  },
]

/* ------------------ Component ------------------ */

const Shipments = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Shipments' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_SHIPMENTS]

    if (!filter.includes('all')) {
      rows = rows.filter((s) =>
        filter.includes(
          s.status === 'Delivered'
            ? 'delivered'
            : s.status === 'In Transit'
              ? 'transit'
              : 'pending',
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

  const shipmentColumns = [
    {
      key: 'orderId',
      header: 'Order ID',
      render: (s: Shipment) => s.orderId,
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (s: Shipment) => s.carrier,
    },
    {
      key: 'trackingNumber',
      header: 'Tracking No.',
      render: (s: Shipment) => s.trackingNumber,
    },
    {
      key: 'shippedDate',
      header: 'Shipped Date',
      render: (s: Shipment) => s.shippedDate,
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      render: (s: Shipment) => s.deliveryDate,
    },
    {
      key: 'cost',
      header: 'Shipping Cost',
      render: (s: Shipment) => `₹${s.cost}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: Shipment) => (
        <Text
          fontWeight="medium"
          color={
            s.status === 'Delivered'
              ? 'green.600'
              : s.status === 'In Transit'
                ? 'blue.600'
                : 'orange.500'
          }
        >
          {s.status}
        </Text>
      ),
    },
  ]

  const shipmentFilters = [
    { label: 'All shipments', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In transit', value: 'transit' },
    { label: 'Delivered', value: 'delivered' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Shipment Filters"
          subtitle="Filter shipments by fulfillment status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Shipment Status',
              description: 'Pending, in transit, or delivered shipments.',
              content: (
                <FilterSelect
                  options={shipmentFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All shipments"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton aria-label="Add Shipment" colorPalette="blue" variant="solid" px={3} h="32px">
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
        <CommonTable columns={shipmentColumns} data={data} isLoading={false} rowKey={(s) => s.id} />
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

export default Shipments
