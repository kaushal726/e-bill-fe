import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Badge,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const MotionBox = motion.create(Box)
const MotionText = motion.create(Text)
const MotionButton = motion.create(Button)

export function HeroSection() {
  return (
    <Box
      bg="linear-gradient(180deg, #020617 0%, #0f172a 50%, #111827 100%)"
      py={{ base: 20, md: 32 }}
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="-10%"
        right="-5%"
        w="600px"
        h="600px"
        bgGradient="radial(orange.300, transparent)"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.4}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <MotionBox
        position="absolute"
        bottom="-10%"
        left="-5%"
        w="500px"
        h="500px"
        bgGradient="radial(cyan.300, transparent)"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.35}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Container maxW="7xl" position="relative" zIndex={1}>
        <Stack gap={8} align="center" textAlign="center">
          {/* Badge */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              colorPalette="orange"
              size="lg"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="600"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Sparkles size={16} />
              Trusted by 1000+ growing businesses
            </Badge>
          </MotionBox>

          {/* Main Heading */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Heading
              size={{ base: '3xl', md: '6xl' }}
              fontWeight="700"
              letterSpacing="0.01em"
              lineHeight="1.1"
              maxW="5xl"
              mb={6}
              color="white"
              fontFamily="'Notable', 'Poppins', sans-serif"
            >
              Billing That Feels Fast. Insights That Feel Clear.
            </Heading>
          </MotionBox>

          {/* Subheading */}
          <MotionText
            fontSize={{ base: 'lg', md: '2xl' }}
            color="gray.300"
            maxW="3xl"
            fontWeight="500"
            lineHeight="1.6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            eBillX helps your team create invoices, track stock, monitor dues, and view live
            business performance without juggling spreadsheets and disconnected tools.
          </MotionText>

          {/* Features List */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <HStack
              gap={{ base: 4, md: 8 }}
              flexWrap="wrap"
              justify="center"
              fontSize={{ base: 'sm', md: 'md' }}
              color="gray.300"
              fontWeight="500"
            >
              <HStack>
                <Box color="teal.500">
                  <Zap size={18} fill="currentColor" />
                </Box>
                <Text>Real-time tracking</Text>
              </HStack>
              <HStack>
                <Box color="cyan.600">
                  <TrendingUp size={18} />
                </Box>
                <Text>Smart analytics</Text>
              </HStack>
              <HStack>
                <Box color="orange.500">
                  <Sparkles size={18} />
                </Box>
                <Text>Easy to use</Text>
              </HStack>
            </HStack>
          </MotionBox>

          {/* CTA Buttons */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Stack direction={{ base: 'column', sm: 'row' }} gap={4} pt={4}>
              <MotionButton
                size="xl"
                px={8}
                py={7}
                bgGradient="linear(to-r, orange.500, cyan.500)"
                fontSize="lg"
                fontWeight="700"
                borderRadius="full"
                shadow="xl"
                color="white"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: '2xl',
                }}
                asChild
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RouterLink to="/login">Start Free Trial</RouterLink>
              </MotionButton>

              <MotionButton
                size="xl"
                px={8}
                py={7}
                variant="subtle"
                borderWidth="2px"
                borderColor="orange.400"
                fontSize="lg"
                fontWeight="600"
                borderRadius="full"
                bg="transparent"
                color="white"
                _hover={{
                  bg: 'whiteAlpha.100',
                  borderColor: 'orange.500',
                  transform: 'translateY(-2px)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                asChild
              >
                <RouterLink to="/login">Login & Explore Dashboard</RouterLink>
              </MotionButton>
            </Stack>
          </MotionBox>

          {/* Trust Indicators */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            pt={8}
          >
            <VStack gap={2}>
              <Text fontSize="sm" color="gray.400" fontWeight="500">
                No credit card required Set up in minutes Ready for daily billing
              </Text>
            </VStack>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  )
}
