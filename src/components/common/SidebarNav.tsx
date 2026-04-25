import { HStack, VStack, Text, Box } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FaRegClipboard } from 'react-icons/fa'
import { FiUsers, FiTruck, FiShoppingCart } from 'react-icons/fi'
import {
  MdOutlineSell,
  MdReceiptLong,
  MdPayments,
  MdCategory,
  MdInventory,
  MdSpaceDashboard,
} from 'react-icons/md'
import { RxBox, RxGear, RxPerson } from 'react-icons/rx'

const sections = [
  {
    value: 'billing',
    label: 'Billing',
    items: [
      { label: 'Sales', path: '/sales', icon: MdOutlineSell },
      { label: 'Customers', path: '/customer', icon: FiUsers },
      { label: 'Bill', path: '/bill', icon: MdReceiptLong },
      { label: 'Payments', path: '/payments', icon: MdPayments },
      { label: 'Payment Analytics', path: '/payments/analytics', icon: MdPayments },
    ],
  },
  {
    value: 'catalog',
    label: 'Catalog',
    items: [
      { label: 'Products', path: '/products', icon: RxBox },
      { label: 'Category', path: '/category', icon: MdCategory },
      { label: 'Suppliers', path: '/suppliers', icon: FiTruck },
      { label: 'Purchase', path: '/purchase', icon: FiShoppingCart },
      { label: 'Stock', path: '/stocks', icon: MdInventory },
    ],
  },
  {
    value: 'team',
    label: 'Team',
    items: [
      { label: 'Staff', path: '/staff', icon: FiUsers },
      { label: 'Attendance', path: '/attendance', icon: FaRegClipboard },
    ],
  },
]

export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <>
      <NavLink to="/dashboard" onClick={onNavigate}>
        {({ isActive }) => (
          <HStack
            px={3}
            py={2.5}
            mb={3}
            rounded="lg"
            cursor="pointer"
            gap={3}
            bg={isActive ? 'whiteAlpha.200' : 'transparent'}
            border="1px solid"
            borderColor={isActive ? 'whiteAlpha.300' : 'transparent'}
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <MdSpaceDashboard size={16} color="white" />
            <Text fontSize="sm" fontWeight={isActive ? '700' : '500'} color="white">
              Dashboard
            </Text>
          </HStack>
        )}
      </NavLink>

      <VStack align="stretch" gap={3}>
        {sections.map((section) => (
          <Box key={section.value}>
            <Text
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="700"
              color="whiteAlpha.700"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {section.label}
            </Text>
            <VStack align="stretch" gap={1}>
              {section.items.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={onNavigate}>
                  {({ isActive }) => (
                    <HStack
                      px={3}
                      py={2.25}
                      rounded="lg"
                      bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                      border="1px solid"
                      borderColor={isActive ? 'whiteAlpha.300' : 'transparent'}
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      {item.icon && <item.icon size={16} />}
                      <Text fontSize="sm" fontWeight={isActive ? '700' : '500'}>
                        {item.label}
                      </Text>
                    </HStack>
                  )}
                </NavLink>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </>
  )
}
