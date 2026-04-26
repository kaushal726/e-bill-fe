import { Flex, HStack, Text, Heading, IconButton, Button, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'

import { FaEdit, FaTrash } from '@/components/icons'
import { CommonTable } from '@/components/common/CommonTable'
import { SortKey, TableActionsPopover } from '@/components/popovers/TableActionsPopover'

import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'

import { useStaff } from '@/hooks/useStaff'
import { useStaffActions } from '@/hooks/useStaffActions'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import StaffDialog, { StaffFormValues } from '@/components/modals/StaffModal'

function Staff() {
  const dispatch = useDispatch()

  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<StaffFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const { data, isLoading } = useStaff(page)
  const { deleteStaff, exportStaff, importStaff } = useStaffActions(deleteId ?? '')

  const staff = data?.staff ?? []
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

  // console.log('Staff Data:', staff)
  /* ---------------- TABLE COLUMNS ---------------- */

  const staffColumns = [
    {
      key: 'name',
      header: 'Staff Name',
      render: (s: any) => s.name,
    },
    {
      key: 'staffId',
      header: 'Staff ID',
      render: (s: any) => `BS${s._id.slice(-8).toUpperCase()}`,
    },
    {
      key: 'mobileNumber',
      header: 'Phone Number',
      render: (s: any) => s.mobileNumber,
    },
    {
      key: 'role',
      header: 'Role',
      render: (s: any) => s.role,
    },
    {
      key: 'baseSalary',
      header: 'Base Salary',
      render: (s: any) => s.baseSalary,
    },
    {
      key: 'salaryPerWeek',
      header: 'Weekly Salary',
      render: (s: any) => s.salaryPerWeek ?? 0,
    },
    {
      key: 'sundayPolicy',
      header: 'Sunday Rule',
      render: (s: any) =>
        s.sundayPolicy === 'paid_off'
          ? 'Sunday off full pay'
          : s.sundayPolicy === 'halfday_paid_full'
            ? 'Sunday half day full pay'
            : 'Regular',
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (s: any) => new Date(s.joinDate).toLocaleDateString(),
    },
  ]

  /* ---------------- TABLE ACTIONS ---------------- */

  const staffActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#7C3AED" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({
          name: item.name,
          mobileNumber: item.mobileNumber,
          role: item.role,
          baseSalary: String(item.baseSalary),
          salaryPerWeek: String(item.salaryPerWeek ?? 0),
          sundayPolicy: item.sundayPolicy ?? 'regular',
          joinDate: item.joinDate.split('T')[0],
        })
        setOpen(true)
      },
    },
    {
      label: 'Delete',
      icon: <FaTrash size="14px" color="#EF4444" />,
      onClick: (item: any) => {
        setDeleteId(item._id)
        setDeleteName(item.name)
        setDeleteOpen(true)
      },
    },
  ]

  /* ---------------- HEADER ---------------- */

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Staff',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  /* ---------------- UI ---------------- */

  return (
    <>
      <Flex
        bg="gray.100"
        width="100%"
        minH="100%"
        overflowX="auto"
        flexDir="column"
        pl={{ base: 3, sm: 2, md: 6 }}
        pr={{ base: 3, sm: 2, md: 6 }}
        pt={{ base: 3, sm: 4, md: 1 }}
        mb={3}
      >
        {/* Header Row */}
        <Flex
          justify="space-between"
          align="center"
          mt={8}
          w="100%"
          gap={4}
          flexWrap={{ base: 'wrap', md: 'nowrap' }}
        >
          <Heading size="xl" color="gray.800" whiteSpace="nowrap">
            Active Staff
          </Heading>

          <HStack gap={2}>
            <IconButton
              aria-label="Add Staff"
              colorPalette="blue"
              variant="solid"
              px={3}
              minW="unset"
              minH="unset"
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
                <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>
                  New
                </Text>
              </HStack>
            </IconButton>

            <HStack h="32px" _hover={{ bg: 'gray.300' }}>
              <TableActionsPopover
                onSortChange={function (key: SortKey, order: 'asc' | 'desc'): void {
                  throw new Error('Function not implemented.')
                }}
                onImport={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.xlsx,.xls'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) importStaff.mutate(file)
                  }
                  input.click()
                }}
                onExport={() => exportStaff.mutate()}
              />
            </HStack>
          </HStack>
        </Flex>

        {/* Table */}
        <Box
          bg="white"
          mt={6}
          rounded="lg"
          shadow="lightGray"
          border="1px solid"
          borderColor="gray.100"
          w="100%"
          p={{ base: 2, md: 4 }}
        >
          <CommonTable
            columns={staffColumns}
            data={staff}
            isLoading={isLoading}
            rowKey={(s) => s._id}
            actions={staffActions}
          />
        </Box>

        {/* Pagination */}
        <Flex
          justify="center"
          align="center"
          borderRadius="lg"
          mt={2}
          mb={2}
          p={2}
          bg="white"
          shadow="lightGray"
          gap={4}
          width="100%"
        >
          <Button
            onClick={() => setPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            variant="subtle"
            bg="white"
            rounded="lg"
          >
            <Text color="gray.800">Previous</Text>
          </Button>

          <HStack gap={2}>
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pg = index + 1
              return (
                <Button
                  key={pg}
                  onClick={() => setPage(pg)}
                  rounded="lg"
                  bg={pg === pagination.currentPage ? 'purple.100' : 'transparent'}
                  color={pg === pagination.currentPage ? 'purple.600' : 'gray.700'}
                  _hover={{ bg: 'purple.50' }}
                >
                  {pg}
                </Button>
              )
            })}
          </HStack>

          <Button
            onClick={() => setPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            variant="subtle"
            bg="white"
            rounded="lg"
          >
            <Text color="gray.800">Next</Text>
          </Button>
        </Flex>
      </Flex>

      {/* Modals */}
      <StaffDialog
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Staff"
        description={`Are you sure you want to delete "${deleteName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteStaff.isPending}
        onConfirm={() => {
          deleteStaff.mutate(undefined, {
            onSuccess: () => {
              setDeleteOpen(false)
            },
          })
        }}
      />
    </>
  )
}

export default Staff
