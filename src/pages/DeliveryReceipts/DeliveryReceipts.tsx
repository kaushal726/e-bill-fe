import { Flex, HStack, Text, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { Plus } from 'lucide-react'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { CommonTable } from '@/components/common/CommonTable'
import { FilterSelect } from '@/components/common/FilterSelect'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import { FaEdit, FaTrash } from '@/components/icons/index.ts'
import type { SortKey } from '@/components/popovers/TableActionsPopover'

// Fake data for demonstration
const fakeReceipts = [
  {
    _id: '1',
    date: '2026-01-09',
    receiptNo: 'DR-1001',
    customer: 'John Doe',
    items: 5,
    total: 1500,
    status: 'Delivered',
  },
  {
    _id: '2',
    date: '2026-01-12',
    receiptNo: 'DR-1002',
    customer: 'Jane Smith',
    items: 3,
    total: 900,
    status: 'Pending',
  },
  // ...more rows
]

function DeliveryReceipts() {
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<any>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [sortBy, setSortBy] = useState<SortKey | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined)
  const [value, setValue] = useState<string[]>([])

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setHeader({ title: 'Delivery Receipts' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  // Columns for delivery receipts
  const receiptColumns = [
    { key: 'date', header: 'Date', render: (r: any) => r.date },
    { key: 'receiptNo', header: 'Receipt No.', render: (r: any) => r.receiptNo },
    { key: 'customer', header: 'Customer', render: (r: any) => r.customer },
    { key: 'items', header: 'Items', render: (r: any) => r.items },
    { key: 'total', header: 'Total', render: (r: any) => `$${r.total}` },
    { key: 'status', header: 'Status', render: (r: any) => r.status },
  ]

  // Actions for each row
  const receiptActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#7C3AED" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults(item)
        setOpen(true)
      },
    },
    {
      label: 'Delete',
      icon: <FaTrash size="14px" color="#EF4444" />,
      onClick: (item: any) => {
        setDeleteId(item._id)
        setDeleteName(item.receiptNo)
        setDeleteOpen(true)
      },
    },
  ]

  // Filters for receipts
  const receiptFilters = [
    { label: 'All', value: 'all' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  const activeFilterCount = !value.includes('all') && value.length > 0 ? 1 : 0

  // Pagination (fake for now)
  const limit = 20
  const totalPages = 1
  const pagination = {
    currentPage: 1,
    totalPages,
    hasNextPage: false,
    hasPreviousPage: false,
  }

  // Filtered data (fake, just show all)
  const receipts = fakeReceipts

  return (
    <>
      <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
        <Flex justify="space-between" align="center" mt={8} w="100%">
          <FilterDrawer
            title="Delivery Receipt Filters"
            subtitle="Filter delivery receipts by delivery status."
            activeCount={activeFilterCount}
            onClearAll={() => setValue(['all'])}
            sections={[
              {
                key: 'status',
                title: 'Delivery Status',
                description: 'Delivered, pending, or cancelled receipts.',
                content: (
                  <FilterSelect
                    options={receiptFilters}
                    value={value}
                    defaultValue={['all']}
                    placeholder="All receipts"
                    width="100%"
                    onChange={setValue}
                  />
                ),
              },
            ]}
          />

          <HStack gap={2}>
            <IconButton
              aria-label="Add"
              colorPalette="blue"
              variant="solid"
              px={3}
              h="32px"
              onClick={() => {
                setDialogMode('add')
                setEditId(null)
                setEditDefaults(undefined)
                setOpen(true)
              }}
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
              // onImport/onExport can be added if needed
              onRefresh={() => {}}
              onImport={function (): void {
                throw new Error('Function not implemented.')
              }}
              onExport={function (): void {
                throw new Error('Function not implemented.')
              }}
            />
          </HStack>
        </Flex>

        <Box bg="white" mt={6} rounded="lg" p={4}>
          <CommonTable
            columns={receiptColumns}
            data={receipts}
            isLoading={false}
            rowKey={(r) => r._id}
            actions={receiptActions}
          />
        </Box>

        <Flex justify="center" mt={4} gap={2}>
          <Button
            onClick={() => setPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            Previous
          </Button>

          {Array.from({ length: pagination.totalPages }).map((_, i) => {
            const pg = i + 1
            return (
              <Button
                key={pg}
                bg={pg === pagination.currentPage ? 'purple.100' : 'transparent'}
                onClick={() => setPage(pg)}
              >
                {pg}
              </Button>
            )
          })}

          <Button
            onClick={() => setPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </Button>
        </Flex>
      </Flex>

      {/* Add/Edit Modal and ConfirmDeleteDialog can be implemented as needed */}
    </>
  )
}

export default DeliveryReceipts
