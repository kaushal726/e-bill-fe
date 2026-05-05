import { Box, Container, Heading, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Package, FileText, Users, CreditCard, BarChart3, Shield, Sparkles } from 'lucide-react'

const MotionBox = motion.create(Box)

type Feature = {
  title: string
  desc: string
  icon: any
  color: string
  gradient: string
}

const features: Feature[] = [
  {
    title: 'Real-Time Inventory Tracking',
    desc: 'Automatically track stock levels across all products, get alerts for low inventory, and manage stock history effortlessly.',
    icon: Package,
    color: 'purple.400',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Smart Billing & Invoicing',
    desc: 'Create professional invoices and bills instantly. Handle taxes, discounts, and multiple payment methods automatically.',
    icon: FileText,
    color: 'purple.500',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Supplier Management',
    desc: 'Maintain detailed supplier records, track purchases, manage purchase returns, and handle outstanding payments.',
    icon: Users,
    color: 'purple.300',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Customer & Credit Management',
    desc: 'Track customer balances, payment history, manage credits, and maintain customer ledgers effortlessly.',
    icon: CreditCard,
    color: 'purple.400',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Sales & Purchase Tracking',
    desc: 'Record all sales and purchases in real-time. Handle sale returns, delivery receipts, and purchase orders seamlessly.',
    icon: BarChart3,
    color: 'purple.500',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Advanced Reports & Analytics',
    desc: 'Get comprehensive insights with sales reports, profit analysis, stock reports, and attendance tracking for better decisions.',
    icon: BarChart3,
    color: 'purple.300',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Multi-User Role Management',
    desc: 'Create staff accounts with role-based access control. Manage permissions and protect sensitive business data.',
    icon: Shield,
    color: 'purple.400',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Staff & Payroll Management',
    desc: 'Manage staff records, track attendance, monitor schedules, and streamline HR operations.',
    icon: Users,
    color: 'purple.500',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
  {
    title: 'Payment & Ledger Management',
    desc: 'Record all payments, maintain detailed ledgers, track pending payments, and get financial summaries.',
    icon: CreditCard,
    color: 'purple.300',
    gradient: 'linear(to-br, purple.900, purple.800)',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function FeaturesSection() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="gray.950" position="relative">
      <Container maxW="7xl">
        {/* Section Header */}
        <VStack gap={4} mb={16} textAlign="center">
          <HStack gap={2} color="purple.400">
            <Sparkles size={24} />
            <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
              Features
            </Text>
          </HStack>

          <Heading
            size={{ base: '2xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="tight"
            color="white"
          >
            Powerful Features for Complete Business Control
          </Heading>

          <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.600" maxW="3xl" fontWeight="500">
            Everything you need to manage billing, inventory, customers, suppliers, staff, and
            finances in one integrated platform
          </Text>
        </VStack>

        {/* Features Grid */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {features.map((f, index) => {
              const Icon = f.icon
              return (
                <MotionBox
                  key={f.title}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Box
                    p={8}
                    borderRadius="2xl"
                    bg="gray.900"
                    borderWidth="1px"
                    borderColor="gray.800"
                    shadow="md"
                    h="100%"
                    transition="all 0.3s"
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Gradient Overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient={f.gradient}
                    />

                    <VStack align="start" gap={4}>
                      {/* Icon */}
                      <Box p={3} borderRadius="xl" bgGradient={f.gradient} color={f.color}>
                        <Icon size={28} strokeWidth={2} />
                      </Box>

                      {/* Content */}
                      <VStack align="start" gap={2}>
                        <Heading size="md" fontWeight="700" color="white">
                          {f.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.400" lineHeight="1.7" fontWeight="500">
                          {f.desc}
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                </MotionBox>
              )
            })}
          </SimpleGrid>
        </MotionBox>
      </Container>
    </Box>
  )
}
