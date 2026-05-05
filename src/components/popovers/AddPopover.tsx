import { Box, Text, VStack, HStack, Portal } from '@chakra-ui/react'
import { Popover } from '@chakra-ui/react'
import { UserPlus, Package, FileText, Tags, Layers, Receipt } from 'lucide-react'
import { useState } from 'react'

type AddPopoverProps = {
  trigger: React.ReactNode
  onAddCustomer: () => void
  onAddProduct: () => void
  onAddInvoice: () => void
  onAddCategory: () => void
  onAddStock: () => void
  onAddBill: () => void
}

type AddAction = {
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export const AddPopover = ({
  trigger,
  onAddCustomer,
  onAddProduct,
  onAddInvoice,
  onAddCategory,
  onAddStock,
  onAddBill,
}: AddPopoverProps) => {
  const [open, setOpen] = useState(false)
  const actions: AddAction[] = [
    {
      label: 'Customer',
      icon: <UserPlus size={16} />,
      onClick: () => {
        setOpen(false)
        onAddCustomer()
      },
    },
    {
      label: 'Product',
      icon: <Package size={16} />,
      onClick: () => {
        setOpen(false)
        onAddProduct()
      },
    },
    {
      label: 'Invoice',
      icon: <FileText size={16} />,
      onClick: () => {
        setOpen(false)
        onAddInvoice()
      },
    },
    {
      label: 'Category',
      icon: <Tags size={16} />,
      onClick: () => {
        setOpen(false)
        onAddCategory()
      },
    },
    {
      label: 'Stock',
      icon: <Layers size={16} />,
      onClick: () => {
        setOpen(false)
        onAddStock()
      },
    },
    {
      label: 'Bill',
      icon: <Receipt size={16} />,
      onClick: () => {
        setOpen(false)
        onAddBill()
      },
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
            zIndex={10}
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
                  <Box color="gray.600">{action.icon}</Box>
                  <Text fontSize="sm" fontWeight="500" color="gray.800">
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
