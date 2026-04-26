import { Flex, HStack, Text, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
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
const fakePayments = [
  {
    _id: '1',
    date: '2026-01-10',
    customer: 'John Doe',
    amount: 1200,
    method: 'Bank Transfer',
    reference: 'INV-1001',
    status: 'Completed',
  },
  {
    _id: '2',
    date: '2026-01-11',
    customer: 'Jane Smith',
    amount: 800,
    method: 'Cash',
    reference: 'INV-1002',
    status: 'Pending',
  },
  // ...more rows
]

function PaymentsReceived() {
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
    dispatch(setHeader({ title: 'Payments Received' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  // Columns for payments received
  const paymentColumns = [
    { key: 'date', header: 'Date', render: (p: any) => p.date },
    { key: 'customer', header: 'Customer', render: (p: any) => p.customer },
    { key: 'amount', header: 'Amount', render: (p: any) => `$${p.amount}` },
    { key: 'method', header: 'Payment Method', render: (p: any) => p.method },
    { key: 'reference', header: 'Reference', render: (p: any) => p.reference },
    { key: 'status', header: 'Status', render: (p: any) => p.status },
  ]

  // Actions for each row
  const paymentActions = [
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
        setDeleteName(item.reference)
        setDeleteOpen(true)
      },
    },
  ]

  // Filters for payments
  const paymentFilters = [
    { label: 'All', value: 'all' },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
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
  const payments = fakePayments

  return (
    <>
      <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
        <Flex justify="space-between" align="center" mt={8} w="100%">
          <FilterDrawer
            title="Payments Received Filters"
            subtitle="Filter received payments by transaction status."
            activeCount={activeFilterCount}
            onClearAll={() => setValue(['all'])}
            sections={[
              {
                key: 'status',
                title: 'Transaction Status',
                description: 'Completed, pending, or failed payment records.',
                content: (
                  <FilterSelect
                    options={paymentFilters}
                    value={value}
                    defaultValue={['all']}
                    placeholder="All payments"
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
            columns={paymentColumns}
            data={payments}
            isLoading={false}
            rowKey={(p) => p._id}
            actions={paymentActions}
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

export default PaymentsReceived
