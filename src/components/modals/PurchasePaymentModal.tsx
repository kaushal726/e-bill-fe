import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, Text, useMediaQuery } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { usePurchaseActions } from '@/hooks/usePurchaseActions'

interface PurchasePaymentModalProps {
  open: boolean
  onClose: () => void
  purchaseId?: string
  defaultPaidAmount?: number
  defaultNote?: string
}

export default function PurchasePaymentModal({
  open,
  onClose,
  purchaseId,
  defaultPaidAmount,
  defaultNote,
}: PurchasePaymentModalProps) {
  const [paidAmount, setPaidAmount] = useState('0')
  const [note, setNote] = useState('')
  const { updatePurchase } = usePurchaseActions()

  useEffect(() => {
    setPaidAmount(String(defaultPaidAmount ?? 0))
    setNote(defaultNote || '')
  }, [defaultPaidAmount, defaultNote, open])

  function handleSubmit() {
    if (!purchaseId) return

    updatePurchase.mutate(
      {
        purchaseId,
        payload: {
          paidAmount: Number(paidAmount || 0),
          note,
        },
      },
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
            maxW="560px"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                Update Purchase
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Only paid amount and note can be updated for an existing purchase.
              </Text>

              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Paid Amount
                </Field.Label>
                <Input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  bg="white"
                  borderColor="gray.200"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="gray.700" fontWeight="600">
                  Note
                </Field.Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  bg="white"
                  borderColor="gray.200"
                />
              </Field.Root>
            </Dialog.Body>

            <Dialog.Footer gap={3} justifyContent="flex-end">
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="subtle"
                  minW="120px"
                  width="50%"
                  color="gray.700"
                  borderColor="gray.300"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button
                minW="160px"
                bg="gray.950"
                color="white"
                width="50%"
                loading={updatePurchase.isPending}
                onClick={handleSubmit}
              >
                Update Purchase
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
