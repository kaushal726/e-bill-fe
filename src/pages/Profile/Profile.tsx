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
} from '@chakra-ui/react'
import '@/styles/products.css'
import { useProfile } from '@/hooks/useProfile.ts'
import { ToasterUtil } from '@/components/common/ToasterUtil.tsx'
import { useProfileActions } from '@/hooks/useProfileActions'
import { setHeader, clearHeader } from '@/redux/slices/headerSlice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AxiosError } from 'axios'

type ProfileFormValues = {
  firstName: string
  lastName: string
  mobileNumber: string
  shopName: string
}

function Profile() {
  const { data, isLoading, isError } = useProfile()
  const { updateProfile } = useProfileActions()
  const toast = ToasterUtil()
  const dispatch = useDispatch()
  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      shopName: '',
    },
  })

  useEffect(() => {
    dispatch(
      setHeader({
        title: 'Admin Profile',
        subtitle: 'Manage your account identity, business name, and contact details',
      }),
    )

    return () => {
      dispatch(clearHeader())
    }
  }, [dispatch])

  useEffect(() => {
    if (!data) {
      return
    }

    reset({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      mobileNumber: data.mobileNumber || '',
      shopName: data.shopName || '',
    })
  }, [data, reset])

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => {
        toast('Profile updated successfully', 'success')
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast(error.response?.data?.message || 'Unable to update profile', 'error')
          return
        }

        toast('Unable to update profile', 'error')
      },
    })
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

  return (
    <Box
      minH="100%"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      bg="linear-gradient(180deg, #fffdf8 0%, #f8fafc 46%, #f0fdfa 100%)"
    >
      <Stack maxW="1180px" mx="auto" gap={5}>
        <Grid templateColumns={{ base: '1fr', xl: '360px 1fr' }} gap={5} alignItems="start">
          <Box
            bg="rgba(255,255,255,0.92)"
            border="1px solid rgba(255,255,255,0.8)"
            backdropFilter="blur(14px)"
            borderRadius="30px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 12px 32px rgba(15,23,42,0.08)"
          >
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

              <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
                <Box p={4} borderRadius="20px" bg="white" border="1px solid" borderColor="gray.100">
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

                <Box p={4} borderRadius="20px" bg="white" border="1px solid" borderColor="gray.100">
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                  >
                    Archive day
                  </Text>
                  <Text mt={2} fontWeight="700" color="gray.900">
                    {data.archiveDay}
                  </Text>
                </Box>
              </Grid>
            </VStack>
          </Box>

          <Box
            bg="rgba(255,255,255,0.92)"
            border="1px solid rgba(255,255,255,0.8)"
            backdropFilter="blur(14px)"
            borderRadius="30px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 12px 32px rgba(15,23,42,0.08)"
          >
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

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={5}>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <Field.Root>
                      <Field.Label>First Name</Field.Label>
                      <Input
                        {...register('firstName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: 'orange.300',
                          boxShadow: '0 0 0 3px rgba(251,146,60,0.12)',
                        }}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Last Name</Field.Label>
                      <Input
                        {...register('lastName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: 'orange.300',
                          boxShadow: '0 0 0 3px rgba(251,146,60,0.12)',
                        }}
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
                        _focus={{
                          borderColor: 'orange.300',
                          boxShadow: '0 0 0 3px rgba(251,146,60,0.12)',
                        }}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Shop Name</Field.Label>
                      <Input
                        {...register('shopName')}
                        size="lg"
                        bg="white"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: 'orange.300',
                          boxShadow: '0 0 0 3px rgba(251,146,60,0.12)',
                        }}
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

                  <Flex justify="flex-end">
                    <Button
                      type="submit"
                      size="lg"
                      borderRadius="18px"
                      bg="linear-gradient(135deg, #f97316 0%, #0ea5e9 100%)"
                      color="white"
                      px={7}
                      loading={updateProfile.isPending}
                    >
                      Save changes
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Stack>
          </Box>
        </Grid>
      </Stack>
    </Box>
  )
}

export default Profile
