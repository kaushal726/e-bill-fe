import { Flex, HStack, Text, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from '@/components/icons'
import { Plus } from 'lucide-react'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { CommonTable } from '@/components/common/CommonTable'
import { FilterSelect } from '@/components/common/FilterSelect'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import { useDispatch } from 'react-redux'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'

const fakeSalesOrders = [
  {
    _id: '1',
    orderNumber: 'SO1001',
    customerName: 'John Doe',
    date: '2024-06-01',
    status: 'Pending',
    totalAmount: 1200,
    paymentStatus: 'Unpaid',
  },
  {
    _id: '2',
    orderNumber: 'SO1002',
    customerName: 'Jane Smith',
    date: '2024-06-02',
    status: 'Completed',
    totalAmount: 850,
    paymentStatus: 'Paid',
  },
  {
    _id: '3',
    orderNumber: 'SO1003',
    customerName: 'Acme Corp',
    date: '2024-06-03',
    status: 'Shipped',
    totalAmount: 430,
    paymentStatus: 'Partial',
  },
]

const salesOrderColumns = [
  { key: 'orderNumber', header: 'Order No.', render: (o: any) => o.orderNumber },
  { key: 'customerName', header: 'Customer', render: (o: any) => o.customerName },
  { key: 'date', header: 'Date', render: (o: any) => o.date },
  { key: 'status', header: 'Status', render: (o: any) => o.status },
  { key: 'totalAmount', header: 'Total Amount', render: (o: any) => `$${o.totalAmount}` },
  { key: 'paymentStatus', header: 'Payment Status', render: (o: any) => o.paymentStatus },
]

const salesOrderActions = [
  {
    label: 'Edit',
    icon: <FaEdit size="14px" color="#7C3AED" />,
    onClick: (item: any) => {
      // handle edit
    },
  },
  {
    label: 'Delete',
    icon: <FaTrash size="14px" color="#EF4444" />,
    onClick: (item: any) => {
      // handle delete
    },
  },
]

const salesOrderFilters = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Shipped', value: 'shipped' },
]

const SalesOrder = () => {
  useEffect(() => {
    dispatch(setHeader({ title: 'Sales Orders' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [])

  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [value, setValue] = useState<string[]>(['all'])

  const activeFilterCount = !value.includes('all') ? 1 : 0

  // Fake pagination
  const limit = 10
  const totalPages = 1

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      <Flex justify="space-between" align="center" mt={8} w="100%">
        <FilterDrawer
          title="Sales Order Filters"
          subtitle="Filter sales orders by order status."
          activeCount={activeFilterCount}
          onClearAll={() => setValue(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Order Status',
              description: 'Pending, completed, or shipped sales orders.',
              content: (
                <FilterSelect
                  options={salesOrderFilters}
                  value={value}
                  defaultValue={['all']}
                  placeholder="All Orders"
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
              // handle add
            }}
          >
            <HStack gap={1}>
              <Plus size={18} />
              <Text fontSize="sm">New</Text>
            </HStack>
          </IconButton>

          <TableActionsPopover
            sortBy={undefined}
            sortOrder={undefined}
            onSortChange={() => {}}
            onImport={() => {}}
            onExport={() => {}}
            onRefresh={() => {}}
          />
        </HStack>
      </Flex>

      <Box bg="white" mt={6} rounded="lg" p={4}>
        <CommonTable
          columns={salesOrderColumns}
          data={fakeSalesOrders}
          isLoading={false}
          rowKey={(o) => o._id}
          actions={salesOrderActions}
        />
      </Box>

      <Flex justify="center" mt={4} gap={2}>
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        {Array.from({ length: totalPages }).map((_, i) => {
          const pg = i + 1
          return (
            <Button
              key={pg}
              bg={pg === page ? 'purple.100' : 'transparent'}
              onClick={() => setPage(pg)}
            >
              {pg}
            </Button>
          )
        })}
        <Button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </Button>
      </Flex>
    </Flex>
  )
}

export default SalesOrder
