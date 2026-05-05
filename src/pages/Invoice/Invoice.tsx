import { Box, Grid, GridItem, HStack, VStack, Button, Input, Text, Flex } from '@chakra-ui/react'
import { Plus, Download, Upload, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import DisplayCard from '@/components/common/DisplayCard'
import { CommonTable, TableColumn } from '@/components/common/CommonTable'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { FaEdit, FaTrash } from '@/components/icons'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { SlidersHorizontal } from 'lucide-react'

type InvoiceStatus = 'Draft' | 'Open Invoice' | 'Overdue' | 'Paid'

type InvoiceRow = {
  id: string
  customer: string
  invoiceNo: string
  status: InvoiceStatus
  amount: number
  issueDate: string
  created: string
  dueDate: string
}

export default function InvoicePage() {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<{
    start?: string
    end?: string
  }>({})

  useEffect(() => {
    dispatch(setHeader({ title: 'Invoice' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const data: InvoiceRow[] = useMemo(
    () => [
      {
        id: '1',
        customer: 'DEVOTEAM',
        invoiceNo: 'F-012023-68',
        status: 'Open Invoice',
        amount: 876.39,
        issueDate: '17 Jan 2023',
        created: '17 Jan 2023, 1:20pm',
        dueDate: '03 Mar 2023',
      },
      {
        id: '2',
        customer: 'DEVOTEAM',
        invoiceNo: 'F-012023-69',
        status: 'Overdue',
        amount: 876.39,
        issueDate: '17 Jan 2023',
        created: '17 Jan 2023, 1:20pm',
        dueDate: '03 Mar 2023',
      },
    ],
    [],
  )

  const columns: TableColumn<InvoiceRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => <Text fontWeight="600">{row.customer}</Text>,
      width: '180px',
    },
    {
      key: 'invoice',
      header: 'Invoice',
      render: (row) => row.invoiceNo,
      width: '160px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Box
          px={2}
          py={1}
          borderRadius="md"
          fontSize="12px"
          fontWeight="600"
          textAlign="center"
          bg={
            row.status === 'Open Invoice'
              ? 'blue.50'
              : row.status === 'Overdue'
                ? 'red.50'
                : row.status === 'Paid'
                  ? 'green.50'
                  : 'gray.100'
          }
          color={
            row.status === 'Open Invoice'
              ? 'blue.600'
              : row.status === 'Overdue'
                ? 'red.600'
                : row.status === 'Paid'
                  ? 'green.600'
                  : 'gray.600'
          }
        >
          {row.status}
        </Box>
      ),
      width: '140px',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => `$${row.amount.toFixed(2)}`,
      width: '140px',
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (row) => row.issueDate,
      width: '130px',
    },
    {
      key: 'created',
      header: 'Created',
      render: (row) => row.created,
      width: '200px',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => row.dueDate,
      width: '130px',
    },
  ]
  const invoiceActions = [
    {
      label: 'Edit',
      icon: <FaEdit size="16px" color="#7C3AED" />,
      onClick: () => {},
    },
    {
      label: 'Delete',
      icon: <FaTrash size="16px" color="#EF4444" />,
      onClick: () => {},
    },
  ]

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        row.customer.toLowerCase().includes(search.toLowerCase()) ||
        row.invoiceNo.toLowerCase().includes(search.toLowerCase())

      const issue = new Date(row.issueDate).getTime()

      const afterStart = dateRange.start ? issue >= new Date(dateRange.start).getTime() : true

      const beforeEnd = dateRange.end ? issue <= new Date(dateRange.end).getTime() : true

      return matchesSearch && afterStart && beforeEnd
    })
  }, [data, search, dateRange])

  return (
    <Flex bg="gray.100" width="100%" minH="100%" overflowX="auto" flexDir="column" px={6}>
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between" mt={3}>
          <Text fontSize={'2xl'} fontWeight={'bold'}>
            Invoice
          </Text>
          <HStack gap={2}>
            <Button
              h="38px"
              px={4}
              bg="white"
              color="gray.600"
              border="1px solid"
              borderColor="gray.100"
              shadow={'lighterGray'}
            >
              <Upload size={16} />
              Import
            </Button>

            <Button
              h="38px"
              px={4}
              bg="white"
              color="gray.600"
              border="1px solid"
              borderColor="gray.100"
              shadow={'lighterGray'}
            >
              <Download size={16} />
              Export
            </Button>

            <Button h="38px" px={5} bg="blue.600" color="white" shadow={'lighterGray'}>
              <Plus size={16} />
              Create Invoice
            </Button>
          </HStack>
        </HStack>

        <Grid templateColumns="repeat(5, 1fr)" gap={4}>
          <GridItem>
            <DisplayCard
              title="All Invoice"
              highlight="$466.2k"
              description="+20.9%"
              graph
              graphType="line"
            />
          </GridItem>
          <GridItem>
            <DisplayCard title="Draft" highlight="$500" description="+5.9%" />
          </GridItem>
          <GridItem>
            <DisplayCard
              title="Open Invoice"
              highlight="$134.4k"
              description="+20.9%"
              graph
              graphType="area"
            />
          </GridItem>
          <GridItem>
            <DisplayCard
              title="Overdue"
              highlight="$800"
              description="+60.2%"
              graph
              graphType="bar"
            />
          </GridItem>
          <GridItem>
            <DisplayCard title="Paid" highlight="$0.00" description="+5.9%" />
          </GridItem>
        </Grid>

        <HStack justify="space-between">
          <HStack gap={3}>
            <HStack
              h="38px"
              px={3}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              bg="white"
              shadow="lighterGray"
              w="260px"
            >
              <Search size={16} color="#2563EB" />
              <Input
                border={'none'}
                outline={'none'}
                placeholder="Search invoice"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </HStack>

            <HStack gap={2}>
              <DateInputWithIcon
                value={dateRange.start || ''}
                onChange={(v) => setDateRange((p) => ({ ...p, start: v }))}
              />
              <DateInputWithIcon
                value={dateRange.end || ''}
                onChange={(v) => setDateRange((p) => ({ ...p, end: v }))}
              />
            </HStack>
          </HStack>

          {/* RIGHT */}
          <Button
            h="38px"
            px={4}
            borderColor="gray.300"
            bg="white"
            color="gray.700"
            fontSize="sm"
            fontWeight="medium"
            shadow={'lighterGray'}
            _active={{ bg: 'gray.100' }}
          >
            <HStack gap={2}>
              <SlidersHorizontal size={16} />
              <Text>More filters</Text>
            </HStack>
          </Button>
        </HStack>

        {/* TABLE */}
        <Box
          bg="white"
          rounded="lg"
          shadow="lightGray"
          border="1px solid"
          borderColor="gray.100"
          w="100%"
          p={{ base: 2, md: 4 }}
        >
          <CommonTable
            columns={columns}
            data={filteredData}
            rowKey={(row) => row.id}
            actions={invoiceActions}
          />
        </Box>
      </VStack>
    </Flex>
  )
}
