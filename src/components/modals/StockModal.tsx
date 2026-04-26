import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, useMediaQuery } from '@chakra-ui/react'
import { X } from 'lucide-react'

export interface StockFormValues {
  productName: string
  quantity: string
  unitPrice: string
}

interface StockDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  defaultValues?: StockFormValues
}

export default function StockModal({ open, onClose, mode, defaultValues }: StockDialogProps) {
  const [formData, setFormData] = useState<StockFormValues>({
    productName: '',
    quantity: '',
    unitPrice: '',
  })

  useEffect(() => {
    if (defaultValues) setFormData(defaultValues)
    else {
      setFormData({
        productName: '',
        quantity: '',
        unitPrice: '',
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
                {mode === 'add' ? 'Add Stock' : 'Edit Stock'}
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Field.Root mb={3}>
                <Field.Label>Product Name</Field.Label>
                <Input name="productName" value={formData.productName} onChange={handleChange} />
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>Quantity</Field.Label>
                <Input name="quantity" value={formData.quantity} onChange={handleChange} />
              </Field.Root>

              <Field.Root>
                <Field.Label>Unit Price</Field.Label>
                <Input name="unitPrice" value={formData.unitPrice} onChange={handleChange} />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button variant="subtle" width="50%">
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button bg="#6730EC" color="white" width="50%" onClick={handleSubmit}>
                {mode === 'add' ? 'Add Stock' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
