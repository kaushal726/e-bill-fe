import { useEffect, useState } from 'react'
import {
  Dialog,
  Portal,
  Button,
  Input,
  Field,
  useMediaQuery,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useSupplierActions } from '@/hooks/useSupplierActions'

export interface SupplierFormValues {
  name: string
  mobileNumber: string
  address?: string
  gstNumber?: string
  bankName?: string
  accountHolderName?: string
  bankAccountNumber?: string
  ifscCode?: string
  pendingAmount?: number
  totalPurchaseAmount?: number
}

interface SupplierDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  pubId?: string
  defaultValues?: SupplierFormValues
}

export default function SupplierModal({
  open,
  onClose,
  mode,
  pubId,
  defaultValues,
}: SupplierDialogProps) {
  const [formData, setFormData] = useState<SupplierFormValues>({
    name: '',
    mobileNumber: '',
    address: '',
    gstNumber: '',
    bankName: '',
    accountHolderName: '',
    bankAccountNumber: '',
    ifscCode: '',
    pendingAmount: 0,
    totalPurchaseAmount: 0,
  })

  const { createSupplier, updateSupplier } = useSupplierActions()

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues)
    } else {
      setFormData({
        name: '',
        mobileNumber: '',
        address: '',
        gstNumber: '',
        bankName: '',
        accountHolderName: '',
        bankAccountNumber: '',
        ifscCode: '',
        pendingAmount: 0,
        totalPurchaseAmount: 0,
      })
    }
  }, [defaultValues, mode])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit() {
    const payload = {
      name: formData.name.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      address: formData.address?.trim() || '',
      gstNumber: formData.gstNumber?.trim().toUpperCase() || '',
      bankName: formData.bankName?.trim() || '',
      accountHolderName: formData.accountHolderName?.trim() || '',
      bankAccountNumber: formData.bankAccountNumber?.trim() || '',
      ifscCode: formData.ifscCode?.trim().toUpperCase() || '',
      pendingAmount: formData.pendingAmount ?? 0,
      totalPurchaseAmount: formData.totalPurchaseAmount ?? 0,
    }

    if (mode === 'add') {
      createSupplier.mutate(payload, {
        onSuccess: onClose,
      })
      return
    }

    if (!pubId) return

    updateSupplier.mutate(
      { supplierId: pubId, payload },
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
      placement={isLarge ? 'center' : 'bottom'}
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
            maxW="640px"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                {mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
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
                    Supplier Name
                  </Field.Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Mobile Number
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

              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Address
                </Field.Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  bg="white"
                  borderColor="gray.200"
                />
              </Field.Root>

              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                letterSpacing="0.08em"
                textTransform="uppercase"
                mb={2}
                mt={1}
              >
                GST Details
              </Text>

              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  GST Number
                </Field.Label>
                <Input
                  name="gstNumber"
                  value={formData.gstNumber ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  bg="white"
                  borderColor="gray.200"
                  textTransform="uppercase"
                />
              </Field.Root>

              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                letterSpacing="0.08em"
                textTransform="uppercase"
                mb={2}
                mt={1}
              >
                Bank Details
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Bank Name
                  </Field.Label>
                  <Input
                    name="bankName"
                    value={formData.bankName ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. State Bank of India"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Account Holder Name
                  </Field.Label>
                  <Input
                    name="accountHolderName"
                    value={formData.accountHolderName ?? ''}
                    onChange={handleChange}
                    placeholder="Name on bank account"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Account Number
                  </Field.Label>
                  <Input
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber ?? ''}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    IFSC Code
                  </Field.Label>
                  <Input
                    name="ifscCode"
                    value={formData.ifscCode ?? ''}
                    onChange={handleChange}
                    placeholder="e.g. SBIN0001234"
                    bg="white"
                    borderColor="gray.200"
                    textTransform="uppercase"
                  />
                </Field.Root>
              </SimpleGrid>

              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                letterSpacing="0.08em"
                textTransform="uppercase"
                mb={2}
                mt={1}
              >
                Amount
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Pending Amount
                  </Field.Label>
                  <Input
                    name="pendingAmount"
                    type="number"
                    min={0}
                    value={formData.pendingAmount ?? ''}
                    onChange={handleChange}
                    placeholder="Enter pending amount"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Total Purchase Amount
                  </Field.Label>
                  <Input
                    name="totalPurchaseAmount"
                    type="number"
                    min={0}
                    value={formData.totalPurchaseAmount ?? ''}
                    onChange={handleChange}
                    placeholder="Enter total purchased"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>
              </SimpleGrid>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button
                  minW="120px"
                  width="50%"
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button
                minW="160px"
                bg="black"
                color="white"
                width="50%"
                loading={createSupplier.isPending || updateSupplier.isPending}
                onClick={handleSubmit}
              >
                {mode === 'add' ? 'Add Supplier' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
