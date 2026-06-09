import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Flex,
  Field,
  Text,
  VStack,
  Separator,
  HStack,
} from '@chakra-ui/react'
import { PasswordInput } from '@/components/ui/password-input'
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form'
import { ToasterUtil } from '@/components/common/ToasterUtil'
import { API } from '@/api/api'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { AxiosError } from 'axios'
import API_ENDPOINTS from '@/api/apiEndpoints'
import { clearLoading, setLoading } from '@/redux/slices/uiSlice'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)
const MotionBox = motion(Box)

type Step = 'request' | 'reset'

interface RequestValues {
  emailId: string
}

interface ResetValues {
  otp: string
  password: string
  confirmPassword: string
}

const fieldStyles = {
  size: 'lg' as const,
  bg: 'whiteAlpha.100',
  borderColor: 'whiteAlpha.300',
  color: 'white',
  _placeholder: { color: 'gray.400' },
  _focus: {
    borderColor: 'orange.400',
    boxShadow: '0 0 0 3px rgba(251,146,60,0.16)',
  },
}

const ForgotPassword = () => {
  const toastFunc = ToasterUtil()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [step, setStep] = useState<Step>('request')
  const [emailId, setEmailId] = useState('')

  const requestForm = useForm<RequestValues>()
  const resetForm = useForm<ResetValues>()

  const handleApiError = (error: unknown, fallback: string) => {
    console.error(fallback, error)
    if (error instanceof AxiosError) {
      toastFunc(error.response?.data?.message || fallback, 'error')
    } else {
      toastFunc('Something went wrong', 'error')
    }
  }

  const onRequest: SubmitHandler<RequestValues> = async (values) => {
    dispatch(setLoading({ loading: true, message: 'Sending code...' }))
    try {
      const res = await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST, {
        emailId: values.emailId,
      })
      if (res.status === 200) {
        setEmailId(values.emailId)
        setStep('reset')
        toastFunc('A reset code has been sent to your email.', 'success')
      }
    } catch (error) {
      handleApiError(error, 'Failed to send reset code')
    } finally {
      dispatch(clearLoading())
    }
  }

  const onReset: SubmitHandler<ResetValues> = async (values) => {
    if (values.password !== values.confirmPassword) {
      toastFunc('Passwords do not match', 'error')
      return
    }
    dispatch(setLoading({ loading: true, message: 'Resetting password...' }))
    try {
      const res = await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, {
        emailId,
        otp: values.otp,
        password: values.password,
      })
      if (res.status === 200) {
        toastFunc('Password reset successfully. Please log in.', 'success')
        navigate('/login')
      }
    } catch (error) {
      handleApiError(error, 'Failed to reset password')
    } finally {
      dispatch(clearLoading())
    }
  }

  const onError = (errors: FieldErrors<RequestValues | ResetValues>) => {
    Object.values(errors).forEach((err) => {
      toastFunc((err?.message as string) || 'Fill the required fields', 'error')
    })
  }

  const resendCode = async () => {
    if (!emailId) return
    dispatch(setLoading({ loading: true, message: 'Resending code...' }))
    try {
      await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST, { emailId })
      toastFunc('A new code has been sent.', 'success')
    } catch (error) {
      handleApiError(error, 'Failed to resend code')
    } finally {
      dispatch(clearLoading())
    }
  }

  return (
    <MotionFlex
      w="100%"
      minH="100dvh"
      bgGradient="linear-gradient(135deg, #070b16 0%, #0f172a 45%, #10203c 100%)"
      direction="column"
      align="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      overflowX="hidden"
      overflowY="auto"
      position="relative"
      px={{ base: 4, sm: 5 }}
      py={{ base: 6, md: 10 }}
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

      <MotionBox
        w="100%"
        maxW="460px"
        my="auto"
        bg="rgba(15, 23, 42, 0.88)"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius={{ base: '24px', md: '30px' }}
        px={{ base: 5, sm: 6, md: 8 }}
        py={{ base: 6, sm: 7, md: 8 }}
        boxShadow="0 25px 60px rgba(2,6,23,0.48)"
        position="relative"
        zIndex={2}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <VStack align="stretch" gap={{ base: 4, md: 5 }}>
          <Box textAlign="left">
            <Heading fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="white">
              {step === 'request' ? 'Forgot Password' : 'Enter Reset Code'}
            </Heading>
            <Text mt={2} fontSize="sm" color="gray.300" wordBreak="break-word">
              {step === 'request'
                ? 'Enter your registered email and we will send you a one-time code.'
                : `We sent a 6-digit code to ${emailId}. Enter it below with your new password.`}
            </Text>
          </Box>

          {step === 'request' ? (
            <form onSubmit={requestForm.handleSubmit(onRequest, onError)}>
              <Stack gap={5}>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                    Email Address
                  </Field.Label>
                  <Input
                    {...requestForm.register('emailId', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...fieldStyles}
                  />
                </Field.Root>

                <Button
                  type="submit"
                  size="lg"
                  w="100%"
                  fontWeight="700"
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #f97316 0%, #0ea5e9 100%)"
                  color="white"
                >
                  Send Reset Code
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onReset, onError)}>
              <Stack gap={5}>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                    Reset Code
                  </Field.Label>
                  <Input
                    {...resetForm.register('otp', {
                      required: 'Reset code is required',
                      pattern: { value: /^\d{6}$/, message: 'Code must be 6 digits' },
                    })}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
                    letterSpacing="0.4em"
                    textAlign="center"
                    {...fieldStyles}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                    New Password
                  </Field.Label>
                  <PasswordInput
                    {...resetForm.register('password', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    {...fieldStyles}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight="600" color="gray.100" mb={2}>
                    Confirm Password
                  </Field.Label>
                  <PasswordInput
                    {...resetForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === resetForm.watch('password') || 'Passwords do not match',
                    })}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    {...fieldStyles}
                  />
                </Field.Root>

                <Button
                  type="submit"
                  size="lg"
                  w="100%"
                  fontWeight="700"
                  borderRadius="xl"
                  bg="linear-gradient(135deg, #f97316 0%, #0ea5e9 100%)"
                  color="white"
                >
                  Reset Password
                </Button>

                <HStack justify="space-between" fontSize="xs">
                  <Text
                    color="gray.400"
                    cursor="pointer"
                    _hover={{ color: 'gray.200' }}
                    onClick={() => setStep('request')}
                  >
                    Change email
                  </Text>
                  <Text
                    color="orange.400"
                    fontWeight="700"
                    cursor="pointer"
                    _hover={{ color: 'orange.300' }}
                    onClick={resendCode}
                  >
                    Resend code
                  </Text>
                </HStack>
              </Stack>
            </form>
          )}

          <Separator borderColor="whiteAlpha.300" />

          <Text fontSize="sm" color="gray.400" textAlign="center">
            Remembered your password?{' '}
            <Text asChild fontWeight="700" color="orange.400" display="inline">
              <RouterLink to="/login">Back to Login</RouterLink>
            </Text>
          </Text>
        </VStack>
      </MotionBox>
    </MotionFlex>
  )
}

export default ForgotPassword
