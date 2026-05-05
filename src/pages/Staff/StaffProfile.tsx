import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
  Skeleton,
  Button,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Calendar, User, IndianRupee, TrendingUp } from 'lucide-react'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useAllStaff } from '@/hooks/useStaff'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'

const statusColor: Record<string, string> = {
  present: 'green',
  halfday: 'yellow',
  absent: 'red',
  leave: 'blue',
}

const statusLabel: Record<string, string> = {
  present: 'Present',
  halfday: 'Half Day',
  absent: 'Absent',
  leave: 'Leave',
}

const sundayPolicyLabel: Record<string, string> = {
  regular: 'Regular',
  paid_off: 'Sunday Off (Full Pay)',
  halfday_paid_full: 'Sunday Half Day (Full Pay)',
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

function getMonthRange(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getLast12Months() {
  const months = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    months.push({ value: val, label })
  }
  return months
}

export default function StaffProfile() {
  const { staffId } = useParams<{ staffId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const months = useMemo(() => getLast12Months(), [])

  const { startDate, endDate } = useMemo(() => getMonthRange(selectedMonth), [selectedMonth])

  const { data: staffList = [] } = useAllStaff()
  const staff = useMemo(() => staffList.find((s: any) => s._id === staffId), [staffList, staffId])

  // Monthly salary summary (all staff, filter to this one)
  const { data: salaryData, isLoading: salaryLoading } = useQuery({
    queryKey: ['monthlySalary', selectedMonth],
    queryFn: () =>
      API.get(`${API_ENDPOINTS.ATTENDANCE.MONTHLY_SALARY}?month=${selectedMonth}`).then(
        (res) => res.data?.data ?? res.data,
      ),
    enabled: !!staffId,
    staleTime: 60 * 1000,
  })

  const staffSalaryRow = useMemo(
    () => salaryData?.summary?.find((r: any) => String(r.staffId) === staffId),
    [salaryData, staffId],
  )

  // Monthly incentive for this staff
  const { data: incentiveData, isLoading: incentiveLoading } = useQuery({
    queryKey: ['staffMonthlyIncentive', staffId, selectedMonth],
    queryFn: () =>
      API.get(
        `${API_ENDPOINTS.SALE.STAFF_MONTHLY_INCENTIVE}/${staffId}?month=${selectedMonth}`,
      ).then((res) => res.data?.data ?? res.data),
    enabled: !!staffId,
    staleTime: 60 * 1000,
  })

  // Attendance records for this month
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['staffAttendance', staffId, startDate, endDate],
    queryFn: () =>
      API.get(
        `${API_ENDPOINTS.ATTENDANCE.STAFF}/${staffId}?startDate=${startDate}&endDate=${endDate}`,
      ).then((res) => res.data?.data ?? res.data),
    enabled: !!staffId,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Staff Profile',
        subtitle: staff?.name ?? '',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch, staff?.name])

  if (!staff && staffList.length > 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">Staff not found.</Text>
        <Button mt={4} onClick={() => navigate('/staff')}>
          Back to Staff
        </Button>
      </Box>
    )
  }

  const staffCode = staff ? `BS${staff._id.slice(-8).toUpperCase()}` : '—'
  const joinDate = staff?.joinDate
    ? new Date(staff.joinDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  const payableAmount = staffSalaryRow?.payableAmount ?? 0
  const monthlyRate = staffSalaryRow?.monthlyRate ?? staff?.baseSalary ?? 0
  const perDayRate = staffSalaryRow?.perDayRate ?? 0
  const attendance = staffSalaryRow?.attendance ?? { present: 0, halfday: 0, absent: 0, leave: 0 }
  const payableDays = staffSalaryRow?.payableDays ?? 0
  const totalIncentive = incentiveData?.totalIncentive ?? 0
  const incentiveSales = incentiveData?.saleCount ?? 0

  const totalEarned = payableAmount + totalIncentive

  return (
    <Box
      minH="100%"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      bg="linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"
    >
      <VStack align="stretch" gap={5} maxW="1100px" mx="auto">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          w="fit-content"
          color="gray.600"
          px={2}
          onClick={() => navigate('/staff')}
        >
          <HStack gap={1}>
            <ArrowLeft size={15} />
            <Text fontSize="sm">Back to Staff</Text>
          </HStack>
        </Button>

        {/* Profile card */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid"
          borderColor="gray.100"
          p={{ base: 4, md: 6 }}
          boxShadow="0 2px 10px rgba(0,0,0,0.04)"
        >
          {!staff ? (
            <HStack gap={4}>
              <Skeleton borderRadius="full" w="72px" h="72px" />
              <VStack align="start" gap={2} flex={1}>
                <Skeleton h="22px" w="200px" />
                <Skeleton h="16px" w="140px" />
              </VStack>
            </HStack>
          ) : (
            <Flex gap={5} align="start" wrap="wrap">
              {/* Avatar */}
              <Box
                w="72px"
                h="72px"
                borderRadius="full"
                bg="teal.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text fontSize="2xl" fontWeight="800" color="white">
                  {staff.name.charAt(0).toUpperCase()}
                </Text>
              </Box>

              <VStack align="start" gap={1.5} flex={1} minW="200px">
                <HStack gap={2} wrap="wrap">
                  <Text fontSize="xl" fontWeight="800" color="gray.900">
                    {staff.name}
                  </Text>
                  <Badge
                    colorPalette={staff.isActive ? 'green' : 'red'}
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </HStack>

                <HStack gap={2} wrap="wrap">
                  <Badge colorPalette="purple" borderRadius="full" fontSize="xs" px={2}>
                    {staff.role}
                  </Badge>
                  <Badge
                    colorPalette="gray"
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                    fontFamily="mono"
                  >
                    {staffCode}
                  </Badge>
                </HStack>

                <HStack gap={4} wrap="wrap" mt={1}>
                  <HStack gap={1.5} color="gray.500">
                    <Phone size={13} />
                    <Text fontSize="sm">{staff.mobileNumber}</Text>
                  </HStack>
                  <HStack gap={1.5} color="gray.500">
                    <Calendar size={13} />
                    <Text fontSize="sm">Joined {joinDate}</Text>
                  </HStack>
                  <HStack gap={1.5} color="gray.500">
                    <User size={13} />
                    <Text fontSize="sm">{sundayPolicyLabel[staff.sundayPolicy] ?? 'Regular'}</Text>
                  </HStack>
                </HStack>
              </VStack>

              {/* Salary info */}
              <VStack align="end" gap={1} flexShrink={0}>
                <HStack gap={1}>
                  <IndianRupee size={14} color="#0f766e" />
                  <Text fontSize="xl" fontWeight="800" color="teal.700">
                    {fmt(staff.baseSalary)}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  Monthly Base
                </Text>
                {staff.salaryPerWeek > 0 && (
                  <>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      {fmt(staff.salaryPerWeek)} / week
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Weekly Rate
                    </Text>
                  </>
                )}
              </VStack>
            </Flex>
          )}
        </Box>

        {/* Month selector */}
        <HStack gap={3} justify="space-between" wrap="wrap">
          <Text fontSize="md" fontWeight="700" color="gray.800">
            Monthly Summary
          </Text>
          <Box>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                height: '36px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0 12px',
                background: 'white',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Box>
        </HStack>

        {/* Summary cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
          {salaryLoading || incentiveLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="100px" borderRadius="16px" />
            ))
          ) : (
            <>
              <Box
                bg="linear-gradient(135deg,#f0fdf4 0%,#fff 100%)"
                borderRadius="16px"
                border="1px solid"
                borderColor="green.100"
                p={4}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Salary Earned
                </Text>
                <Text fontSize="xl" fontWeight="800" color="green.700">
                  {fmt(payableAmount)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                  {payableDays} days × {fmt(perDayRate)}/day
                </Text>
              </Box>

              <Box
                bg="linear-gradient(135deg,#eff6ff 0%,#fff 100%)"
                borderRadius="16px"
                border="1px solid"
                borderColor="blue.100"
                p={4}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Incentive
                </Text>
                <Text fontSize="xl" fontWeight="800" color="blue.700">
                  {fmt(totalIncentive)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                  {incentiveSales} sale{incentiveSales !== 1 ? 's' : ''}
                </Text>
              </Box>

              <Box
                bg="linear-gradient(135deg,#faf5ff 0%,#fff 100%)"
                borderRadius="16px"
                border="1px solid"
                borderColor="purple.100"
                p={4}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Total Earnings
                </Text>
                <Text fontSize="xl" fontWeight="800" color="purple.700">
                  {fmt(totalEarned)}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                  salary + incentive
                </Text>
              </Box>

              <Box
                bg="linear-gradient(135deg,#fff7ed 0%,#fff 100%)"
                borderRadius="16px"
                border="1px solid"
                borderColor="orange.100"
                p={4}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={1}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Attendance
                </Text>
                <HStack gap={2} mt={1}>
                  <VStack gap={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="green.600">
                      {attendance.present}
                    </Text>
                    <Text fontSize="10px" color="gray.400">
                      Present
                    </Text>
                  </VStack>
                  <VStack gap={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="yellow.600">
                      {attendance.halfday}
                    </Text>
                    <Text fontSize="10px" color="gray.400">
                      Half
                    </Text>
                  </VStack>
                  <VStack gap={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="red.500">
                      {attendance.absent}
                    </Text>
                    <Text fontSize="10px" color="gray.400">
                      Absent
                    </Text>
                  </VStack>
                  <VStack gap={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="blue.500">
                      {attendance.leave}
                    </Text>
                    <Text fontSize="10px" color="gray.400">
                      Leave
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </>
          )}
        </SimpleGrid>

        {/* Monthly Salary reference */}
        {!salaryLoading && monthlyRate > 0 && (
          <Box
            bg="white"
            borderRadius="14px"
            border="1px solid"
            borderColor="gray.100"
            px={4}
            py={3}
          >
            <HStack gap={2} justify="space-between" wrap="wrap">
              <HStack gap={2}>
                <TrendingUp size={14} color="#0f766e" />
                <Text fontSize="sm" color="gray.600">
                  Monthly Rate: <strong>{fmt(monthlyRate)}</strong>
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Per-day Rate: <strong>{fmt(perDayRate)}</strong>
              </Text>
              <Text fontSize="sm" color="gray.600">
                Payable Days: <strong>{payableDays}</strong>
              </Text>
            </HStack>
          </Box>
        )}

        {/* Attendance records */}
        <Box
          bg="white"
          borderRadius="20px"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
          boxShadow="0 2px 8px rgba(0,0,0,0.03)"
        >
          <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              Attendance Records
            </Text>
          </Box>

          {attendanceLoading ? (
            <VStack gap={0} align="stretch" p={3}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} h="40px" mb={2} borderRadius="8px" />
              ))}
            </VStack>
          ) : attendanceRecords.length === 0 ? (
            <Box p={8} textAlign="center">
              <Text color="gray.400" fontSize="sm">
                No attendance records for this month.
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Box minW="400px">
                {/* Header row */}
                <SimpleGrid
                  columns={3}
                  px={4}
                  py={2}
                  bg="gray.50"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                    Date
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                    Day
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                    Status
                  </Text>
                </SimpleGrid>

                {attendanceRecords.map((rec: any) => {
                  const d = new Date(rec.date)
                  const dateStr = d.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  const dayStr = d.toLocaleDateString('en-IN', { weekday: 'long' })
                  const isSunday = d.getUTCDay() === 0

                  return (
                    <SimpleGrid
                      key={rec._id}
                      columns={3}
                      px={4}
                      py={2.5}
                      borderBottom="1px solid"
                      borderColor="gray.50"
                      bg={isSunday ? 'blue.50' : 'white'}
                      alignItems="center"
                    >
                      <Text fontSize="sm" color="gray.800" fontWeight="500">
                        {dateStr}
                      </Text>
                      <Text fontSize="sm" color={isSunday ? 'blue.600' : 'gray.600'}>
                        {dayStr}
                      </Text>
                      <Badge
                        colorPalette={statusColor[rec.status] ?? 'gray'}
                        borderRadius="full"
                        fontSize="xs"
                        px={2}
                        w="fit-content"
                      >
                        {statusLabel[rec.status] ?? rec.status}
                      </Badge>
                    </SimpleGrid>
                  )
                })}
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  )
}
