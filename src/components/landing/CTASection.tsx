import { Box, Button, Container, Heading, Stack, Text, HStack, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const MotionBox = motion.create(Box)
const MotionButton = motion.create(Button)

export function CTASection() {
  return (
    <Box py={{ base: 20, md: 28 }} position="relative" overflow="hidden" bg="gray.950">
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Container maxW="6xl">
          <Box
            bgGradient="linear(to-br, purple.600, purple.800)"
            borderRadius="3xl"
            p={{ base: 10, md: 16 }}
            position="relative"
            overflow="hidden"
            shadow="2xl"
          >
            {/* Animated Background Elements */}
            <MotionBox
              position="absolute"
              top="-50%"
              right="-20%"
              w="600px"
              h="600px"
              borderRadius="full"
              bg="whiteAlpha.200"
              filter="blur(80px)"
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
              bottom="-50%"
              left="-20%"
              w="500px"
              h="500px"
              borderRadius="full"
              bg="whiteAlpha.200"
              filter="blur(80px)"
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

            {/* Content */}
            <VStack gap={8} textAlign="center" position="relative" zIndex={1} color="white">
              {/* Icon */}
              <MotionBox
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Box
                  p={4}
                  borderRadius="2xl"
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  display="inline-block"
                >
                  <Sparkles size={48} />
                </Box>
              </MotionBox>

              {/* Heading */}
              <Heading
                size={{ base: '2xl', md: '4xl' }}
                fontWeight="900"
                letterSpacing="tight"
                lineHeight="1.1"
                maxW="4xl"
              >
                Ready to Transform Your Business?
              </Heading>

              {/* Description */}
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                maxW="2xl"
                opacity={0.95}
                fontWeight="500"
                lineHeight="1.7"
              >
                Join thousands of retail shops, distributors, and businesses already using EBill to
                automate billing, manage inventory, track sales, and grow profitably.
              </Text>

              {/* Features */}
              <HStack
                gap={6}
                flexWrap="wrap"
                justify="center"
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="600"
                pt={2}
              >
                <HStack>
                  <Zap size={20} fill="currentColor" />
                  <Text>Free 14-day trial</Text>
                </HStack>
                <HStack>
                  <Zap size={20} fill="currentColor" />
                  <Text>No credit card required</Text>
                </HStack>
                <HStack>
                  <Zap size={20} fill="currentColor" />
                  <Text>Cancel anytime</Text>
                </HStack>
              </HStack>

              {/* CTA Buttons */}
              <Stack direction={{ base: 'column', sm: 'row' }} gap={4} pt={4}>
                <MotionButton
                  size="xl"
                  px={8}
                  py={7}
                  bg="white"
                  color="purple.600"
                  fontSize="lg"
                  fontWeight="700"
                  borderRadius="full"
                  shadow="xl"
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
                  borderColor="white"
                  color="white"
                  fontSize="lg"
                  fontWeight="700"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  _hover={{
                    bg: 'whiteAlpha.200',
                    transform: 'translateY(-2px)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Sales
                </MotionButton>
              </Stack>
            </VStack>
          </Box>
        </Container>
      </MotionBox>
    </Box>
  )
}
