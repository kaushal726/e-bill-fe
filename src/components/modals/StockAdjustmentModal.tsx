import { useMemo, useState } from 'react'
import {
  Dialog,
  Portal,
  Button,
  Input,
  Field,
  useMediaQuery,
  Select,
  HStack,
} from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useProducts } from '@/hooks/useProducts'
import { useStockHistoryActions } from '@/hooks/useStockHistoryActions'

interface StockAdjustmentModalProps {
  open: boolean
  onClose: () => void
}

const typeCollection = createListCollection({
  items: [
    { label: 'Stock In', value: 'IN' },
    { label: 'Stock Out', value: 'OUT' },
  ],
})

export default function StockAdjustmentModal({ open, onClose }: StockAdjustmentModalProps) {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [type, setType] = useState<'IN' | 'OUT'>('IN')
  const [note, setNote] = useState('')

  const { data: productData } = useProducts({ page: 1, limit: 50 })
  const { createManualAdjustment } = useStockHistoryActions()

  const products = productData?.products ?? []

  const productCollection = useMemo(
    () =>
      createListCollection({
        items: products.map((p: any) => ({
          label: `${p.name} (${p.unit || 'pcs'})`,
          value: p._id,
        })),
      }),
    [products],
  )

  const resetForm = () => {
    setProductId('')
    setQuantity('1')
    setType('IN')
    setNote('')
  }

  function handleSubmit() {
    if (!productId) return

    createManualAdjustment.mutate(
      {
        productId,
        quantity: Number(quantity || 0),
        type,
        note: note.trim(),
      },
      {
        onSuccess: () => {
          resetForm()
          onClose()
        },
      },
    )
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) {
          resetForm()
          onClose()
        }
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
                Stock Adjustment
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Product
                </Field.Label>
                <Select.Root
                  collection={productCollection}
                  value={productId ? [productId] : []}
                  onValueChange={(details) => setProductId(details.value[0] || '')}
                  positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select product" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content bg="white">
                      {productCollection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Field.Root>

              <HStack align="start" gap={3}>
                <Field.Root flex="1">
                  <Field.Label color="gray.700" fontWeight="600">
                    Quantity
                  </Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root flex="1">
                  <Field.Label color="gray.700" fontWeight="600">
                    Type
                  </Field.Label>
                  <Select.Root
                    collection={typeCollection}
                    value={[type]}
                    onValueChange={(details) => setType((details.value[0] as 'IN' | 'OUT') || 'IN')}
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {typeCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Field.Root>
              </HStack>

              <Field.Root mt={3}>
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
                loading={createManualAdjustment.isPending}
                onClick={handleSubmit}
              >
                Adjust Stock
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
