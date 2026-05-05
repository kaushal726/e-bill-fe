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

/* ------------------ Fake Packaging Data ------------------ */

type PackagingItem = {
  id: string
  name: string
  material: string
  size: string
  quantity: number
  cost: number
  status: 'Available' | 'Low Stock'
}

const FAKE_PACKAGING: PackagingItem[] = [
  {
    id: '1',
    name: 'Small Box',
    material: 'Cardboard',
    size: '8 x 6 x 4 in',
    quantity: 250,
    cost: 12,
    status: 'Available',
  },
  {
    id: '2',
    name: 'Medium Box',
    material: 'Cardboard',
    size: '12 x 10 x 6 in',
    quantity: 40,
    cost: 18,
    status: 'Low Stock',
  },
  {
    id: '3',
    name: 'Poly Mailer',
    material: 'Plastic',
    size: '10 x 14 in',
    quantity: 500,
    cost: 6,
    status: 'Available',
  },
]

/* ------------------ Component ------------------ */

const Packaging = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Packaging' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_PACKAGING]

    if (!filter.includes('all')) {
      rows = rows.filter((p) => filter.includes(p.status === 'Available' ? 'available' : 'low'))
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

  const packagingColumns = [
    { key: 'name', header: 'Item Name', render: (p: PackagingItem) => p.name },
    {
      key: 'material',
      header: 'Material',
      render: (p: PackagingItem) => p.material,
    },
    { key: 'size', header: 'Size', render: (p: PackagingItem) => p.size },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (p: PackagingItem) => p.quantity,
    },
    {
      key: 'cost',
      header: 'Cost / Unit',
      render: (p: PackagingItem) => `${p.cost}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: PackagingItem) => (
        <Text fontWeight="medium" color={p.status === 'Available' ? 'green.600' : 'orange.500'}>
          {p.status}
        </Text>
      ),
    },
  ]

  const packagingFilters = [
    { label: 'All packaging', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Low stock', value: 'low' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Packaging Filters"
          subtitle="Filter packaging records by stock status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Stock Status',
              description: 'Available or low stock packaging items.',
              content: (
                <FilterSelect
                  options={packagingFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All packaging"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton
            aria-label="Add Packaging"
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
          columns={packagingColumns}
          data={data}
          isLoading={false}
          rowKey={(p) => p.id}
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

export default Packaging
