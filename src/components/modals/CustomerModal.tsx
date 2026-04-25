import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, useMediaQuery, SimpleGrid } from '@chakra-ui/react'
import { useCustomerActions } from '@/hooks/useCustomerActions'
import { X } from 'lucide-react'

export interface CustomerFormValues {
  name: string
  mobileNumber: string
  email?: string
  address?: string
  balance?: string
}

interface CustomerDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  pubId?: string
  defaultValues?: CustomerFormValues
}

export default function CustomerDialog({
  open,
  onClose,
  mode,
  pubId,
  defaultValues,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState<CustomerFormValues>({
    name: '',
    mobileNumber: '',
    email: '',
    address: '',
    balance: '',
  })

  const { createCustomer, updateCustomer } = useCustomerActions()

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues)
    } else {
      setFormData({
        name: '',
        mobileNumber: '',
        email: '',
        address: '',
        balance: '',
      })
    }
  }, [defaultValues, mode])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    const basePayload = {
      name: formData.name.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      email: formData.email?.trim() || '',
      address: formData.address?.trim() || '',
    }

    if (mode === 'add') {
      createCustomer.mutate(basePayload, {
        onSuccess: onClose,
      })
      return
    }

    const payload = {
      ...basePayload,
      ...(formData.balance !== '' && formData.balance != null
        ? { balance: Number(formData.balance) }
        : {}),
    }

    if (!pubId) return

    updateCustomer.mutate(
      { customerId: pubId, payload },
      {
        onSuccess: onClose,
      },
    )
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      preventScroll
      size={isLarge ? 'lg' : 'full'}
      placement={isLarge ? 'center' : 'bottom'} //
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
            rounded="2xl"
            shadow="xl"
            p={4}
            width="100%"
            maxW="600px"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                {mode === 'add' ? 'Add New Customer' : 'Edit Customer'}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Full Name
                  </Field.Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Full Name"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Phone Number
                  </Field.Label>
                  <Input
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: mode === 'edit' ? 2 : 1 }} gap={3} mb={3}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Email
                  </Field.Label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                {mode === 'edit' && (
                  <Field.Root>
                    <Field.Label color="gray.700" fontWeight="600">
                      Balance
                    </Field.Label>
                    <Input
                      name="balance"
                      value={formData.balance}
                      onChange={handleChange}
                      placeholder="Enter Balance"
                      type="number"
                      bg="white"
                      borderColor="gray.200"
                    />
                  </Field.Root>
                )}
              </SimpleGrid>

              <Field.Root>
                <Field.Label color="gray.700" fontWeight="600">
                  Address
                </Field.Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  bg="white"
                  borderColor="gray.200"
                />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer
              gap={3}
              justifyContent="flex-end"
              flexDirection={{ base: 'column-reverse', md: 'row' }}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  minW="120px"
                  width={{ base: '100%', md: '50%' }}
                  color="black"
                  borderColor="black"
                  bg="white"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button
                minW="160px"
                bg="black"
                color="white"
                width={{ base: '100%', md: '50%' }}
                loading={createCustomer.isPending || updateCustomer.isPending}
                onClick={handleSubmit}
              >
                {mode === 'add' ? 'Add Customer' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
