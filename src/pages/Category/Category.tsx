import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { TableActionsPopover } from '@/components/popovers/TableActionsPopover'
import { CommonTable } from '@/components/common/CommonTable'
import { ExpandableSearch } from '@/components/common/ExpandableSearch'

import { FaEdit, FaTrash } from '@/components/icons'
import CategoryModal, { CategoryFormValues } from '@/components/modals/CategoryModal'
import ConfirmDeleteDialog from '@/components/modals/ConfirmDelete'

import { useCategory } from '@/hooks/useCategory'
import { useCategoryActions } from '@/hooks/useCategoryActions'
import { useCategoryImport } from '@/hooks/useCategoryImport'
import { useCategoryExport } from '@/hooks/useCategoryExport'

import { isFrontendPagination } from '@/utils/isFrontendPagination'

function Categories() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editId, setEditId] = useState<string | null>(null)
  const [editDefaults, setEditDefaults] = useState<CategoryFormValues>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [page, setPage] = useState(1)
  const limit = 20

  const frontend = isFrontendPagination(sortBy, sortOrder)

  const { deleteCategory } = useCategoryActions()
  const importCategories = useCategoryImport()
  const exportCategories = useCategoryExport()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useCategory({
    search: debouncedSearch || undefined,
    ...(frontend ? { sortBy, sortOrder } : { page, limit }),
  })

  const rawCategories = data?.categories ?? []

  const categories = useMemo(() => {
    if (!frontend) return rawCategories
    const start = (page - 1) * limit
    return rawCategories.slice(start, start + limit)
  }, [rawCategories, page, limit, frontend])

  const pagination = frontend
    ? {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(rawCategories.length / limit)),
        hasNextPage: page * limit < rawCategories.length,
        hasPreviousPage: page > 1,
      }
    : (data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      })

  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Categories',
        subtitle: 'Organize product groups for cleaner inventory, product, and reporting flows',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const categoryColumns = [
    {
      key: 'name',
      header: 'Category Name',
      width: '240px',
      render: (c: any) => c.name ?? '-',
    },
    {
      key: 'categoryId',
      header: 'Category ID',
      width: '170px',
      render: (c: any) => (c?._id ? `CAT-${c._id.slice(-6).toUpperCase()}` : '-'),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      width: '170px',
      render: (c: any) => (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      width: '170px',
      render: (c: any) => (c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '-'),
    },
  ]

  const categoryActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="14px" color="#7C3AED" />,
      onClick: (item: any) => {
        setDialogMode('edit')
        setEditId(item._id)
        setEditDefaults({ name: item.name })
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

  const CATEGORY_SORT_OPTIONS = [
    { key: 'name', label: 'Name' },
    { key: 'createdAt', label: 'Created Time' },
    { key: 'updatedAt', label: 'Last Modified Time' },
  ]

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importCategories.mutate(file)
    e.target.value = ''
  }

  const handleExportClick = () => {
    exportCategories.mutate({
      page,
      limit,
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    })
  }

  const summary = {
    total: rawCategories.length,
    activePage: pagination.currentPage,
    totalPages: pagination.totalPages,
    showing: categories.length,
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />

      <Flex
        bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
        w="100%"
        h="100%"
        flexDir="column"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.total}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Showing
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.showing}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Page
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.activePage}
            </Text>
          </Box>
          <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              Total Pages
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {summary.totalPages}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Top Bar */}
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          mt={2}
          gap={4}
          direction={{ base: 'column', md: 'row' }}
        >
          <HStack gap={2} flexWrap="wrap" align="center">
            <ExpandableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              expandedWidth="300px"
            />
            <Text
              fontSize="xs"
              color="gray.600"
              bg="white"
              px={3}
              py={2}
              borderRadius="10px"
              border="1px solid"
              borderColor="gray.100"
            >
              Sorted by {sortBy} ({sortOrder})
            </Text>
          </HStack>

          <HStack gap={2} justify={{ base: 'space-between', md: 'flex-end' }}>
            <Button
              bg="gray.950"
              color="white"
              h="38px"
              px={4}
              _hover={{ bg: 'gray.800' }}
              onClick={() => {
                setDialogMode('add')
                setEditId(null)
                setEditDefaults(undefined)
                setOpen(true)
              }}
            >
              <HStack gap={1.5}>
                <Plus size={18} />
                <Text fontSize="sm" fontWeight="700">
                  Add Category
                </Text>
              </HStack>
            </Button>

            <Button
              variant="outline"
              bg="white"
              color="black"
              borderColor="gray.300"
              h="38px"
              px={3}
              _hover={{ bg: 'gray.50' }}
              onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
            >
              <HStack gap={1}>
                <RefreshCw size={16} />
                <Text fontSize="sm" fontWeight="700" color="black">
                  Sync Category
                </Text>
              </HStack>
            </Button>

            <TableActionsPopover
              sortBy={sortBy}
              sortOrder={sortOrder}
              sortOptions={CATEGORY_SORT_OPTIONS}
              onSortChange={(key, order) => {
                setPage(1)
                setSortBy(key)
                setSortOrder(order)
              }}
              onImport={handleImportClick}
              onExport={handleExportClick}
              showUtilityActions={false}
              showRefreshAction={false}
            />
          </HStack>
        </Flex>

        {/* Table */}
        <Box
          bg="rgba(255,255,255,0.86)"
          mt={6}
          rounded="2xl"
          shadow="lightGray"
          p={4}
          border="1px solid"
          borderColor="whiteAlpha.800"
        >
          <CommonTable
            columns={categoryColumns}
            data={categories}
            isLoading={isLoading}
            rowKey={(c) => c._id}
            actions={categoryActions}
            emptyMessage={
              debouncedSearch ? 'No categories match your search.' : 'No categories found.'
            }
          />
        </Box>

        {/* Pagination */}
        <VStack
          justify="center"
          align="center"
          mt={3}
          gap={2}
          bg="rgba(255,255,255,0.86)"
          p={3}
          borderRadius="18px"
          border="1px solid"
          borderColor="whiteAlpha.800"
          flexWrap="wrap"
        >
          <HStack gap={2} flexWrap="wrap" justify="center">
            <Button
              onClick={() => setPage(pagination.currentPage - 1)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>

            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pg = i + 1
              return (
                <Button
                  key={pg}
                  bg={pg === pagination.currentPage ? 'gray.900' : 'white'}
                  color={pg === pagination.currentPage ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={pg === pagination.currentPage ? 'gray.900' : 'gray.200'}
                  _hover={{ bg: pg === pagination.currentPage ? 'gray.900' : 'gray.100' }}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              )
            })}

            <Button
              onClick={() => setPage(pagination.currentPage + 1)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.600">
            Showing {categories.length} of {rawCategories.length} categories
          </Text>
        </VStack>
      </Flex>

      {/* Modals */}
      <CategoryModal
        open={open}
        onClose={() => setOpen(false)}
        mode={dialogMode}
        pubId={editId ?? undefined}
        defaultValues={editDefaults}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteName}"?`}
        loading={deleteCategory.isPending}
        onConfirm={() => {
          if (!deleteId) return

          deleteCategory.mutate(deleteId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}

export default Categories
