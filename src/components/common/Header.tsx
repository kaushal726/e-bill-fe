import { Avatar, Box, Flex, HStack, Text, Stack, VStack } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { ProfilePopover } from '@/components/popovers/ProfilePopover'
import type { RootState } from '@/redux/store'
import { useProfile } from '@/hooks/useProfile'

export const Header = () => {
  const { title, subtitle } = useSelector((state: RootState) => state.header)
  const { data: profile } = useProfile()

  const shopName = profile?.shopName || 'Ebill Workspace'
  const userName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Operator'

  if (!title) return null

  return (
    <Box
      px={{ base: 4, md: 5 }}
      py={{ base: 0, md: 0 }}
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={999}
      css={{
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        direction="row"
        gap={{ base: 2, lg: 3 }}
        minH={{ base: '56px', md: '64px' }}
        px={{ base: 2.5, md: 4 }}
        py={{ base: 1.5, md: 2 }}
        position="relative"
      >
        <HStack align="center" gap={{ base: 2, md: 4 }} flex="1" minW={0}>
          <Stack gap={0.5} flex="1" minW={0} justify="center">
            <Text
              display={{ base: 'none', lg: 'block' }}
              fontSize="10px"
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Workspace
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'xl' }}
              fontWeight="700"
              color="black"
              lineHeight="1.05"
              letterSpacing="-0.03em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {title}
            </Text>
            <Text
              display={{ base: 'none', lg: 'block' }}
              fontSize="xs"
              color="gray.600"
              maxW="760px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {subtitle || `Operational view for ${userName}.`}
            </Text>
          </Stack>
        </HStack>

        <VStack align="end" gap={1.5} w="auto" flexShrink={0}>
          <ProfilePopover
            trigger={
              <Box as="span">
                <HStack
                  gap={{ base: 0, md: 2.5 }}
                  px={{ base: 0, md: 2.5 }}
                  py={{ base: 0, md: 1.5 }}
                  borderRadius={{ base: 'full', md: '14px' }}
                  bg="gray.50"
                  border={{ base: 'none', md: '1px solid' }}
                  borderColor="gray.200"
                  boxShadow={{ base: 'none', md: '0 1px 0 rgba(255,255,255,0.35) inset' }}
                  cursor="pointer"
                >
                  <Avatar.Root size="sm" bg="black" color="white">
                    <Avatar.Fallback>{profile?.firstName?.[0] ?? 'U'}</Avatar.Fallback>
                  </Avatar.Root>
                  <VStack align="start" gap={0} hideBelow="md">
                    <Text fontSize="xs" fontWeight="700" color="black" lineHeight="1.1">
                      {userName}
                    </Text>
                    <Text
                      fontSize="11px"
                      color="gray.600"
                      lineHeight="1.1"
                      maxW="160px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {shopName}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            }
          />
        </VStack>
      </Flex>
    </Box>
  )
}
