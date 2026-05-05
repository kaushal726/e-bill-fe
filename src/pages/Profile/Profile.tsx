import {
  Avatar,
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Grid,
  HStack,
  Input,
  Stack,
  Text,
  Heading,
  Skeleton,
  SkeletonText,
  VStack,
  Textarea,
  Separator,
  SimpleGrid,
} from '@chakra-ui/react'
import '@/styles/products.css'
import { useProfile } from '@/hooks/useProfile.ts'
import { ToasterUtil } from '@/components/common/ToasterUtil.tsx'
import { useProfileActions } from '@/hooks/useProfileActions'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AxiosError } from 'axios'
import { Plus, Trash2, Copy, Building2, Check } from 'lucide-react'
import type { BankAccount } from '@/hooks/useProfileActions'

type ProfileFormValues = {
  firstName: string
  lastName: string
  mobileNumber: string
  shopName: string
  gstin: string
  address: string
  pincode: string
}

const emptyBank: BankAccount = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
}

function Profile() {
  const { data, isLoading, isError } = useProfile()
  const { updateProfile } = useProfileActions()
  const toast = ToasterUtil()
  const dispatch = useDispatch()

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [addingBank, setAddingBank] = useState(false)
  const [newBank, setNewBank] = useState<BankAccount>(emptyBank)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      shopName: '',
      gstin: '',
      address: '',
      pincode: '',
    },
  })

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Admin Profile',
        subtitle: 'Manage your account identity, business details, and bank accounts',
      }),
    )
    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    if (!data) return
    reset({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      mobileNumber: data.mobileNumber || '',
      shopName: data.shopName || '',
      gstin: data.gstin || '',
      address: data.address || '',
      pincode: data.pincode || '',
    })
    setBankAccounts(data.bankAccounts || [])
  }, [data, reset])

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(
      { ...values, bankAccounts },
      {
        onSuccess: () => toast('Profile updated successfully', 'success'),
        onError: (error) => {
          if (error instanceof AxiosError) {
            toast(error.response?.data?.message || 'Unable to update profile', 'error')
            return
          }
          toast('Unable to update profile', 'error')
        },
      },
    )
  }

  function handleAddBank() {
    if (!newBank.bankName.trim() || !newBank.accountNumber.trim() || !newBank.ifscCode.trim()) {
      toast('Bank name, account number and IFSC are required', 'error')
      return
    }
    setBankAccounts((prev) => [...prev, { ...newBank, ifscCode: newBank.ifscCode.toUpperCase() }])
    setNewBank(emptyBank)
    setAddingBank(false)
  }

  function handleRemoveBank(index: number) {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  function handleCopyBank(bank: BankAccount, index: number) {
    const lines = [
      `Bank: ${bank.bankName}`,
      `Account Holder: ${bank.accountHolderName}`,
      `Account Number: ${bank.accountNumber}`,
      `IFSC: ${bank.ifscCode}`,
      bank.upiId ? `UPI: ${bank.upiId}` : '',
    ].filter(Boolean)
    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast('Bank details copied!', 'success')
  }

  const inputFocus = {
    borderColor: 'orange.300',
    boxShadow: '0 0 0 3px rgba(251,146,60,0.12)',
  }

  if (isLoading) {
    return (
      <Box maxW="920px" mx="auto" p={6}>
        <Flex align="center" gap={4}>
          <Skeleton height="60px" width="60px" borderRadius="50%" />
          <Box flex="1">
            <Skeleton height="20px" width="150px" mb={2} />
            <Skeleton height="16px" width="200px" />
          </Box>
        </Flex>
        <Box mt={6}>
          <SkeletonText mt="4" noOfLines={4} gap="4" />
        </Box>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box p={6}>
        <Text color="red.500">Error while fetching profile data.</Text>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box p={6}>
        <Text color="gray.500">No profile data found.</Text>
      </Box>
    )
  }

  const cardStyle = {
    bg: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '30px',
    p: { base: 5, md: 6 },
    boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
  }

  return (
    <Box
      minH="100%"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      bg="linear-gradient(180deg, #fffdf8 0%, #f8fafc 46%, #f0fdfa 100%)"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack maxW="1180px" mx="auto" gap={5}>
          {/* Row 1: Account info + Business identity */}
          <Grid templateColumns={{ base: '1fr', xl: '360px 1fr' }} gap={5} alignItems="start">
            {/* Left: Account info display */}
            <Box {...cardStyle}>
              <VStack align="start" gap={5}>
                <HStack justify="space-between" w="full" align="start">
                  <VStack align="start" gap={1}>
                    <Badge borderRadius="full" px={3} py={1} bg="gray.950" color="white">
                      Admin account
                    </Badge>
                    <Heading size="lg" color="gray.900">
                      {data.firstName} {data.lastName}
                    </Heading>
                    <Text color="gray.500">{data.shopName}</Text>
                  </VStack>

                  <Avatar.Root
                    size="xl"
                    bg="orange.100"
                    color="orange.700"
                    borderWidth="2px"
                    borderColor="orange.200"
                  >
                    <Avatar.Fallback>{data.firstName?.[0] ?? 'A'}</Avatar.Fallback>
                  </Avatar.Root>
                </HStack>

                {/* Email */}
                <Box
                  w="full"
                  p={4}
                  borderRadius="22px"
                  bg="linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)"
                  border="1px solid"
                  borderColor="orange.100"
                >
                  <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.12em"
                    color="orange.700"
                  >
                    Account email
                  </Text>
                  <Text mt={2} fontWeight="700" color="gray.900">
                    {data.emailId}
                  </Text>
                  <Text mt={1} fontSize="sm" color="gray.600">
                    Login and identity are managed from this address.
                  </Text>
                </Box>

                {/* GSTIN display */}
                {data.gstin && (
                  <Box
                    w="full"
                    p={4}
                    borderRadius="22px"
                    bg="linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)"
                    border="1px solid"
                    borderColor="green.100"
                  >
                    <Text
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="0.12em"
                      color="green.700"
                    >
                      GSTIN
                    </Text>
                    <Text mt={2} fontWeight="700" color="gray.900" fontFamily="mono">
                      {data.gstin}
                    </Text>
                  </Box>
                )}

                {/* Contact + Archive day grid */}
                <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                  <Box
                    p={4}
                    borderRadius="20px"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Contact
                    </Text>
                    <Text mt={2} fontWeight="700" color="gray.900">
                      {data.mobileNumber}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="20px"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Archive day
                    </Text>
                    <Text mt={2} fontWeight="700" color="gray.900">
                      {data.archiveDay ?? 0}
                    </Text>
                  </Box>
                </Grid>

                {/* Address display */}
                {(data.address || data.pincode) && (
                  <Box
                    w="full"
                    p={4}
                    borderRadius="22px"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                      mb={2}
                    >
                      Address
                    </Text>
                    {data.address && (
                      <Text fontWeight="600" color="gray.900" fontSize="sm">
                        {data.address}
                      </Text>
                    )}
                    {data.pincode && (
                      <Text color="gray.500" fontSize="xs" mt={1}>
                        PIN: {data.pincode}
                      </Text>
                    )}
                  </Box>
                )}

                {/* Bank count badge */}
                {bankAccounts.length > 0 && (
                  <HStack
                    w="full"
                    p={3}
                    borderRadius="14px"
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.100"
                    justify="space-between"
                  >
                    <HStack gap={2}>
                      <Building2 size={14} color="#2563eb" />
                      <Text fontSize="sm" fontWeight="600" color="blue.700">
                        Bank Accounts
                      </Text>
                    </HStack>
                    <Badge colorPalette="blue" borderRadius="full">
                      {bankAccounts.length}
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Right: Editable form fields */}
            <Box {...cardStyle}>
              <Stack gap={6}>
                <Box>
                  <Heading size="lg" color="gray.900">
                    Business identity
                  </Heading>
                  <Text mt={2} color="gray.500" maxW="640px">
                    Keep the account profile accurate so invoices, business details, and
                    merchant-facing records stay clean across the product.
                  </Text>
                </Box>

                <Stack gap={4}>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Field.Root>
                      <Field.Label>First Name</Field.Label>
                      <Input
                        {...register('firstName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Last Name</Field.Label>
                      <Input
                        {...register('lastName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                      />
                    </Field.Root>
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Field.Root>
                      <Field.Label>Mobile Number</Field.Label>
                      <Input
                        {...register('mobileNumber')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Shop Name</Field.Label>
                      <Input
                        {...register('shopName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                      />
                    </Field.Root>
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Field.Root>
                      <Field.Label>Email Address</Field.Label>
                      <Input
                        value={data.emailId}
                        size="lg"
                        bg="gray.50"
                        borderColor="gray.200"
                        readOnly
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Archive Day</Field.Label>
                      <Input
                        value={String(data.archiveDay ?? 0)}
                        size="lg"
                        bg="gray.50"
                        borderColor="gray.200"
                        readOnly
                      />
                    </Field.Root>
                  </Grid>

                  <Separator borderColor="gray.100" />

                  <Text
                    fontWeight="700"
                    color="gray.700"
                    fontSize="sm"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    GST & Location
                  </Text>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Field.Root>
                      <Field.Label>GSTIN</Field.Label>
                      <Input
                        {...register('gstin')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        textTransform="uppercase"
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Pincode</Field.Label>
                      <Input
                        {...register('pincode')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={inputFocus}
                        placeholder="e.g. 400001"
                      />
                    </Field.Root>
                  </Grid>

                  <Field.Root>
                    <Field.Label>Address</Field.Label>
                    <Textarea
                      {...register('address')}
                      bg="white"
                      borderColor="gray.200"
                      _focus={inputFocus}
                      placeholder="Street, area, city, state"
                      rows={2}
                    />
                  </Field.Root>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Row 2: Bank Accounts */}
          <Box {...cardStyle}>
            <Stack gap={5}>
              <HStack justify="space-between" align="center">
                <Box>
                  <Heading size="md" color="gray.900">
                    Bank Accounts
                  </Heading>
                  <Text mt={1} color="gray.500" fontSize="sm">
                    Add multiple bank accounts. Use the copy button to quickly share payment
                    details.
                  </Text>
                </Box>
                {!addingBank && (
                  <Button
                    size="sm"
                    bg="blue.600"
                    color="white"
                    onClick={() => setAddingBank(true)}
                    borderRadius="10px"
                  >
                    <HStack gap={1.5}>
                      <Plus size={14} />
                      <Text fontSize="sm" fontWeight="700">
                        Add Bank
                      </Text>
                    </HStack>
                  </Button>
                )}
              </HStack>

              {/* Existing bank accounts */}
              {bankAccounts.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {bankAccounts.map((bank, i) => (
                    <Box
                      key={i}
                      p={4}
                      borderRadius="20px"
                      bg="linear-gradient(135deg, #f8faff 0%, #ffffff 100%)"
                      border="1px solid"
                      borderColor="blue.100"
                      boxShadow="0 2px 8px rgba(37,99,235,0.06)"
                    >
                      <HStack justify="space-between" mb={3}>
                        <HStack gap={2}>
                          <Box p={1.5} borderRadius="8px" bg="blue.50" color="blue.600">
                            <Building2 size={14} />
                          </Box>
                          <Text fontWeight="700" fontSize="sm" color="gray.900" noOfLines={1}>
                            {bank.bankName || 'Unnamed Bank'}
                          </Text>
                        </HStack>
                        <HStack gap={1}>
                          <Button
                            size="xs"
                            bg={copiedIndex === i ? 'green.50' : 'gray.50'}
                            color={copiedIndex === i ? 'green.600' : 'gray.600'}
                            border="1px solid"
                            borderColor={copiedIndex === i ? 'green.200' : 'gray.200'}
                            onClick={() => handleCopyBank(bank, i)}
                            borderRadius="8px"
                          >
                            {copiedIndex === i ? <Check size={11} /> : <Copy size={11} />}
                          </Button>
                          <Button
                            size="xs"
                            bg="red.50"
                            color="red.500"
                            border="1px solid"
                            borderColor="red.100"
                            onClick={() => handleRemoveBank(i)}
                            borderRadius="8px"
                          >
                            <Trash2 size={11} />
                          </Button>
                        </HStack>
                      </HStack>

                      <VStack align="start" gap={1.5}>
                        {bank.accountHolderName && (
                          <Box>
                            <Text
                              fontSize="xs"
                              color="gray.400"
                              textTransform="uppercase"
                              letterSpacing="0.06em"
                            >
                              Holder
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="gray.800">
                              {bank.accountHolderName}
                            </Text>
                          </Box>
                        )}
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                          >
                            Account No.
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.800" fontFamily="mono">
                            {bank.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            textTransform="uppercase"
                            letterSpacing="0.06em"
                          >
                            IFSC
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.800" fontFamily="mono">
                            {bank.ifscCode}
                          </Text>
                        </Box>
                        {bank.upiId && (
                          <Box>
                            <Text
                              fontSize="xs"
                              color="gray.400"
                              textTransform="uppercase"
                              letterSpacing="0.06em"
                            >
                              UPI
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="purple.700">
                              {bank.upiId}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}

              {bankAccounts.length === 0 && !addingBank && (
                <Box
                  p={5}
                  borderRadius="20px"
                  bg="gray.50"
                  border="1px dashed"
                  borderColor="gray.200"
                  textAlign="center"
                >
                  <Building2 size={28} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                  <Text color="gray.500" fontSize="sm">
                    No bank accounts added yet. Click "Add Bank" to add one.
                  </Text>
                </Box>
              )}

              {/* Add bank form */}
              {addingBank && (
                <Box
                  p={5}
                  borderRadius="20px"
                  bg="blue.50"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <Text fontWeight="700" color="blue.800" mb={4} fontSize="sm">
                    New Bank Account
                  </Text>
                  <Stack gap={3}>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                      <Field.Root>
                        <Field.Label fontSize="xs">Bank Name *</Field.Label>
                        <Input
                          value={newBank.bankName}
                          onChange={(e) => setNewBank((p) => ({ ...p, bankName: e.target.value }))}
                          placeholder="e.g. HDFC Bank"
                          bg="white"
                          borderColor="blue.200"
                          size="sm"
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label fontSize="xs">Account Holder Name</Field.Label>
                        <Input
                          value={newBank.accountHolderName}
                          onChange={(e) =>
                            setNewBank((p) => ({ ...p, accountHolderName: e.target.value }))
                          }
                          placeholder="Name on account"
                          bg="white"
                          borderColor="blue.200"
                          size="sm"
                        />
                      </Field.Root>
                    </Grid>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                      <Field.Root>
                        <Field.Label fontSize="xs">Account Number *</Field.Label>
                        <Input
                          value={newBank.accountNumber}
                          onChange={(e) =>
                            setNewBank((p) => ({ ...p, accountNumber: e.target.value }))
                          }
                          placeholder="Bank account number"
                          bg="white"
                          borderColor="blue.200"
                          size="sm"
                          fontFamily="mono"
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label fontSize="xs">IFSC Code *</Field.Label>
                        <Input
                          value={newBank.ifscCode}
                          onChange={(e) =>
                            setNewBank((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))
                          }
                          placeholder="e.g. HDFC0001234"
                          bg="white"
                          borderColor="blue.200"
                          size="sm"
                          fontFamily="mono"
                          textTransform="uppercase"
                        />
                      </Field.Root>
                    </Grid>
                    <Field.Root>
                      <Field.Label fontSize="xs">UPI ID (optional)</Field.Label>
                      <Input
                        value={newBank.upiId}
                        onChange={(e) => setNewBank((p) => ({ ...p, upiId: e.target.value }))}
                        placeholder="e.g. name@upi"
                        bg="white"
                        borderColor="blue.200"
                        size="sm"
                      />
                    </Field.Root>
                    <HStack justify="flex-end" gap={2}>
                      <Button
                        size="sm"
                        bg="white"
                        color="gray.700"
                        border="1px solid"
                        borderColor="gray.200"
                        onClick={() => {
                          setAddingBank(false)
                          setNewBank(emptyBank)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" bg="blue.600" color="white" onClick={handleAddBank}>
                        Add Bank
                      </Button>
                    </HStack>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Save button */}
          <Flex justify="flex-end">
            <Button
              type="submit"
              size="lg"
              borderRadius="18px"
              bg="linear-gradient(135deg, #f97316 0%, #0ea5e9 100%)"
              color="white"
              px={8}
              loading={updateProfile.isPending}
            >
              Save changes
            </Button>
          </Flex>
        </Stack>
      </form>
    </Box>
  )
}

export default Profile
