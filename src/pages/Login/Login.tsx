import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Flex,
  Field,
  Text,
  HStack,
  VStack,
  Separator,
} from '@chakra-ui/react'
import { PasswordInput } from '@/components/ui/password-input'
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { API } from '@/api/api'
import { useNavigate } from 'react-router-dom'
import { setProfile } from '@/redux/slices/profileSlice'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { clearLoading, setLoading } from '@/redux/slices/uiSlice'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { setAuthenticated } from '@/utils/authSession'
import { clearSubscriptionInactive } from '@/utils/subscriptionAccess'

const MotionFlex = motion(Flex)
const MotionBox = motion(Box)

interface FormValues {
  emailId: string
  password: string
}

const Login = () => {
  const toastFunc = ToasterUtil()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm<FormValues>()

  const onSubmit: SubmitHandler<FormValues> = async (creds) => {
    dispatch(setLoading({ loading: true, message: 'Logging in...' }))
    try {
      const res = await API.post(API_ENDPOINTS.AUTH.LOGIN, creds)

      if (res.status === 200) {
        setAuthenticated(true)
        clearSubscriptionInactive()
        dispatch(setProfile(res?.data?.data?.data))
        toastFunc('Logged in successfully', 'success')
        navigate('/dashboard')
        return
      }
    } catch (error) {
      console.error('Login error:', error)

      if (error instanceof AxiosError) {
        const msg = error.response?.data?.message || 'Invalid Credentials'
        toastFunc(msg, 'error')
      } else {
        toastFunc('Something Went Wrong', 'error')
      }
    } finally {
      dispatch(clearLoading())
    }
  }

  const onError = (errors: FieldErrors<FormValues>) => {
    Object.values(errors).forEach((err) => {
      toastFunc(err?.message || 'Fill the required fields', 'error')
    })
  }

  return (
    <MotionFlex
      w="100vw"
      h="100vh"
      bgGradient="linear-gradient(135deg, #070b16 0%, #0f172a 45%, #10203c 100%)"
      align="center"
      justify="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      overflow="hidden"
      position="relative"
      px={0}
    >
      {/* Decorative background */}
      <Box
        position="absolute"
        w="540px"
        h="540px"
        borderRadius="full"
        bgGradient="radial-gradient(circle, rgba(14,165,233,0.20), transparent)"
        top="-180px"
        right="-120px"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        w="460px"
        h="460px"
        borderRadius="full"
        bgGradient="radial-gradient(circle, rgba(249,115,22,0.18), transparent)"
        bottom="-120px"
        left="-100px"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <MotionFlex
        w="100%"
        h="100%"
        direction={{ base: 'column', lg: 'row' }}
        align="stretch"
        gap={0}
        position="relative"
        zIndex={2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <MotionBox
          flex={1.15}
          bg="linear-gradient(160deg, rgba(15,23,42,0.74) 0%, rgba(2,6,23,0.72) 100%)"
          borderRight={{ base: 'none', lg: '1px solid rgba(148,163,184,0.20)' }}
          px={{ base: 6, md: 10, lg: 16 }}
          py={{ base: 8, md: 10 }}
          display="flex"
          alignItems="center"
        >
          <VStack align="start" gap={7} maxW="720px">
            <Heading
              fontSize={{ base: '5xl', md: '7xl', xl: '8xl' }}
              lineHeight="0.9"
              color="white"
              fontFamily="'Notable', 'Poppins', sans-serif"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              E-Bill
            </Heading>

            <Heading
              fontSize={{ base: '2xl', md: '4xl', xl: '5xl' }}
              lineHeight="1.06"
              color="gray.100"
              fontWeight="800"
              letterSpacing="-0.02em"
            >
              Welcome Back. Run billing, inventory and collections without friction.
            </Heading>

            <Text color="gray.300" fontSize={{ base: 'md', md: 'xl' }} lineHeight="1.9">
              Create invoices in seconds, monitor stock movement, track dues, and unlock daily
              business insights from one clean command center.
            </Text>

            <Stack gap={2}>
              {[
                'Lightning-fast sales billing and invoice history',
                'Stock alerts before items run out',
                'Customer and supplier due control',
              ].map((line) => (
                <HStack key={line} gap={2.5}>
                  <Box w="8px" h="8px" borderRadius="full" bg="orange.400" />
                  <Text color="gray.200" fontSize="md" fontWeight="500">
                    {line}
                  </Text>
                </HStack>
              ))}
            </Stack>

            <HStack gap={3} pt={2} flexWrap="wrap">
              <Button
                asChild
                size="md"
                bg="whiteAlpha.200"
                color="white"
                borderRadius="full"
                px={6}
                _hover={{ bg: 'whiteAlpha.300' }}
              >
                <RouterLink to="/">Explore Landing Page</RouterLink>
              </Button>
              <Button
                asChild
                size="md"
                variant="subtle"
                borderRadius="full"
                borderColor="whiteAlpha.400"
                color="gray.200"
                px={6}
              >
                <RouterLink to="/">View Product Highlights</RouterLink>
              </Button>
            </HStack>
          </VStack>
        </MotionBox>

        <MotionBox
          flex={0.85}
          px={{ base: 5, md: 8, lg: 10 }}
          py={{ base: 7, md: 9 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Box
            w="100%"
            maxW="500px"
            bg="rgba(15, 23, 42, 0.88)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="30px"
            px={{ base: 6, md: 8 }}
            py={{ base: 7, md: 8 }}
            boxShadow="0 25px 60px rgba(2,6,23,0.48)"
          >
            <VStack align="stretch" gap={5}>
              <Box textAlign="left">
                <Heading fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="white">
                  Welcome Back
                </Heading>
                <Text mt={2} fontSize="sm" color="gray.300">
                  Login to continue managing your business operations.
                </Text>
              </Box>

              <form onSubmit={handleSubmit(onSubmit, onError)}>
                <Stack gap={5}>
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                      Email Address
                    </Field.Label>
                    <Input
                      {...register('emailId', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      size="lg"
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.300"
                      color="white"
                      placeholder="you@example.com"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{
                        borderColor: 'orange.400',
                        boxShadow: '0 0 0 3px rgba(251,146,60,0.16)',
                      }}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                      Password
                    </Field.Label>
                    <PasswordInput
                      {...register('password', {
                        required: 'Password is required',
                      })}
                      size="lg"
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.300"
                      color="white"
                      placeholder="Enter password"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{
                        borderColor: 'orange.400',
                        boxShadow: '0 0 0 3px rgba(251,146,60,0.16)',
                      }}
                    />
                  </Field.Root>

                  <Flex justify="space-between" align="center" pt={1}>
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      bg="whiteAlpha.100"
                      px={2.5}
                      py={1}
                      borderRadius="full"
                    >
                      Secure login enabled
                    </Text>
                    <Text
                      asChild
                      fontSize="xs"
                      fontWeight="700"
                      color="orange.400"
                      _hover={{ color: 'orange.300' }}
                    >
                      <RouterLink to="/forgot-password">Forgot password?</RouterLink>
                    </Text>
                  </Flex>

                  <Button
                    type="submit"
                    size="lg"
                    w="100%"
                    fontWeight="700"
                    borderRadius="xl"
                    bg="linear-gradient(135deg, #f97316 0%, #0ea5e9 100%)"
                    color="white"
                    _hover={{ opacity: 0.92 }}
                  >
                    Login to Dashboard
                  </Button>
                </Stack>
              </form>

              <Separator borderColor="whiteAlpha.300" />

              <Text fontSize="xs" color="gray.400" textAlign="center">
                By continuing, you agree to Terms and Privacy Policy.
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      </MotionFlex>
    </MotionFlex>
  )
}

export default Login
