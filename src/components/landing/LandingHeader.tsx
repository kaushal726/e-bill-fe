import { Box, Container, Flex, Heading, HStack, Button, IconButton, Text } from '@chakra-ui/react'
import { Menu } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Menu as MenuIcon, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function LandingHeader() {
  return (
    <MotionBox
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
      bg="rgba(2, 6, 23, 0.82)"
      borderBottomWidth="1px"
      borderBottomColor="whiteAlpha.200"
      shadow="sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxW="7xl">
        <Flex h="72px" align="center" justify="space-between">
          {/* Logo */}
          <MotionBox whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <RouterLink to="/">
              <HStack gap={2}>
                <Box
                  p={2}
                  bgGradient="linear(to-br, orange.500, cyan.500)"
                  borderRadius="lg"
                  color="white"
                >
                  <Sparkles size={20} />
                </Box>
                <Heading
                  size="lg"
                  fontWeight="700"
                  color="white"
                  letterSpacing="tight"
                  fontFamily="'Irish Grover', 'Poppins', sans-serif"
                >
                  eBillX
                </Heading>
              </HStack>
            </RouterLink>
          </MotionBox>

          {/* Desktop Navigation */}
          <HStack gap={8} hideBelow="md">
            <NavLink to="#features">Features</NavLink>
            <NavLink to="#how-it-works">How It Works</NavLink>
            <NavLink to="#pricing">Pricing</NavLink>
            <NavLink to="#help">Help</NavLink>

            <Button variant="ghost" colorPalette="gray" fontWeight="600" asChild>
              <RouterLink to="/login">Login</RouterLink>
            </Button>

            <Button
              bgGradient="linear(to-r, orange.500, cyan.500)"
              color="white"
              fontWeight="700"
              px={6}
              borderRadius="full"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
              }}
              transition="all 0.2s"
              asChild
            >
              <RouterLink to="/login">Get Started</RouterLink>
            </Button>
          </HStack>

          {/* Mobile Menu */}
          <Box hideFrom="md">
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton aria-label="Open menu" variant="ghost" size="lg">
                  <MenuIcon size={24} />
                </IconButton>
              </Menu.Trigger>

              <Menu.Positioner>
                <Menu.Content minW="200px" borderRadius="xl" shadow="xl" p={2}>
                  <Menu.Item value="features" asChild>
                    <RouterLink to="#features">Features</RouterLink>
                  </Menu.Item>
                  <Menu.Item value="how-it-works" asChild>
                    <RouterLink to="#how-it-works">How It Works</RouterLink>
                  </Menu.Item>
                  <Menu.Item value="pricing" asChild>
                    <RouterLink to="#pricing">Pricing</RouterLink>
                  </Menu.Item>
                  <Menu.Item value="help" asChild>
                    <RouterLink to="#help">Help</RouterLink>
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="login" asChild>
                    <RouterLink to="/login">Login</RouterLink>
                  </Menu.Item>
                  <Menu.Item
                    value="get-started"
                    color="white"
                    bgGradient="linear(to-r, orange.500, cyan.500)"
                    asChild
                  >
                    <RouterLink to="/login">Get Started</RouterLink>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </Box>
        </Flex>
      </Container>
    </MotionBox>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Text
      fontWeight="600"
      color="gray.200"
      fontSize="md"
      transition="all 0.2s"
      _hover={{
        color: 'orange.500',
        transform: 'translateY(-1px)',
      }}
      asChild
    >
      <RouterLink to={to}>{children}</RouterLink>
    </Text>
  )
}
