import { Box, Text, VStack, HStack, Portal } from '@chakra-ui/react'
import { Popover } from '@chakra-ui/react'
import { UserCog, Shield, Bell, CreditCard, Palette, LogOut } from 'lucide-react'

type SettingAction = {
  label: string
  icon: React.ReactNode
  color?: string
  onClick: () => void
}

export const SettingsPopover = ({ trigger }: { trigger: React.ReactNode }) => {
  const actions: SettingAction[] = [
    {
      label: 'Account Settings',
      icon: <UserCog size={16} />,
      onClick: () => {},
    },
    {
      label: 'Security',
      icon: <Shield size={16} />,
      onClick: () => {},
    },
    {
      label: 'Notifications',
      icon: <Bell size={16} />,
      onClick: () => {},
    },
    {
      label: 'Billing',
      icon: <CreditCard size={16} />,
      onClick: () => {},
    },
    {
      label: 'Appearance',
      icon: <Palette size={16} />,
      onClick: () => {},
    },
    {
      label: 'Logout',
      icon: <LogOut size={16} />,
      color: 'red.600',
      onClick: () => {},
    },
  ]

  return (
    <Popover.Root positioning={{ placement: 'bottom-end', strategy: 'fixed' }}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="220px"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            shadow="lightGray"
            p={2}
          >
            <VStack align="stretch" gap={1}>
              {actions.map((action) => (
                <HStack
                  key={action.label}
                  px={3}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={action.onClick}
                >
                  <Box color={action.color ?? 'gray.600'}>{action.icon}</Box>
                  <Text fontSize="sm" fontWeight="500" color={action.color ?? 'gray.800'}>
                    {action.label}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
