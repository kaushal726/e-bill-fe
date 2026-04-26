import { Flex, HStack, Text, IconButton, Button, Box, Badge } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { FilterSelect } from '@/components/common/FilterSelect'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import type { SortKey } from '@/components/popovers/TableActionsPopover'

/* ------------------ Fake Roles Data ------------------ */

type Role = {
  id: string
  name: string
  description: string
  usersCount: number
  permissions: string[]
  status: 'Active' | 'Disabled'
}

const FAKE_ROLES: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    usersCount: 2,
    permissions: ['All'],
    status: 'Active',
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Manage inventory and orders',
    usersCount: 5,
    permissions: ['Customers', 'Stocks', 'Orders', 'Bills'],
    status: 'Active',
  },
  {
    id: '3',
    name: 'Staff',
    description: 'Limited operational access',
    usersCount: 8,
    permissions: ['Customers', 'Shipments'],
    status: 'Disabled',
  },
]

/* ------------------ Component ------------------ */

const Roles = () => {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])

  const limit = 20

  useEffect(() => {
    dispatch(setHeader({ title: 'Roles' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ------------------ Filtering + Sorting ------------------ */

  const data = useMemo(() => {
    let rows = [...FAKE_ROLES]

    if (!filter.includes('all')) {
      rows = rows.filter((r) => filter.includes(r.status === 'Active' ? 'active' : 'disabled'))
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

  const roleColumns = [
    {
      key: 'name',
      header: 'Role Name',
      render: (r: Role) => r.name,
    },
    {
      key: 'description',
      header: 'Description',
      render: (r: Role) => r.description,
    },
    {
      key: 'usersCount',
      header: 'Users',
      render: (r: Role) => r.usersCount,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (r: Role) => (
        <HStack gap={1} wrap="wrap">
          {r.permissions.map((p) => (
            <Badge key={p} colorPalette="purple" variant="subtle">
              {p}
            </Badge>
          ))}
        </HStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Role) => (
        <Text fontWeight="medium" color={r.status === 'Active' ? 'green.600' : 'red.500'}>
          {r.status}
        </Text>
      ),
    },
  ]

  const roleFilters = [
    { label: 'All roles', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Disabled', value: 'disabled' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Role Filters"
          subtitle="Filter roles by active/disabled state."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Role Status',
              description: 'Show active roles or disabled roles only.',
              content: (
                <FilterSelect
                  options={roleFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All roles"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton aria-label="Add Role" colorPalette="blue" variant="solid" px={3} h="32px">
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
        <CommonTable columns={roleColumns} data={data} isLoading={false} rowKey={(r) => r.id} />
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

export default Roles
