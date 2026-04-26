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
      px={{ base: 4, md: 6 }}
      py={{ base: 0, md: 0 }}
      bg="#c7d2cc"
      borderBottomWidth="1px"
      borderColor="#a7b7af"
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
        gap={{ base: 2, lg: 4 }}
        minH={{ base: '60px', md: '82px' }}
        px={{ base: 2.5, md: 6 }}
        py={{ base: 2, md: 3.5 }}
        position="relative"
      >
        <HStack align="center" gap={{ base: 2, md: 4 }} flex="1" minW={0}>
          <Box
            width="4px"
            borderRadius="full"
            bg="#4f6f68"
            alignSelf="stretch"
            minH={{ base: '28px', md: '48px' }}
          />

          <Stack gap={0.5} flex="1" minW={0} justify="center">
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize="11px"
              fontWeight="700"
              color="#5a746c"
              textTransform="uppercase"
              letterSpacing="0.14em"
            >
              Workspace
            </Text>
            <Text
              fontSize={{ base: 'lg', md: '2xl' }}
              fontWeight="700"
              color="#223530"
              lineHeight="1.1"
              letterSpacing="-0.03em"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {title}
            </Text>
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize="sm"
              color="#49615c"
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
                  px={{ base: 0, md: 3.5 }}
                  py={{ base: 0, md: 2.5 }}
                  borderRadius={{ base: 'full', md: '18px' }}
                  bg="#d8e0db"
                  border={{ base: 'none', md: '1px solid' }}
                  borderColor="#aebdb6"
                  boxShadow={{ base: 'none', md: '0 1px 0 rgba(255,255,255,0.35) inset' }}
                  cursor="pointer"
                >
                  <Avatar.Root size="sm" bg="#5e7b74" color="white">
                    <Avatar.Fallback>{profile?.firstName?.[0] ?? 'U'}</Avatar.Fallback>
                  </Avatar.Root>
                  <VStack align="start" gap={0} hideBelow="md">
                    <Text fontSize="sm" fontWeight="700" color="#223530" lineHeight="1.1">
                      {userName}
                    </Text>
                    <Text
                      fontSize="12px"
                      color="#58716a"
                      lineHeight="1.1"
                      maxW="190px"
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
