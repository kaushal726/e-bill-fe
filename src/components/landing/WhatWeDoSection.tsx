import { Box, Container, Heading, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ShoppingCart, Package, Users, BarChart3, Clock, Lock } from 'lucide-react'

const MotionBox = motion.create(Box)

type WhatWeDo = {
  title: string
  desc: string
  icon: any
  color: string
}

const solutions: WhatWeDo[] = [
  {
    title: 'Smart Billing',
    desc: 'Create professional invoices and bills instantly with automatic tax calculation, discounts, and multiple payment tracking.',
    icon: ShoppingCart,
    color: 'purple.400',
  },
  {
    title: 'Inventory Management',
    desc: 'Track stock in real-time, get low-stock alerts, manage multiple warehouses, and sync quantities across all sales channels.',
    icon: Package,
    color: 'purple.500',
  },
  {
    title: 'Customer & Supplier Management',
    desc: 'Maintain detailed customer and supplier records, track transactions, manage credit, and access complete ledgers.',
    icon: Users,
    color: 'purple.300',
  },
  {
    title: 'Real-Time Analytics',
    desc: 'View dashboards with sales trends, profit margins, stock health, and make data-driven business decisions instantly.',
    icon: BarChart3,
    color: 'purple.400',
  },
  {
    title: '24/7 Access',
    desc: 'Access your business data anytime, anywhere from any device. Cloud-based platform with zero installation hassle.',
    icon: Clock,
    color: 'purple.500',
  },
  {
    title: 'Enterprise Security',
    desc: 'Role-based access control, encrypted data, secure backups, and compliance with industry security standards.',
    icon: Lock,
    color: 'purple.300',
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

export function WhatWeDoSection() {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg="linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
      position="relative"
    >
      <Container maxW="7xl">
        {/* Section Header */}
        <VStack gap={4} mb={16} textAlign="center">
          <Heading
            size={{ base: '2xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="tight"
            color="white"
          >
            What We Do for Your Business
          </Heading>

          <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.400" maxW="3xl" fontWeight="500">
            EBill is a complete all-in-one platform that handles everything from billing and
            inventory to customer management and financial analytics
          </Text>
        </VStack>

        {/* Solutions Grid */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {solutions.map((solution) => {
              const Icon = solution.icon
              return (
                <MotionBox
                  key={solution.title}
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
                    {/* Gradient Top Border */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, purple.500, purple.700)"
                    />

                    <VStack align="start" gap={4}>
                      {/* Icon */}
                      <Box p={3} borderRadius="xl" bg="gray.800" color={solution.color}>
                        <Icon size={28} strokeWidth={2} />
                      </Box>

                      {/* Content */}
                      <VStack align="start" gap={2}>
                        <Heading size="md" fontWeight="700" color="white">
                          {solution.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.400" lineHeight="1.7" fontWeight="500">
                          {solution.desc}
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                </MotionBox>
              )
            })}
          </SimpleGrid>
        </MotionBox>

        {/* Bottom CTA Text */}
        <VStack gap={4} mt={16} textAlign="center">
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.400" maxW="3xl" fontWeight="500">
            Stop juggling multiple tools. EBill brings everything together in one unified platform,
            so you can focus on growing your business.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
