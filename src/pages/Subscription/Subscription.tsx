import { ToasterUtil } from '@/components/common/ToasterUtil'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
import { CheckCircle2, LogOut, MessageCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type PlanKey = 'weekly' | 'monthly' | 'yearly'

const plans: Array<{
  key: PlanKey
  title: string
  priceLabel: string
  summary: string
  accent: string
  highlight?: string
}> = [
  {
    key: 'weekly',
    title: 'Weekly Plan',
    priceLabel: '200 / week',
    summary: 'Perfect for testing or short-term needs. Full access with 7-day duration.',
    accent: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
  },
  {
    key: 'monthly',
    title: 'Monthly Plan',
    priceLabel: '900 / month',
    summary:
      'Most popular choice. Unlimited invoices, inventory, customers, suppliers & staff management.',
    accent: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    highlight: 'Best value',
  },
  {
    key: 'yearly',
    title: 'Yearly Plan',
    priceLabel: '10,000 / year',
    summary: 'Maximum savings. Commit for a year and save 800+ compared to monthly plans.',
    accent: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
    highlight: 'Maximum savings',
  },
]

const Subscription = () => {
  const navigate = useNavigate()
  const toast = ToasterUtil()
  const { logout } = useAuth()
  const { data } = useProfile()
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('monthly')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const selectedPlanMeta = plans.find((plan) => plan.key === selectedPlan) || plans[1]
  const adminName =
    [data?.firstName, data?.lastName].filter(Boolean).join(' ') || data?.shopName || 'Admin'
  const adminId = data?._id || data?.id || data?.adminId || 'N/A'
  const adminEmail = data?.emailId || data?.email || 'N/A'

  const handleContactOnWhatsApp = () => {
    const waNumber = '9570036624'
    const message = [
      'Hello Ebill Team,',
      'I want to restart my subscription plan.',
      '',
      `Selected Plan: ${selectedPlanMeta.priceLabel}`,
      `Admin Name: ${adminName}`,
      `Admin ID: ${adminId}`,
      `Shop Name: ${data?.shopName || 'N/A'}`,
      `Email: ${adminEmail}`,
      '',
      'Please activate my plan and guide me with next steps.',
    ].join('\n')

    const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  const handleLoginToAnotherAccount = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast('Logged out successfully. Redirecting to login.', 'success')
      navigate('/login', { replace: true })
    } catch (error: any) {
      toast('Failed to logout. Please try again.', 'error')
      setIsLoggingOut(false)
    }
  }

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg="linear-gradient(180deg, #fff7ed 0%, #fffbeb 40%, #f8fafc 100%)"
    >
      <Box
        position="absolute"
        top="-120px"
        right="-80px"
        w="360px"
        h="360px"
        borderRadius="full"
        bg="rgba(249,115,22,0.18)"
        filter="blur(28px)"
      />
      <Box
        position="absolute"
        bottom="-140px"
        left="-90px"
        w="340px"
        h="340px"
        borderRadius="full"
        bg="rgba(20,184,166,0.18)"
        filter="blur(32px)"
      />

      <Flex minH="100vh" px={{ base: 5, md: 10 }} py={{ base: 8, md: 10 }} position="relative">
        <Grid
          templateColumns={{ base: '1fr', xl: '1.1fr 0.9fr' }}
          gap={8}
          w="full"
          alignItems="stretch"
        >
          <GridItem>
            <Box
              h="full"
              bg="rgba(15,23,42,0.94)"
              color="white"
              borderRadius="32px"
              px={{ base: 6, md: 10 }}
              py={{ base: 7, md: 10 }}
              boxShadow="0 30px 80px rgba(15,23,42,0.18)"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                inset="0"
                bg="radial-gradient(circle at top right, rgba(251,146,60,0.22), transparent 32%), radial-gradient(circle at bottom left, rgba(45,212,191,0.18), transparent 28%)"
              />

              <VStack align="start" gap={6} position="relative">
                <Badge
                  borderRadius="full"
                  px={3}
                  py={1}
                  bg="whiteAlpha.200"
                  color="orange.200"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  Subscription Required
                </Badge>

                <VStack align="start" gap={3} maxW="680px">
                  <Heading
                    fontSize={{ base: '4xl', md: '6xl' }}
                    lineHeight="0.95"
                    letterSpacing="-0.04em"
                  >
                    Unlock Your Business Potential with EBill
                  </Heading>
                  <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800" maxW="620px">
                    Restart your subscription and get access to unlimited billing, real-time
                    inventory tracking, customer management, supplier ledgers, and powerful
                    analytics.
                  </Text>
                </VStack>

                <HStack wrap="wrap" gap={3}>
                  <HStack bg="whiteAlpha.100" px={4} py={2} borderRadius="full">
                    <CheckCircle2 size={16} />
                    <Text fontSize="sm">Unlimited invoices & bills</Text>
                  </HStack>
                  <HStack bg="whiteAlpha.100" px={4} py={2} borderRadius="full">
                    <CheckCircle2 size={16} />
                    <Text fontSize="sm">Real-time inventory sync</Text>
                  </HStack>
                  <HStack bg="whiteAlpha.100" px={4} py={2} borderRadius="full">
                    <CheckCircle2 size={16} />
                    <Text fontSize="sm">All features included</Text>
                  </HStack>
                </HStack>

                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                  gap={4}
                  w="full"
                  mt={2}
                >
                  <Box bg="whiteAlpha.100" borderRadius="24px" p={5}>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                      Admin Name
                    </Text>
                    <Text fontSize="2xl" fontWeight="700">
                      {adminName}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.100" borderRadius="24px" p={5}>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                      Admin ID
                    </Text>
                    <Text fontSize="lg" fontWeight="700">
                      {adminId}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.100" borderRadius="24px" p={5}>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                      Workspace
                    </Text>
                    <Text fontSize="lg" fontWeight="700">
                      {data?.shopName || 'Ebill Store'}
                    </Text>
                  </Box>
                </Grid>

                <Box w="full" bg="whiteAlpha.100" borderRadius="28px" p={{ base: 5, md: 6 }}>
                  <HStack justify="space-between" align="start" mb={4}>
                    <Box>
                      <Text
                        color="orange.200"
                        textTransform="uppercase"
                        fontSize="xs"
                        letterSpacing="0.12em"
                      >
                        Next Steps
                      </Text>
                      <Heading size="md" mt={2}>
                        Get started in 3 easy steps
                      </Heading>
                    </Box>
                    <Sparkles size={20} />
                  </HStack>

                  <VStack align="stretch" gap={3}>
                    {[
                      'Select the plan that works best for your business on the right.',
                      'Click "Contact on WhatsApp" - it will automatically send your details to our team.',
                      'Our support team will activate your plan within hours, then login again to access all features.',
                    ].map((item) => (
                      <HStack key={item} align="start" gap={3}>
                        <CheckCircle2 size={18} color="#fdba74" style={{ marginTop: 2 }} />
                        <Text color="whiteAlpha.850">{item}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box
              h="full"
              bg="rgba(255,255,255,0.84)"
              backdropFilter="blur(24px)"
              borderRadius="32px"
              px={{ base: 5, md: 7 }}
              py={{ base: 6, md: 7 }}
              border="1px solid rgba(255,255,255,0.7)"
              boxShadow="0 24px 60px rgba(15,23,42,0.10)"
            >
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text
                    textTransform="uppercase"
                    fontSize="xs"
                    letterSpacing="0.14em"
                    color="orange.600"
                    fontWeight="700"
                  >
                    Plan Selection
                  </Text>
                  <Heading fontSize={{ base: '3xl', md: '4xl' }} color="gray.900" mt={2}>
                    Choose Your Plan
                  </Heading>
                  <Text color="gray.600" mt={2}>
                    Select a plan below and contact our support team on WhatsApp to activate
                    instantly. All plans include full access to all features.
                  </Text>
                </Box>

                <VStack align="stretch" gap={4}>
                  {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.key

                    return (
                      <Box
                        key={plan.key}
                        borderRadius="28px"
                        p={5}
                        bg={isSelected ? 'gray.950' : 'white'}
                        color={isSelected ? 'white' : 'gray.900'}
                        borderWidth="1px"
                        borderColor={isSelected ? 'transparent' : 'orange.100'}
                        boxShadow={
                          isSelected
                            ? '0 18px 50px rgba(15,23,42,0.18)'
                            : '0 10px 30px rgba(15,23,42,0.05)'
                        }
                        transition="all 0.2s ease"
                      >
                        <HStack justify="space-between" align="start" mb={4}>
                          <VStack align="start" gap={1}>
                            <HStack>
                              <Text fontSize="xl" fontWeight="700">
                                {plan.title}
                              </Text>
                              {plan.highlight ? (
                                <Badge borderRadius="full" colorPalette="teal" px={2.5} py={1}>
                                  {plan.highlight}
                                </Badge>
                              ) : null}
                            </HStack>
                            <Text color={isSelected ? 'whiteAlpha.800' : 'gray.600'}>
                              {plan.summary}
                            </Text>
                          </VStack>

                          <Box px={3} py={2} borderRadius="20px" bg={plan.accent} color="white">
                            <Text fontSize="sm" fontWeight="800">
                              {plan.priceLabel}
                            </Text>
                          </Box>
                        </HStack>

                        <Button
                          w="full"
                          size="lg"
                          bg={isSelected ? 'white' : 'gray.100'}
                          color={isSelected ? 'gray.950' : 'gray.800'}
                          onClick={() => setSelectedPlan(plan.key)}
                        >
                          {isSelected ? 'Selected Plan' : `Select ${plan.title}`}
                        </Button>
                      </Box>
                    )
                  })}
                </VStack>

                <Separator />

                <Box borderRadius="24px" bg="green.50" p={4}>
                  <HStack
                    justify="space-between"
                    align={{ base: 'start', md: 'center' }}
                    flexWrap="wrap"
                    gap={3}
                  >
                    <Box>
                      <Text fontWeight="700" color="gray.900">
                        Ready to activate your plan?
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Click below to contact our team on WhatsApp. We're available 24/7 to help.
                      </Text>
                    </Box>
                    <Button bg="green.600" color="white" onClick={handleContactOnWhatsApp}>
                      <MessageCircle size={16} />
                      Contact on WhatsApp
                    </Button>
                  </HStack>
                </Box>

                <Separator />

                <Box borderRadius="24px" bg="blue.50" p={4}>
                  <HStack
                    justify="space-between"
                    align={{ base: 'start', md: 'center' }}
                    flexWrap="wrap"
                    gap={3}
                  >
                    <Box>
                      <Text fontWeight="700" color="gray.900">
                        Got plan activated?
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Logout and login again to refresh your session and unlock access.
                      </Text>
                    </Box>
                    <Button
                      variant="subtle"
                      colorPalette="blue"
                      onClick={handleLoginToAnotherAccount}
                      loading={isLoggingOut}
                    >
                      <LogOut size={16} />
                      Logout and login again
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  )
}

export default Subscription
