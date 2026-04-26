import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, useMediaQuery } from '@chakra-ui/react'
import { X } from 'lucide-react'

export interface InvoiceFormValues {
  invoiceNumber: string
  customerName: string
  totalAmount: string
}

interface InvoiceDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  defaultValues?: InvoiceFormValues
}

export default function InvoiceModal({ open, onClose, mode, defaultValues }: InvoiceDialogProps) {
  const [formData, setFormData] = useState<InvoiceFormValues>({
    invoiceNumber: '',
    customerName: '',
    totalAmount: '',
  })

  useEffect(() => {
    if (defaultValues) setFormData(defaultValues)
    else {
      setFormData({
        invoiceNumber: '',
        customerName: '',
        totalAmount: '',
      })
    }
  }, [defaultValues, mode])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    onClose()
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

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
          <Dialog.Content bg="white" rounded="lg" shadow="lg" p={4} width="100%" maxW="600px">
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="2xl" fontWeight="700">
                {mode === 'add' ? 'Create Invoice' : 'Edit Invoice'}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Field.Root mb={3}>
                <Field.Label>Invoice Number</Field.Label>
                <Input
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Customer Name</Field.Label>
                <Input name="customerName" value={formData.customerName} onChange={handleChange} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Total Amount</Field.Label>
                <Input name="totalAmount" value={formData.totalAmount} onChange={handleChange} />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button variant="subtle" width="50%">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button bg="#6730EC" color="white" width="50%" onClick={handleSubmit}>
                {mode === 'add' ? 'Create Invoice' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
