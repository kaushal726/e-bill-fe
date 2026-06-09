import { Flex, HStack, Text, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'
import { FaEdit, FaTrash } from '@/components/icons'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { CommonTable } from '@/components/common/CommonTable'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { FilterSelect } from '@/components/common/FilterSelect'
import { FilterDrawer } from '@/components/common/FilterDrawer'
import BillModal from '@/components/modals/BillModal'
import { useBills, type BillRecord } from '@/hooks/useBill'
import { useBillActions } from '@/hooks/useBillActions'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import type { SortKey } from '@/components/popovers/TableActionsPopover'

const toast = ToasterUtil()

const Bill = () => {
  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortKey | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>()
  const [filter, setFilter] = useState<string[]>(['all'])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null)

  const limit = 20

  const { data: billsData, isLoading } = useBills({ page, limit, sortBy, sortOrder })
  const { deleteBill } = useBillActions()

  const bills = billsData?.bills ?? []
  const totalPages = billsData?.totalPages ?? 1

  useEffect(() => {
    dispatch(setHeader({ title: 'Bills' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* Filtering + Sorting */
  const data = useMemo(() => {
    let rows = [...bills]

    if (!filter.includes('all')) {
      rows = rows.filter((b) =>
        filter.includes(
          b.status === 'Paid' ? 'paid' : b.status === 'Overdue' ? 'overdue' : 'unpaid',
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
  }, [bills, filter, sortBy, sortOrder])

  /* Columns */
  const billColumns = [
    {
      key: 'billNumber',
      header: 'Bill Number',
      render: (b: BillRecord) => b.billNumber,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (b: BillRecord) => b.supplier?.name || b.supplierId || 'N/A',
    },
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (b: BillRecord) => b.poNumber || 'N/A',
    },
    {
      key: 'billDate',
      header: 'Bill Date',
      render: (b: BillRecord) => (b.billDate ? new Date(b.billDate).toLocaleDateString() : 'N/A'),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (b: BillRecord) => (b.dueDate ? new Date(b.dueDate).toLocaleDateString() : 'N/A'),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (b: BillRecord) => `${b.amount?.toFixed(2) ?? '0.00'}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b: BillRecord) => (
        <Text
          fontWeight="medium"
          color={
            b.status === 'Paid' ? 'green.600' : b.status === 'Overdue' ? 'red.500' : 'orange.500'
          }
        >
          {b.status}
        </Text>
      ),
    },
  ]

  const billFilters = [
    { label: 'All bills', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Overdue', value: 'overdue' },
  ]

  const activeFilterCount = !filter.includes('all') ? 1 : 0

  const handleDeleteBill = (billId: string) => {
    deleteBill.mutate(billId)
  }

  const handleEditBill = (bill: BillRecord) => {
    setEditingBill(bill)
    setModalOpen(true)
  }

  const handleAddBill = () => {
    setEditingBill(null)
    setModalOpen(true)
  }

  return (
    <Flex bg="gray.100" width="100%" minH="100%" flexDir="column" px={6}>
      {/* Header Row */}
      <Flex justify="space-between" align="center" mt={8}>
        <FilterDrawer
          title="Bill Filters"
          subtitle="Filter bill records by payment status."
          activeCount={activeFilterCount}
          onClearAll={() => setFilter(['all'])}
          sections={[
            {
              key: 'status',
              title: 'Bill Status',
              description: 'Show only paid, unpaid, or overdue bills.',
              content: (
                <FilterSelect
                  options={billFilters}
                  value={filter}
                  defaultValue={['all']}
                  placeholder="All bills"
                  width="100%"
                  onChange={setFilter}
                />
              ),
            },
          ]}
        />

        <HStack gap={2}>
          <IconButton
            aria-label="Add Bill"
            colorPalette="gray"
            variant="solid"
            px={3}
            h="32px"
            onClick={handleAddBill}
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
              /* refresh handled by React Query */
            }}
            onImport={function (): void {
              toast('Import not implemented', 'info')
            }}
            onExport={function (): void {
              toast('Export not implemented', 'info')
            }}
          />
        </HStack>
      </Flex>

      {/* Table */}
      <Box bg="white" mt={6} rounded="lg" p={4}>
        <CommonTable
          columns={billColumns}
          data={data}
          isLoading={isLoading}
          rowKey={(b) => b._id}
          actions={[
            {
              label: 'Edit',
              icon: <FaEdit size="15px" />,
              onClick: (row) => handleEditBill(row),
            },
            {
              label: 'Delete',
              icon: <FaTrash size="15px" />,
              onClick: (row) => handleDeleteBill(row._id),
            },
          ]}
        />
      </Box>

      {/* Pagination */}
      <Flex justify="center" mt={4} gap={2}>
        <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button
            key={i}
            onClick={() => setPage(i + 1)}
            bg={page === i + 1 ? 'gray.950' : 'white'}
            color={page === i + 1 ? 'white' : 'gray.700'}
            border="1px solid"
            borderColor="gray.200"
          >
            {i + 1}
          </Button>
        ))}
        <Button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </Flex>

      {/* Bill Modal */}
      <BillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingBill(null)
        }}
        defaultValues={
          editingBill
            ? {
                _id: editingBill._id,
                billNumber: editingBill.billNumber,
                supplierId: editingBill.supplierId || '',
                poNumber: editingBill.poNumber,
                billDate: editingBill.billDate,
                dueDate: editingBill.dueDate,
                amount: editingBill.amount.toString(),
              }
            : undefined
        }
      />
    </Flex>
  )
}

export default Bill
