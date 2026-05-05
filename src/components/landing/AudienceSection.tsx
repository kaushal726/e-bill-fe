import { Box, Container, Heading, SimpleGrid, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Store,
  Package,
  Warehouse,
  Factory,
  Heart,
  ShoppingCart,
  Rocket,
  Briefcase,
  Target,
} from 'lucide-react'

const MotionBox = motion.create(Box)

const audience = [
  { name: 'Retail Shop Owners', icon: Store, color: 'purple.400' },
  { name: 'Wholesale Distributors', icon: Package, color: 'purple.500' },
  { name: 'Small Warehouses', icon: Warehouse, color: 'purple.300' },
  { name: 'Manufacturing Units', icon: Factory, color: 'purple.400' },
  { name: 'Pharmacies', icon: Heart, color: 'purple.500' },
  { name: 'Grocery & Kirana Stores', icon: ShoppingCart, color: 'purple.300' },
  { name: 'Startups & MSMEs', icon: Rocket, color: 'purple.400' },
  { name: 'Service Businesses', icon: Briefcase, color: 'purple.500' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
}

export function AudienceSection() {
  return (
    <Box bg="gray.950" py={{ base: 16, md: 24 }}>
      <Container maxW="7xl">
        {/* Section Header */}
        <VStack gap={4} mb={16} textAlign="center">
          <HStack gap={2} color="purple.400">
            <Target size={24} />
            <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
              For Every Business
            </Text>
          </HStack>

          <Heading
            size={{ base: '2xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="tight"
            color="white"
          >
            Built For Your Industry
          </Heading>

          <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.400" maxW="3xl" fontWeight="500">
            From small businesses to large enterprises, EBill adapts to your needs
          </Text>
        </VStack>

        {/* Audience Grid */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
            {audience.map((item) => {
              const Icon = item.icon
              return (
                <MotionBox
                  key={item.name}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Box
                    p={6}
                    borderRadius="2xl"
                    bg="gray.900"
                    borderWidth="2px"
                    borderColor="gray.800"
                    shadow="sm"
                    h="100%"
                    transition="all 0.3s"
                  >
                    <VStack gap={4} align="center">
                      {/* Icon */}
                      <Box p={4} borderRadius="xl" bg="gray.800" color={item.color}>
                        <Icon size={32} strokeWidth={2} />
                      </Box>

                      {/* Text */}
                      <Text fontSize="md" fontWeight="700" color="white" textAlign="center">
                        {item.name}
                      </Text>
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
