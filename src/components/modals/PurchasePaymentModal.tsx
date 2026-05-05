import { useEffect, useState } from 'react'
import { Dialog, Portal, Button, Input, Field, Text, useMediaQuery, Box } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { usePurchaseActions } from '@/hooks/usePurchaseActions'
import {
  SplitPaymentInput,
  DEFAULT_SPLITS,
  getSplitsPayload,
  type PaymentSplit,
} from '@/components/common/SplitPaymentInput'
import type { PaymentSplitRecord } from '@/hooks/usePayment'

interface PurchasePaymentModalProps {
  open: boolean
  onClose: () => void
  purchaseId?: string
  defaultPaymentSplits?: PaymentSplitRecord[]
  defaultNote?: string
}

export default function PurchasePaymentModal({
  open,
  onClose,
  purchaseId,
  defaultPaymentSplits,
  defaultNote,
}: PurchasePaymentModalProps) {
  const [splits, setSplits] = useState<PaymentSplit[]>(DEFAULT_SPLITS)
  const [note, setNote] = useState('')
  const { updatePurchase } = usePurchaseActions()

  useEffect(() => {
    if (open) {
      if (defaultPaymentSplits && defaultPaymentSplits.length > 0) {
        setSplits(
          DEFAULT_SPLITS.map((d) => {
            const existing = defaultPaymentSplits.find((s) => s.mode === d.mode)
            return { ...d, amount: existing ? String(existing.amount) : '' }
          }),
        )
      } else {
        setSplits(DEFAULT_SPLITS)
      }
      setNote(defaultNote || '')
    }
  }, [open, defaultPaymentSplits, defaultNote])

  function handleSubmit() {
    if (!purchaseId) return
    const paymentSplits = getSplitsPayload(splits)
    updatePurchase.mutate({ purchaseId, payload: { paymentSplits, note } }, { onSuccess: onClose })
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
                Update Purchase Payment
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Update how this purchase payment was split across payment modes.
              </Text>

              <Box mb={3}>
                <SplitPaymentInput label="Payment Breakdown" splits={splits} onChange={setSplits} />
              </Box>

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
