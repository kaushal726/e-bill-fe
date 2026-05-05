import { Flex, HStack, Text, Button, Box, SimpleGrid, VStack, Badge } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { usePaymentDues, usePaymentSummary } from '@/hooks/usePayment'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

const PaymentDues = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: duesData, isLoading } = usePaymentDues()
  const { data: summary } = usePaymentSummary()

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Outstanding Dues',
        subtitle: 'Who owes you and who you owe',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  const supplierTotal =
    duesData?.suppliers?.reduce((acc, r) => acc + Number(r.totalDue ?? r.totalAmount ?? 0), 0) ?? 0

  const customerTotal =
    duesData?.customers?.reduce((acc, r) => acc + Number(r.totalDue ?? r.totalAmount ?? 0), 0) ?? 0

  return (
    <Flex
      bg="linear-gradient(180deg, #eef2f6 0%, #e8edf3 48%, #e2e8f0 100%)"
      width="100%"
      minH="100%"
      flexDir="column"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      overflowY="auto"
    >
      {/* Back button */}
      <HStack mb={4}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/payments')}
          px={2}
          color="gray.600"
        >
          <HStack gap={1.5}>
            <ArrowLeft size={15} />
            <Text fontSize="sm">Back to Payments</Text>
          </HStack>
        </Button>
      </HStack>

      {/* Summary counters */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={5}>
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            Total Suppliers
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
            {duesData?.suppliers?.length ?? 0}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            parties with dues
          </Text>
        </Box>
        <Box bg="white" border="1px solid" borderColor="orange.100" borderRadius="16px" p={3}>
          <Text fontSize="xs" color="orange.500" textTransform="uppercase" letterSpacing="0.06em">
            You Owe Suppliers
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="orange.600">
            {fmt(supplierTotal)}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            total outstanding
          </Text>
        </Box>
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={3}>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
            Total Customers
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="gray.900">
            {duesData?.customers?.length ?? 0}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            parties with dues
          </Text>
        </Box>
        <Box bg="white" border="1px solid" borderColor="blue.100" borderRadius="16px" p={3}>
          <Text fontSize="xs" color="blue.500" textTransform="uppercase" letterSpacing="0.06em">
            Customers Owe You
          </Text>
          <Text mt={1} fontSize="xl" fontWeight="800" color="blue.600">
            {fmt(customerTotal)}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            total receivable
          </Text>
        </Box>
      </SimpleGrid>

      {/* Net position */}
      {summary && (
        <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="16px" p={4} mb={5}>
          <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
                Net Position
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="800"
                color={customerTotal - supplierTotal >= 0 ? 'green.600' : 'red.600'}
              >
                {fmt(Math.abs(customerTotal - supplierTotal))}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {customerTotal - supplierTotal >= 0
                  ? 'You will receive more than you owe'
                  : 'You owe more than you will receive'}
              </Text>
            </VStack>
            <HStack gap={6}>
              <VStack align="center" gap={0}>
                <Text fontSize="xs" color="blue.500" fontWeight="600">
                  Receivable
                </Text>
                <Text fontSize="lg" fontWeight="700" color="blue.600">
                  {fmt(customerTotal)}
                </Text>
              </VStack>
              <Text fontSize="xl" color="gray.300" fontWeight="300">
                −
              </Text>
              <VStack align="center" gap={0}>
                <Text fontSize="xs" color="orange.500" fontWeight="600">
                  Payable
                </Text>
                <Text fontSize="lg" fontWeight="700" color="orange.600">
                  {fmt(supplierTotal)}
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* Dues panels */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* Suppliers — you owe them */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="orange.100"
          borderRadius="16px"
          overflow="hidden"
        >
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="orange.50"
            borderBottom="1px solid"
            borderColor="orange.100"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="700" color="orange.800">
                Suppliers — You Owe Them
              </Text>
              <Text fontSize="xs" color="orange.600">
                Outstanding payments to suppliers
              </Text>
            </VStack>
            <Badge colorPalette="orange" fontSize="xs" px={2} py={1} borderRadius="8px">
              {duesData?.suppliers?.length ?? 0} parties
            </Badge>
          </Flex>
          <Box>
            {isLoading ? (
              <Flex align="center" justify="center" h="80px">
                <Text fontSize="sm" color="gray.400">
                  Loading...
                </Text>
              </Flex>
            ) : !duesData?.suppliers?.length ? (
              <Flex align="center" justify="center" h="80px">
                <Text fontSize="sm" color="gray.400">
                  No pending supplier dues
                </Text>
              </Flex>
            ) : (
              duesData.suppliers.map((row, idx) => (
                <Flex
                  key={row.partyId ?? `sup-${idx}`}
                  align="center"
                  justify="space-between"
                  px={4}
                  py={3}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                >
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                      {row.partyName}
                    </Text>
                    {row.mobileNumber && (
                      <Text fontSize="xs" color="gray.400">
                        {row.mobileNumber}
                      </Text>
                    )}
                    {row.transactionCount != null && (
                      <Text fontSize="xs" color="gray.400">
                        {row.transactionCount} transaction{row.transactionCount !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" gap={0}>
                    <Text fontSize="sm" fontWeight="700" color="orange.600">
                      {fmt(Number(row.totalDue ?? row.totalAmount ?? 0))}
                    </Text>
                    {row.lastTransactionDate && (
                      <Text fontSize="xs" color="gray.400">
                        Last: {new Date(row.lastTransactionDate).toLocaleDateString('en-IN')}
                      </Text>
                    )}
                  </VStack>
                </Flex>
              ))
            )}
          </Box>
        </Box>

        {/* Customers — they owe you */}
        <Box
          bg="white"
          border="1px solid"
          borderColor="blue.100"
          borderRadius="16px"
          overflow="hidden"
        >
          <Flex
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="blue.50"
            borderBottom="1px solid"
            borderColor="blue.100"
          >
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="700" color="blue.800">
                Customers — They Owe You
              </Text>
              <Text fontSize="xs" color="blue.600">
                Outstanding receivables from customers
              </Text>
            </VStack>
            <Badge colorPalette="blue" fontSize="xs" px={2} py={1} borderRadius="8px">
              {duesData?.customers?.length ?? 0} parties
            </Badge>
          </Flex>
          <Box>
            {isLoading ? (
              <Flex align="center" justify="center" h="80px">
                <Text fontSize="sm" color="gray.400">
                  Loading...
                </Text>
              </Flex>
            ) : !duesData?.customers?.length ? (
              <Flex align="center" justify="center" h="80px">
                <Text fontSize="sm" color="gray.400">
                  No pending customer dues
                </Text>
              </Flex>
            ) : (
              duesData.customers.map((row, idx) => (
                <Flex
                  key={row.partyId ?? `cus-${idx}`}
                  align="center"
                  justify="space-between"
                  px={4}
                  py={3}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                >
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                      {row.partyName}
                    </Text>
                    {row.mobileNumber && (
                      <Text fontSize="xs" color="gray.400">
                        {row.mobileNumber}
                      </Text>
                    )}
                    {row.transactionCount != null && (
                      <Text fontSize="xs" color="gray.400">
                        {row.transactionCount} transaction{row.transactionCount !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" gap={0}>
                    <Text fontSize="sm" fontWeight="700" color="blue.600">
                      {fmt(Number(row.totalDue ?? row.totalAmount ?? 0))}
                    </Text>
                    {row.lastTransactionDate && (
                      <Text fontSize="xs" color="gray.400">
                        Last: {new Date(row.lastTransactionDate).toLocaleDateString('en-IN')}
                      </Text>
                    )}
                  </VStack>
                </Flex>
              ))
            )}
          </Box>
        </Box>
      </SimpleGrid>
    </Flex>
  )
}

export default PaymentDues
