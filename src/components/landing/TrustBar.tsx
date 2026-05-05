import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Award, Shield, Zap, Users, TrendingUp, CheckCircle2 } from 'lucide-react'

const MotionBox = motion.create(Box)

const stats = [
  { icon: Users, value: '5,000+', label: 'Active Users', color: 'purple.400' },
  { icon: TrendingUp, value: '100 Cr+', label: 'Managed Annually', color: 'purple.500' },
  { icon: Zap, value: '24/7', label: 'Support', color: 'purple.300' },
  { icon: Shield, value: 'Enterprise', label: 'Grade Security', color: 'purple.400' },
]

export function TrustBar() {
  return (
    <Box bg="gray.950" py={12} borderBottomWidth="1px" borderBottomColor="gray.900">
      <Container maxW="7xl">
        <VStack gap={8}>
          {/* Trust Badge */}
          <HStack gap={2} color="purple.400">
            <Award size={20} />
            <Text fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
              Trusted by businesses worldwide
            </Text>
          </HStack>

          {/* Stats */}
          <HStack gap={{ base: 6, md: 12 }} justify="center" align="center" flexWrap="wrap">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <MotionBox
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <HStack gap={3} p={4} borderRadius="xl" bg="gray.900" transition="all 0.2s">
                    <Box color={stat.color}>
                      <Icon size={24} />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="2xl" fontWeight="800" color="white" lineHeight="1">
                        {stat.value}
                      </Text>
                      <Text fontSize="xs" color="gray.400" fontWeight="600">
                        {stat.label}
                      </Text>
                    </VStack>
                  </HStack>
                </MotionBox>
              )
            })}
          </HStack>

          {/* Features List */}
          <HStack
            gap={6}
            flexWrap="wrap"
            justify="center"
            fontSize="sm"
            color="gray.400"
            fontWeight="500"
          >
            <HStack>
              <CheckCircle2 size={16} color="purple" />
              <Text>No credit card required</Text>
            </HStack>
            <HStack>
              <CheckCircle2 size={16} color="purple" />
              <Text>14-day free trial</Text>
            </HStack>
            <HStack>
              <CheckCircle2 size={16} color="purple" />
              <Text>Cancel anytime</Text>
            </HStack>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
