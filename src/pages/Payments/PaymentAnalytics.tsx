import { Box, Flex, HStack, SimpleGrid, Text, VStack, Badge, Button } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { usePaymentAnalytics } from '@/hooks/usePayment'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0))

const PaymentAnalytics = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, isLoading } = usePaymentAnalytics()

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Total Payment Info',
        subtitle: 'Simple and clear payment analytics overview',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const modeRows = useMemo(
    () => [
      { label: 'Cash', value: data?.paymentModeBreakdown?.cash || 0 },
      { label: 'UPI', value: data?.paymentModeBreakdown?.upi || 0 },
      { label: 'Bank', value: data?.paymentModeBreakdown?.bank || 0 },
      { label: 'Other', value: data?.paymentModeBreakdown?.other || 0 },
    ],
    [data?.paymentModeBreakdown],
  )

  return (
    <Flex
      bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
      width="100%"
      minH="100%"
      flexDir="column"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      overflowY="auto"
      gap={4}
    >
      <HStack>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/payments')}
          px={2}
          color="gray.600"
          _hover={{ bg: 'gray.100', color: 'gray.900' }}
        >
          <HStack gap={1.5}>
            <ArrowLeft size={15} />
            <Text fontSize="sm">Back to Payments</Text>
          </HStack>
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
        <Box
          bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
          border="1px solid"
          borderColor="teal.100"
          borderRadius="14px"
          p={2.5}
          boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
        >
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            To Collect (Customers)
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="blue.600">
            {fmt(data?.summary?.totalToCollectFromCustomers || 0)}
          </Text>
        </Box>

        <Box
          bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
          border="1px solid"
          borderColor="teal.100"
          borderRadius="14px"
          p={2.5}
          boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
        >
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            To Pay (Suppliers)
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="orange.600">
            {fmt(data?.summary?.totalToPaySuppliers || 0)}
          </Text>
        </Box>

        <Box
          bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
          border="1px solid"
          borderColor="teal.100"
          borderRadius="14px"
          p={2.5}
          boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
        >
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            Net Outstanding
          </Text>
          <Text
            mt={1}
            fontSize="xl"
            fontWeight="800"
            color={(data?.summary?.netOutstanding || 0) >= 0 ? 'green.600' : 'red.600'}
          >
            {fmt(data?.summary?.netOutstanding || 0)}
          </Text>
        </Box>

        <Box
          bg="linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)"
          border="1px solid"
          borderColor="teal.100"
          borderRadius="14px"
          p={2.5}
          boxShadow="0 8px 20px rgba(13, 116, 123, 0.08)"
        >
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            Transactions
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
            {data?.summary?.totalPaymentTransactions || 0}
          </Text>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
            Payment Mode Breakdown
          </Text>
          <VStack align="stretch" gap={2}>
            {modeRows.map((row) => (
              <Flex key={row.label} justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  {row.label}
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.900">
                  {fmt(row.value)}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
            Count Summary
          </Text>
          <SimpleGrid columns={2} gap={2}>
            <Badge colorPalette="blue" p={2} borderRadius="8px">
              Customer Due: {data?.counts?.customerDueCount || 0}
            </Badge>
            <Badge colorPalette="green" p={2} borderRadius="8px">
              Customer Advance: {data?.counts?.customerAdvanceCount || 0}
            </Badge>
            <Badge colorPalette="orange" p={2} borderRadius="8px">
              Supplier Due: {data?.counts?.supplierDueCount || 0}
            </Badge>
            <Badge colorPalette="purple" p={2} borderRadius="8px">
              Supplier Advance: {data?.counts?.supplierAdvanceCount || 0}
            </Badge>
          </SimpleGrid>
          <HStack mt={3} gap={3}>
            <Text fontSize="sm" color="gray.600">
              Supplier Payments:{' '}
              <Text as="span" fontWeight="700">
                {data?.counts?.supplierPaymentsCount || 0}
              </Text>
            </Text>
            <Text fontSize="sm" color="gray.600">
              Customer Payments:{' '}
              <Text as="span" fontWeight="700">
                {data?.counts?.customerPaymentsCount || 0}
              </Text>
            </Text>
          </HStack>
        </Box>
      </SimpleGrid>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="16px"
        p={4}
        cursor="pointer"
        _hover={{ borderColor: 'gray.300', shadow: 'sm' }}
        onClick={() => navigate('/payments/dues')}
      >
        <Flex align="center" justify="space-between">
          <VStack align="start" gap={0.5}>
            <Text fontSize="sm" fontWeight="700" color="gray.800">
              Outstanding Dues
            </Text>
            <Text fontSize="xs" color="gray.500">
              Dues alag page par dekhein - supplier aur customer full breakdown
            </Text>
          </VStack>
          <HStack gap={1.5} color="blue.600" fontWeight="600" fontSize="sm">
            <Text>Open Dues</Text>
            <ArrowRight size={15} />
          </HStack>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
            Top Supplier Payables
          </Text>
          <VStack align="stretch" gap={2}>
            {(data?.actionables?.topSupplierPayables || []).length === 0 && !isLoading ? (
              <Text fontSize="sm" color="gray.500">
                No supplier payable items
              </Text>
            ) : (
              (data?.actionables?.topSupplierPayables || []).map((row, index) => (
                <Flex
                  key={`${row.partyId || 'sup'}-${index}`}
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                      {row.partyName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {row.mobileNumber || '-'}
                    </Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="700" color="orange.600">
                    {fmt(row.amount)}
                  </Text>
                </Flex>
              ))
            )}
          </VStack>
        </Box>

        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4}>
          <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
            Top Customer Receivables
          </Text>
          <VStack align="stretch" gap={2}>
            {(data?.actionables?.topCustomerReceivables || []).length === 0 && !isLoading ? (
              <Text fontSize="sm" color="gray.500">
                No customer receivable items
              </Text>
            ) : (
              (data?.actionables?.topCustomerReceivables || []).map((row, index) => (
                <Flex
                  key={`${row.partyId || 'cus'}-${index}`}
                  justify="space-between"
                  align="center"
                >
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                      {row.partyName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {row.mobileNumber || '-'}
                    </Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="700" color="blue.600">
                    {fmt(row.amount)}
                  </Text>
                </Flex>
              ))
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4}>
        <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
          Recent Payments
        </Text>

        <VStack align="stretch" gap={2}>
          {(data?.recentPayments || []).length === 0 && !isLoading ? (
            <Text fontSize="sm" color="gray.500">
              No recent payments
            </Text>
          ) : (
            (data?.recentPayments || []).map((payment) => (
              <Flex
                key={payment._id}
                justify="space-between"
                align="center"
                p={2}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="10px"
              >
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    {payment.partyName ||
                      payment.supplierId?.name ||
                      payment.customerId?.name ||
                      '-'}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                    {payment.paidToType} {payment.paymentMode}
                  </Text>
                </VStack>
                <VStack align="end" gap={0}>
                  <Text fontSize="sm" fontWeight="700" color="gray.900">
                    {fmt(payment.amount)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                      : '-'}
                  </Text>
                </VStack>
              </Flex>
            ))
          )}
        </VStack>
      </Box>
    </Flex>
  )
}

export default PaymentAnalytics
