import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  Portal,
  Button,
  Input,
  Field,
  useMediaQuery,
  Select,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useSupplier } from '@/hooks/useSupplier'
import { useBillActions } from '@/hooks/useBillActions'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'

export interface BillFormValues {
  billNumber: string
  supplierId: string
  poNumber?: string
  billDate?: string
  dueDate?: string
  amount: string
}

interface BillDialogProps {
  open: boolean
  onClose: () => void
  defaultValues?: BillFormValues & { _id?: string }
}

const getTodayDate = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

export default function BillModal({ open, onClose, defaultValues }: BillDialogProps) {
  const [formData, setFormData] = useState<BillFormValues>({
    billNumber: '',
    supplierId: '',
    poNumber: '',
    billDate: '',
    dueDate: '',
    amount: '',
  })

  const { data: suppliers = [] } = useSupplier()
  const { createBill, updateBill } = useBillActions()

  const supplierCollection = useMemo(
    () =>
      createListCollection({
        items: suppliers.map((s: any) => ({
          label: `${s.name} (${s.mobileNumber})`,
          value: s._id,
        })),
      }),
    [suppliers],
  )

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        billNumber: defaultValues.billNumber,
        supplierId: defaultValues.supplierId,
        poNumber: defaultValues.poNumber || '',
        billDate: defaultValues.billDate || '',
        dueDate: defaultValues.dueDate || '',
        amount: defaultValues.amount,
      })
      return
    }

    setFormData({
      billNumber: '',
      supplierId: '',
      poNumber: '',
      billDate: getTodayDate(),
      dueDate: getTodayDate(),
      amount: '',
    })
  }, [defaultValues, open])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    const payload = {
      billNumber: formData.billNumber.trim(),
      supplierId: formData.supplierId.trim(),
      poNumber: formData.poNumber?.trim(),
      billDate: formData.billDate,
      dueDate: formData.dueDate,
      amount: Number(formData.amount),
    }

    if (defaultValues?._id) {
      updateBill.mutate({ billId: defaultValues._id, payload }, { onSuccess: onClose })
    } else {
      createBill.mutate(payload, { onSuccess: onClose })
    }
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])
  const isLoading = createBill.isPending || updateBill.isPending

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onClose()}
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
            maxW="600px"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                {defaultValues?._id ? 'Edit Bill' : 'Add Bill'}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <VStack align="stretch" gap={4}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Bill Number
                  </Field.Label>
                  <Input
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleChange}
                    placeholder="e.g., BILL-2026-001"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Supplier
                  </Field.Label>
                  <Select.Root
                    collection={supplierCollection}
                    value={formData.supplierId ? [formData.supplierId] : []}
                    onValueChange={(details) =>
                      setFormData((prev) => ({ ...prev, supplierId: details.value[0] || '' }))
                    }
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect name="supplierId" />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select supplier" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {supplierCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Field.Root>

                <HStack gap={3} align="start" flexWrap="wrap">
                  <Field.Root flex="1" minW="180px">
                    <Field.Label color="gray.700" fontWeight="600">
                      PO Number
                    </Field.Label>
                    <Input
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleChange}
                      placeholder="Optional"
                      bg="white"
                      borderColor="gray.200"
                    />
                  </Field.Root>

                  <Field.Root flex="1" minW="180px">
                    <Field.Label color="gray.700" fontWeight="600">
                      Bill Date
                    </Field.Label>
                    <DateInputWithIcon
                      name="billDate"
                      value={formData.billDate || getTodayDate()}
                      onChange={(value) => setFormData((prev) => ({ ...prev, billDate: value }))}
                    />
                  </Field.Root>
                </HStack>

                <HStack gap={3} align="start" flexWrap="wrap">
                  <Field.Root flex="1" minW="180px">
                    <Field.Label color="gray.700" fontWeight="600">
                      Due Date
                    </Field.Label>
                    <DateInputWithIcon
                      name="dueDate"
                      value={formData.dueDate || getTodayDate()}
                      onChange={(value) => setFormData((prev) => ({ ...prev, dueDate: value }))}
                    />
                  </Field.Root>

                  <Field.Root flex="1" minW="180px">
                    <Field.Label color="gray.700" fontWeight="600">
                      Amount
                    </Field.Label>
                    <Input
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0"
                      bg="white"
                      borderColor="gray.200"
                    />
                  </Field.Root>
                </HStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button
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
                width="50%"
                bg="gray.950"
                color="white"
                loading={isLoading}
                onClick={handleSubmit}
              >
                {defaultValues?._id ? 'Update Bill' : 'Create Bill'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
