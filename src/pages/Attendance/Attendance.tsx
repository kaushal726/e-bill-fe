import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  Badge,
  Button,
  Portal,
  Popover,
  Input,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { CommonTable } from '@/components/common/CommonTable'
import { CalendarDays, Users } from 'lucide-react'
import { Calendar } from '@/components/common/Calendar'

import { useAttendanceByDate, useMonthlySalarySummary } from '@/hooks/useAttendance'
import { useAttendanceActions } from '@/hooks/useAttendanceActions'
import { useAllStaff } from '@/hooks/useStaff'

const statusColor = {
  present: 'green',
  halfday: 'orange',
  absent: 'red',
  leave: 'yellow',
} as const

const toDateStr = (d: Date) => d.toISOString().split('T')[0]
const toMonthStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

const Attendance = () => {
  const dispatch = useDispatch()
  const [date, setDate] = useState<Date>(new Date())
  const [calOpen, setCalOpen] = useState(false)
  const [month, setMonth] = useState<string>(toMonthStr(new Date()))

  const dateStr = toDateStr(date)

  const { data: records = [], isLoading } = useAttendanceByDate(dateStr)
  const { data: monthlySummary, isLoading: isMonthlyLoading } = useMonthlySalarySummary(month)
  const { data: allStaff = [] } = useAllStaff()
  const { markAttendance, bulkMarkAttendance } = useAttendanceActions()

  useEffect(() => {
    dispatch(setHeader({ title: 'Attendance', subtitle: 'Daily attendance log for all staff' }))
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  // Merge staff list with today's attendance records
  const rows = useMemo(() => {
    const map = new Map(records.map((r) => [r.staffId._id, r]))
    return allStaff.map((s) => {
      const rec = map.get(s._id)
      return {
        _id: s._id,
        name: s.name,
        role: s.role,
        status: rec?.status ?? null,
        checkIn: rec?.checkIn,
        checkOut: rec?.checkOut,
        attendanceId: rec?._id,
      }
    })
  }, [allStaff, records])

  const presentCount = rows.filter((r) => r.status === 'present').length
  const halfdayCount = rows.filter((r) => r.status === 'halfday').length
  const absentCount = rows.filter((r) => r.status === 'absent').length
  const leaveCount = rows.filter((r) => r.status === 'leave').length
  const unmarkedCount = rows.filter((r) => r.status === null).length

  const handleMark = (staffId: string, status: 'present' | 'halfday' | 'absent' | 'leave') => {
    markAttendance.mutate({ staffId, status, date: dateStr })
  }

  const handleBulkPresent = () => {
    const unmarked = rows.filter((r) => r.status === null)
    if (!unmarked.length) return
    bulkMarkAttendance.mutate({
      date: dateStr,
      records: unmarked.map((r) => ({ staffId: r._id, status: 'present' })),
    })
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      width: '200px',
      render: (row: any) => row.name,
    },
    {
      key: 'role',
      header: 'Role',
      width: '140px',
      render: (row: any) => row.role || '-',
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (row: any) =>
        row.status ? (
          <Badge colorPalette={statusColor[row.status as keyof typeof statusColor]}>
            {String(row.status).toUpperCase()}
          </Badge>
        ) : (
          <Badge colorPalette="gray">NOT MARKED</Badge>
        ),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      width: '120px',
      render: (row: any) =>
        row.checkIn
          ? new Date(row.checkIn).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      width: '120px',
      render: (row: any) =>
        row.checkOut
          ? new Date(row.checkOut).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      key: 'actions',
      header: 'Mark',
      width: '340px',
      render: (row: any) => (
        <HStack gap={1}>
          <Button
            size="xs"
            bg={row.status === 'present' ? 'green.500' : 'white'}
            color={row.status === 'present' ? 'white' : 'green.700'}
            border="1px solid"
            borderColor="green.300"
            onClick={() => handleMark(row._id, 'present')}
          >
            Present
          </Button>
          <Button
            size="xs"
            bg={row.status === 'halfday' ? 'orange.500' : 'white'}
            color={row.status === 'halfday' ? 'white' : 'orange.700'}
            border="1px solid"
            borderColor="orange.300"
            onClick={() => handleMark(row._id, 'halfday')}
          >
            Half Day
          </Button>
          <Button
            size="xs"
            bg={row.status === 'absent' ? 'red.500' : 'white'}
            color={row.status === 'absent' ? 'white' : 'red.600'}
            border="1px solid"
            borderColor="red.200"
            onClick={() => handleMark(row._id, 'absent')}
          >
            Absent
          </Button>
          <Button
            size="xs"
            bg={row.status === 'leave' ? 'yellow.400' : 'white'}
            color={row.status === 'leave' ? 'white' : 'yellow.700'}
            border="1px solid"
            borderColor="yellow.300"
            onClick={() => handleMark(row._id, 'leave')}
          >
            Leave
          </Button>
        </HStack>
      ),
    },
  ]

  return (
    <Flex
      bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
      width="100%"
      minH="100%"
      flexDir="column"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
    >
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 2, md: 5 }} gap={3}>
        {[
          { label: 'Present', value: presentCount },
          { label: 'Half Day', value: halfdayCount },
          { label: 'Absent', value: absentCount },
          { label: 'On Leave', value: leaveCount },
          { label: 'Not Marked', value: unmarkedCount },
        ].map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="16px"
            p={3}
          >
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
              {card.label}
            </Text>
            <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
              {card.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Controls */}
      <Flex
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mt={4}
        gap={3}
        direction={{ base: 'column', md: 'row' }}
      >
        {/* Date Picker */}
        <Popover.Root open={calOpen} onOpenChange={(d) => setCalOpen(d.open)}>
          <Popover.Trigger asChild>
            <Button
              bg="white"
              color="gray.900"
              border="1px solid"
              borderColor="gray.200"
              h="38px"
              gap={2}
            >
              <CalendarDays size={16} />
              {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="md"
                p={3}
                shadow="lg"
              >
                <Calendar
                  value={date}
                  onChange={(d) => {
                    if (d) {
                      setDate(d)
                      setCalOpen(false)
                    }
                  }}
                />
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {/* Bulk mark present */}
        {unmarkedCount > 0 && (
          <Button
            bg="green.600"
            color="white"
            h="38px"
            px={4}
            loading={bulkMarkAttendance.isPending}
            onClick={handleBulkPresent}
          >
            <HStack gap={1.5}>
              <Users size={16} />
              <Text fontSize="sm" fontWeight="700">
                Mark All Unmarked Present
              </Text>
            </HStack>
          </Button>
        )}
      </Flex>

      {/* Table */}
      <Box
        bg="rgba(255,255,255,0.86)"
        mt={6}
        rounded="2xl"
        shadow="lightGray"
        border="1px solid"
        borderColor="whiteAlpha.800"
        w="100%"
        p={{ base: 2, md: 4 }}
      >
        <CommonTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          rowKey={(r) => r._id}
          emptyMessage="No staff found. Add staff first."
        />
      </Box>

      {/* Monthly analytics */}
      <Box
        bg="rgba(255,255,255,0.92)"
        mt={6}
        rounded="2xl"
        shadow="lightGray"
        border="1px solid"
        borderColor="whiteAlpha.800"
        w="100%"
        p={{ base: 3, md: 4 }}
      >
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          gap={3}
          direction={{ base: 'column', md: 'row' }}
        >
          <Box>
            <Text fontSize="lg" fontWeight="800" color="gray.900">
              Attendance + Salary Monthly Report
            </Text>
            <Text fontSize="sm" color="gray.600">
              Month-wise staff attendance and salary payout in one place.
            </Text>
          </Box>

          <HStack>
            <Text fontSize="sm" color="gray.700" fontWeight="700">
              Month
            </Text>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              maxW="180px"
              bg="white"
              borderColor="gray.200"
            />
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(7, 1fr)' }} gap={3} mt={4}>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Staff
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
                {monthlySummary?.totals?.staffCount ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Present Days
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="green.700">
                {monthlySummary?.totals?.totalPresentDays ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Half Days
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="orange.600">
                {monthlySummary?.totals?.totalHalfDays ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Absent Days
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="red.600">
                {monthlySummary?.totals?.totalAbsentDays ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Paid Sundays
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="purple.700">
                {monthlySummary?.totals?.totalPaidSundayDays ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Leave Days
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="yellow.700">
                {monthlySummary?.totals?.totalLeaveDays ?? 0}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="14px" p={3}>
              <Text fontSize="xs" color="gray.500">
                Total Payable
              </Text>
              <Text mt={1} fontSize="xl" fontWeight="800" color="blue.700">
                {Number(monthlySummary?.totals?.totalPayable ?? 0).toLocaleString('en-IN')}
              </Text>
            </Box>
          </GridItem>
        </Grid>

        <Box mt={4}>
          <CommonTable
            columns={[
              { key: 'name', header: 'Staff', render: (row: any) => row.name },
              { key: 'role', header: 'Role', render: (row: any) => row.role || '-' },
              {
                key: 'sundayPolicy',
                header: 'Sunday Rule',
                render: (row: any) =>
                  row.sundayPolicy === 'paid_off'
                    ? 'Off + full pay'
                    : row.sundayPolicy === 'halfday_paid_full'
                      ? 'Half day = full pay'
                      : 'Regular',
              },
              {
                key: 'attendance',
                header: 'P/H/A/L',
                render: (row: any) =>
                  `${row.attendance.present}/${row.attendance.halfday}/${row.attendance.absent}/${row.attendance.leave}`,
              },
              {
                key: 'paidSundayDays',
                header: 'Paid Sundays',
                render: (row: any) => row.paidSundayDays ?? 0,
              },
              {
                key: 'payableDays',
                header: 'Payable Days',
                render: (row: any) => Number(row.payableDays || 0).toFixed(1),
              },
              {
                key: 'monthlyRate',
                header: 'Monthly Rate',
                render: (row: any) => `${Number(row.monthlyRate || 0).toLocaleString('en-IN')}`,
              },
              {
                key: 'payableAmount',
                header: 'Salary Payable',
                render: (row: any) => `${Number(row.payableAmount || 0).toLocaleString('en-IN')}`,
              },
            ]}
            data={monthlySummary?.summary ?? []}
            isLoading={isMonthlyLoading}
            rowKey={(row: any) => row.staffId}
            emptyMessage="No data for selected month."
          />
        </Box>
      </Box>
    </Flex>
  )
}

export default Attendance
