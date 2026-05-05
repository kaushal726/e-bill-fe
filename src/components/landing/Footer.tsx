import { Box, Container, HStack, Text, VStack, SimpleGrid, Heading } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box bg="gray.900" color="white" pt={16} pb={8}>
      <Container maxW="7xl">
        {/* Main Footer Content */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={10} mb={12}>
          {/* Brand */}
          <VStack align="start" gap={4}>
            <HStack gap={2}>
              <Box p={2} bgGradient="linear(to-br, blue.500, purple.600)" borderRadius="lg">
                <Sparkles size={20} />
              </Box>
              <Heading
                size="lg"
                fontWeight="800"
                bgGradient="linear(to-r, blue.400, purple.400)"
                bgClip="text"
                letterSpacing="tight"
              >
                EBill
              </Heading>
            </HStack>
            <Text color="gray.400" fontSize="sm" maxW="250px" lineHeight="1.7">
              EBill is a complete billing, inventory, and business management platform designed for
              retail shops, distributors, pharmacies, and growing businesses.
            </Text>
            <HStack gap={3} pt={2}>
              <FooterIconLink href="#" icon={<Twitter size={18} />} />
              <FooterIconLink href="#" icon={<Github size={18} />} />
              <FooterIconLink href="#" icon={<Linkedin size={18} />} />
              <FooterIconLink href="#" icon={<Mail size={18} />} />
            </HStack>
          </VStack>

          {/* Product */}
          <VStack align="start" gap={3}>
            <Text
              fontSize="sm"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Product
            </Text>
            <FooterLink to="#features">Features</FooterLink>
            <FooterLink to="#how-it-works">How It Works</FooterLink>
            <FooterLink to="#pricing">Pricing</FooterLink>
            <FooterLink to="#help">Help Center</FooterLink>
          </VStack>

          {/* Company */}
          <VStack align="start" gap={3}>
            <Text
              fontSize="sm"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Company
            </Text>
            <FooterLink to="#about">About Us</FooterLink>
            <FooterLink to="#careers">Careers</FooterLink>
            <FooterLink to="#blog">Blog</FooterLink>
            <FooterLink to="#contact">Contact</FooterLink>
          </VStack>

          {/* Legal */}
          <VStack align="start" gap={3}>
            <Text
              fontSize="sm"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={2}
            >
              Legal
            </Text>
            <FooterLink to="#privacy">Privacy Policy</FooterLink>
            <FooterLink to="#terms">Terms of Service</FooterLink>
            <FooterLink to="#security">Security</FooterLink>
            <FooterLink to="#cookies">Cookie Policy</FooterLink>
          </VStack>
        </SimpleGrid>

        {/* Bottom Bar */}
        <Box pt={8} borderTopWidth="1px" borderTopColor="gray.800">
          <HStack justify="space-between" flexWrap="wrap" gap={4} fontSize="sm" color="gray.500">
            <Text>© {currentYear} EBill. All rights reserved.</Text>
            <Text>Made with ❤️ for businesses worldwide</Text>
          </HStack>
        </Box>
      </Container>
    </Box>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Text fontSize="sm" color="gray.400" transition="color 0.2s" asChild>
      <RouterLink to={to}>{children}</RouterLink>
    </Text>
  )
}

function FooterIconLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Box
      as="a"
      rel="noopener noreferrer"
      p={2}
      borderRadius="md"
      bg="gray.800"
      color="gray.400"
      transition="all 0.2s"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {icon}
    </Box>
  )
}
