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

/* ------------------ Fake Credit Data ------------------ */

type Credit = {
  id: string
  creditNumber: string
  supplier: string
  reference: string
  creditDate: string
  amount: number
  appliedAmount: number
  status: 'Open' | 'Partially Applied' | 'Applied'
}

const FAKE_CREDITS: Credit[] = [
  {
    id: '1',
    creditNumber: 'CR-2026-001',
    supplier: 'ABC Packaging Ltd',
    reference: 'Damaged boxes return',
    creditDate: '2026-01-12',
    amount: 1200,
    appliedAmount: 1200,
    status: 'Applied',
  },
  {
    id: '2',
    creditNumber: 'CR-2026-002',
    supplier: 'XYZ Textiles',
    reference: 'Size mismatch',
    creditDate: '2026-01-18',
    amount: 3000,
    appliedAmount: 1500,
    status: 'Partially Applied',
  },
  {
    id: '3',
    creditNumber: 'CR-2026-003',
    supplier: 'National Plastics',
    reference: 'Order cancellation',
    creditDate: '2026-01-22',
    amount: 5000,
    appliedAmount: 0,
    status: 'Open',
  },
]

/* ------------------ Component ------------------ */

const Credits = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Credits' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_CREDITS]

    if (!filter.includes('all')) {
      rows = rows.filter((c) =>
        filter.includes(
          c.status === 'Applied'
            ? 'applied'
            : c.status === 'Partially Applied'
              ? 'partial'
              : 'open',
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

  const creditColumns = [
    {
      key: 'creditNumber',
      header: 'Credit No.',
      render: (c: Credit) => c.creditNumber,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (c: Credit) => c.supplier,
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (c: Credit) => c.reference,
    },
    {
      key: 'creditDate',
      header: 'Credit Date',
      render: (c: Credit) => c.creditDate,
    },
    {
      key: 'amount',
      header: 'Credit Amount',
      render: (c: Credit) => `₹${c.amount}`,
    },
    {
      key: 'appliedAmount',
      header: 'Applied',
      render: (c: Credit) => `₹${c.appliedAmount}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Credit) => (
        <Text
          fontWeight="medium"
          color={
            c.status === 'Applied'
              ? 'green.600'
              : c.status === 'Partially Applied'
                ? 'orange.500'
                : 'blue.600'
          }
        >
          {c.status}
        </Text>
      ),
    },
  ]

  const creditFilters = [
    { label: 'All credits', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Partially applied', value: 'partial' },
    { label: 'Applied', value: 'applied' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Credit Filters"
          subtitle="Filter credits by status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Credit Status',
              description: 'Open, partially applied, or fully applied credits.',
              content: (
                <FilterSelect
                  options={creditFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All credits"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton aria-label="Add Credit" colorPalette="blue" variant="solid" px={3} h="32px">
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
        <CommonTable columns={creditColumns} data={data} isLoading={false} rowKey={(c) => c.id} />
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

export default Credits
