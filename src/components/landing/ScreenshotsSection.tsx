import { Box, Container, Heading, Text, VStack, HStack, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Tablet, Eye } from 'lucide-react'

const MotionBox = motion.create(Box)

const devices = [
  {
    name: 'Desktop',
    icon: Monitor,
    color: 'purple.400',
    gradient: 'linear(to-br, purple.500, purple.700)',
  },
  {
    name: 'Mobile',
    icon: Smartphone,
    color: 'purple.500',
    gradient: 'linear(to-br, purple.500, purple.700)',
  },
  {
    name: 'Tablet',
    icon: Tablet,
    color: 'purple.300',
    gradient: 'linear(to-br, purple.500, purple.700)',
  },
]

export function ScreenshotsSection() {
  return (
    <Box bg="black" py={{ base: 16, md: 24 }}>
      <Container maxW="7xl">
        {/* Section Header */}
        <VStack gap={4} mb={16} textAlign="center">
          <HStack gap={2} color="purple.400">
            <Eye size={24} />
            <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
              Beautiful Interface
            </Text>
          </HStack>

          <Heading
            size={{ base: '2xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="tight"
            color="white"
          >
            Works Seamlessly Everywhere
          </Heading>

          <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.400" maxW="3xl" fontWeight="500">
            Access your business data from any device, anywhere, anytime
          </Text>
        </VStack>

        {/* Main Preview Card */}
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          mb={12}
        >
          <Box
            borderRadius="3xl"
            overflow="hidden"
            shadow="2xl"
            bg="gray.900"
            p={8}
            position="relative"
          >
            {/* Gradient Background */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="200px"
              bgGradient="linear(to-br, purple.600, purple.800)"
              opacity={0.2}
            />

            {/* Mock Dashboard Preview */}
            <Box position="relative" zIndex={1}>
              <VStack gap={6}>
                {/* Header */}
                <HStack w="100%" justify="space-between" p={6} bg="gray.50" borderRadius="xl">
                  <HStack gap={2}>
                    <Box w="12px" h="12px" borderRadius="full" bg="red.400" />
                    <Box w="12px" h="12px" borderRadius="full" bg="yellow.400" />
                    <Box w="12px" h="12px" borderRadius="full" bg="green.400" />
                  </HStack>
                  <Text fontSize="sm" fontWeight="600" color="gray.500">
                    dashboard.ebill.com
                  </Text>
                  <Box w="80px" />
                </HStack>

                {/* Content Area */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="100%" p={6}>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      h="120px"
                      borderRadius="xl"
                      bgGradient="linear(to-br, purple.900, purple.800)"
                    />
                  ))}
                </SimpleGrid>

                {/* Charts Area */}
                <Box w="100%" p={6}>
                  <HStack gap={4} h="200px">
                    <Box flex={2} borderRadius="xl" bg="gray.800" />
                    <Box flex={1} borderRadius="xl" bg="gray.800" />
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </MotionBox>

        {/* Device Icons */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap={8}>
          {devices.map((device, index) => {
            const Icon = device.icon
            return (
              <MotionBox
                key={device.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <VStack
                  gap={4}
                  p={8}
                  borderRadius="2xl"
                  bg="gray.900"
                  shadow="md"
                  transition="all 0.3s"
                >
                  <Box p={4} borderRadius="xl" bgGradient={device.gradient} color="white">
                    <Icon size={40} strokeWidth={1.5} />
                  </Box>
                  <VStack gap={1}>
                    <Text fontSize="lg" fontWeight="700" color="white">
                      {device.name}
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Optimized experience
                    </Text>
                  </VStack>
                </VStack>
              </MotionBox>
            )
          })}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
