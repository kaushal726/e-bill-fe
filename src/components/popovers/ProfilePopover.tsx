import {
  Box,
  Text,
  HStack,
  VStack,
  Avatar,
  Separator,
  Button,
  Portal,
  Popover,
} from '@chakra-ui/react'
import { useProfile } from '@/hooks/useProfile'
import { useDispatch } from 'react-redux'
import { resetProfile } from '@/redux/slices/profileSlice'
import { setLoading, clearLoading } from '@/redux/slices/uiSlice'
import { logoutService } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'

export const ProfilePopover = ({ trigger }: { trigger: React.ReactNode }) => {
  const { data } = useProfile()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const profile = data

  const handleLogout = async () => {
    dispatch(setLoading({ loading: true, message: 'Logging out...' }))
    try {
      await logoutService()
      dispatch(resetProfile())
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(clearLoading())
    }
  }

  return (
    <Popover.Root positioning={{ placement: 'bottom-end', strategy: 'fixed' }}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="320px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="16px"
            shadow={'lg'}
            overflow="hidden"
            p={0}
          >
            <Box p={4}>
              <HStack gap={3} align="start">
                <Avatar.Root
                  size="md"
                  bg="orange.50"
                  color="orange.700"
                  borderWidth="2px"
                  borderColor="orange.100"
                >
                  <Avatar.Fallback>{profile?.firstName?.[0] ?? 'U'}</Avatar.Fallback>
                </Avatar.Root>
                <Box flex="1">
                  <Text fontWeight="800" fontSize="sm" color="gray.900">
                    {profile?.firstName} {profile?.lastName}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {profile?.emailId}
                  </Text>
                  <Text
                    mt={1.5}
                    display="inline-flex"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    fontSize="10px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    bg="teal.50"
                    color="teal.700"
                    fontWeight="700"
                  >
                    Workspace Admin
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Separator borderColor="gray.200" />

            <Box p={2.5}>
              <VStack align="stretch" gap={2}>
                <Button
                  variant="subtle"
                  justifyContent="flex-start"
                  fontSize="sm"
                  fontWeight="700"
                  color="gray.800"
                  h="42px"
                  px={3.5}
                  rounded="lg"
                  onClick={() => navigate('/profile')}
                  bg="gray.50"
                >
                  My Account
                </Button>
                <Button
                  variant="subtle"
                  justifyContent="flex-start"
                  fontSize="sm"
                  fontWeight="700"
                  color="red.600"
                  h="42px"
                  px={3.5}
                  rounded="lg"
                  bg="red.50"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </VStack>
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
