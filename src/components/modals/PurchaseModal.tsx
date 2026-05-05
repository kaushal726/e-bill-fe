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
  Box,
  Tabs,
  SimpleGrid,
} from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { Plus, Trash2, X } from 'lucide-react'

import { useSupplier } from '@/hooks/useSupplier'
import { useProducts } from '@/hooks/useProducts'
import { usePurchaseActions } from '@/hooks/usePurchaseActions'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import { toaster } from '@/components/ui/toaster'
import {
  SplitPaymentInput,
  DEFAULT_SPLITS,
  getSplitsPayload,
  type PaymentSplit,
} from '@/components/common/SplitPaymentInput'

type PurchaseFormItem = {
  productId: string
  quantity: string
  price: string
  discount?: string
  discountType?: 'percentage' | 'absolute'
  discountValue?: string
  gstPercentage?: string
}

export interface PurchaseFormValues {
  supplierId?: string
  supplierName?: string
  invoiceNumber?: string
  purchaseDate?: string
  paymentSplits: PaymentSplit[]
  note?: string
  items: PurchaseFormItem[]
}

interface PurchaseDialogProps {
  open: boolean
  onClose: () => void
  defaultValues?: PurchaseFormValues
}

const getTodayDate = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

export default function PurchaseModal({ open, onClose, defaultValues }: PurchaseDialogProps) {
  const [supplierMode, setSupplierMode] = useState<'registered' | 'walkin'>('registered')
  const [formData, setFormData] = useState<PurchaseFormValues>({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    purchaseDate: '',
    paymentSplits: DEFAULT_SPLITS,
    note: '',
    items: [
      {
        productId: '',
        quantity: '1',
        price: '0',
        discount: '',
        discountType: 'absolute',
        discountValue: '0',
        gstPercentage: '0',
      },
    ],
  })

  const { data: suppliers = [] } = useSupplier()
  const { data: productData } = useProducts({ page: 1, limit: 50 })
  const { createPurchase } = usePurchaseActions()

  const products = productData?.products ?? []

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

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues)
      return
    }

    setSupplierMode('registered')
    setFormData({
      supplierId: '',
      supplierName: '',
      invoiceNumber: '',
      purchaseDate: getTodayDate(),
      paymentSplits: DEFAULT_SPLITS,
      note: '',
      items: [
        {
          productId: '',
          quantity: '1',
          price: '0',
          discount: '',
          discountType: 'absolute',
          discountValue: '0',
          gstPercentage: '0',
        },
      ],
    })
  }, [defaultValues, open])

  const getItemPreview = (item: PurchaseFormItem) => {
    const qty = Number(item.quantity || 0)
    const price = Number(item.price || 0)
    const discountInput = item.discount?.trim() || ''
    const discountValue =
      discountInput === '' ? Number(item.discountValue || 0) : Number(discountInput)
    const gstRate = Number(item.gstPercentage || 0)
    const discountType = item.discountType === 'percentage' ? 'percentage' : 'absolute'

    const safeQty = Number.isFinite(qty) ? Math.max(0, qty) : 0
    const safePrice = Number.isFinite(price) ? Math.max(0, price) : 0
    const normalizedDiscount = Number.isFinite(discountValue) ? Math.max(0, discountValue) : 0

    const discountPerUnit =
      discountType === 'percentage' ? (safePrice * normalizedDiscount) / 100 : normalizedDiscount
    const safeDiscount = Math.min(Math.max(discountPerUnit, 0), safePrice)
    const priceAfterDiscount = safePrice - safeDiscount
    const gstPerUnit = (priceAfterDiscount * gstRate) / 100
    const cgstPerUnit = gstPerUnit / 2
    const sgstPerUnit = gstPerUnit / 2
    const finalUnitPrice = priceAfterDiscount + gstPerUnit
    const lineTotal = finalUnitPrice * safeQty

    return {
      discountValue: normalizedDiscount,
      discountPerUnit: safeDiscount,
      priceAfterDiscount,
      gstPerUnit,
      cgstPerUnit,
      sgstPerUnit,
      finalUnitPrice,
      lineTotal,
    }
  }

  const totals = useMemo(() => {
    const totalAmount = formData.items.reduce((sum, item) => {
      return sum + getItemPreview(item).lineTotal
    }, 0)

    return { totalAmount }
  }, [formData.items, products])

  function updateItem(index: number, key: keyof PurchaseFormItem, value: string) {
    setFormData((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: '1',
          price: '0',
          discount: '',
          discountType: 'absolute',
          discountValue: '0',
          gstPercentage: '0',
        },
      ],
    }))
  }

  function removeItem(index: number) {
    setFormData((prev) => {
      if (prev.items.length === 1) return prev
      return { ...prev, items: prev.items.filter((_, i) => i !== index) }
    })
  }

  function handleSubmit() {
    const validItems = formData.items.filter((item) => item.productId && Number(item.quantity) > 0)

    if (validItems.length === 0) {
      toaster.error({ title: 'Add at least one valid item' })
      return
    }

    for (let i = 0; i < validItems.length; i += 1) {
      const item = validItems[i]
      const quantity = Number(item.quantity || 0)
      const price = Number(item.price || 0)
      const hasDiscount = (item.discount?.trim() || '') !== ''
      const discount = Number(item.discount)
      const discountType = item.discountType === 'percentage' ? 'percentage' : 'absolute'

      if (!item.productId) {
        toaster.error({ title: `Item ${i + 1}: product is required` })
        return
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        toaster.error({ title: `Item ${i + 1}: quantity must be greater than 0` })
        return
      }
      if (!Number.isFinite(price) || price < 0) {
        toaster.error({ title: `Item ${i + 1}: price cannot be negative` })
        return
      }
      if (hasDiscount && (!Number.isFinite(discount) || discount < 0)) {
        toaster.error({ title: `Item ${i + 1}: discount cannot be negative` })
        return
      }
      if (hasDiscount && discountType === 'percentage' && discount > 100) {
        toaster.error({ title: `Item ${i + 1}: percentage discount cannot be more than 100` })
        return
      }
      if (hasDiscount && discountType === 'absolute' && discount > price) {
        toaster.error({ title: `Item ${i + 1}: absolute discount cannot be greater than price` })
        return
      }
    }

    const payload = {
      ...(supplierMode === 'registered' && formData.supplierId
        ? { supplierId: formData.supplierId }
        : { supplierName: formData.supplierName?.trim() || 'Walk-in Supplier' }),
      invoiceNumber: formData.invoiceNumber?.trim() || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      paymentSplits: getSplitsPayload(formData.paymentSplits),
      note: formData.note?.trim() || '',
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price || 0),
        ...(item.discount?.trim() ? { discount: Number(item.discount) } : {}),
      })),
    }

    createPurchase.mutate(payload, { onSuccess: onClose })
  }

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      scrollBehavior="inside"
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
            maxW="760px"
            w="100%"
            maxH="90vh"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                Add Purchase
              </Dialog.Title>

              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body
              pt={4}
              overflowY="auto"
              css={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <VStack align="stretch" gap={3}>
                {/* Supplier */}
                <Box border="1px solid" borderColor="gray.200" borderRadius="14px" p={3} bg="white">
                  <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                    Supplier
                  </Text>
                  <Tabs.Root
                    value={supplierMode}
                    onValueChange={(d) => setSupplierMode(d.value as 'registered' | 'walkin')}
                    variant="enclosed"
                    size="sm"
                    mb={3}
                  >
                    <Tabs.List>
                      <Tabs.Trigger value="registered">Registered</Tabs.Trigger>
                      <Tabs.Trigger value="walkin">Walk-in</Tabs.Trigger>
                    </Tabs.List>
                  </Tabs.Root>

                  {supplierMode === 'registered' ? (
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
                  ) : (
                    <Input
                      value={formData.supplierName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, supplierName: e.target.value }))
                      }
                      placeholder="Supplier name (or leave blank for Walk-in)"
                      bg="white"
                      borderColor="gray.200"
                    />
                  )}
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Field.Root>
                    <Field.Label color="gray.700" fontWeight="600">
                      Invoice Number
                    </Field.Label>
                    <Input
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                      }
                      placeholder="Optional"
                      bg="white"
                      borderColor="gray.200"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label color="gray.700" fontWeight="600">
                      Purchase Date
                    </Field.Label>
                    <DateInputWithIcon
                      name="purchaseDate"
                      value={formData.purchaseDate || getTodayDate()}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, purchaseDate: value }))
                      }
                    />
                  </Field.Root>
                </SimpleGrid>

                <Box border="1px solid" borderColor="gray.200" borderRadius="14px" p={3} bg="white">
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      Purchase Items
                    </Text>
                    <Button
                      size="sm"
                      bg="white"
                      color="gray.800"
                      border="1px solid"
                      borderColor="gray.200"
                      onClick={addItem}
                    >
                      <HStack gap={1}>
                        <Plus size={14} />
                        <Text fontSize="xs">Add Item</Text>
                      </HStack>
                    </Button>
                  </HStack>

                  <VStack align="stretch" gap={2}>
                    {formData.items.map((item, index) => (
                      <Box
                        key={index}
                        border="1px solid"
                        borderColor="gray.100"
                        borderRadius="10px"
                        p={2.5}
                      >
                        <SimpleGrid columns={{ base: 1, md: 12 }} gap={2} alignItems="end">
                          <Box gridColumn={{ base: 'span 1', md: 'span 7' }}>
                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                Product
                              </Field.Label>
                              <Select.Root
                                collection={productCollection}
                                value={item.productId ? [item.productId] : []}
                                onValueChange={(details) => {
                                  const selectedProductId = details.value[0] || ''
                                  const product = products.find(
                                    (p: any) => p._id === selectedProductId,
                                  )

                                  setFormData((prev) => {
                                    const items = [...prev.items]
                                    items[index] = {
                                      ...items[index],
                                      productId: selectedProductId,
                                      price: product
                                        ? String(product.purchasePrice || 0)
                                        : items[index].price,
                                      discount: items[index].discount?.trim()
                                        ? items[index].discount
                                        : String(product?.discountValue ?? ''),
                                      discountType:
                                        product?.discountType === 'percentage'
                                          ? 'percentage'
                                          : 'absolute',
                                      discountValue: String(product?.discountValue ?? 0),
                                      gstPercentage: String(product?.gstPercentage ?? 0),
                                    }
                                    return { ...prev, items }
                                  })
                                }}
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
                                    {productCollection.items.map((collectionItem) => (
                                      <Select.Item item={collectionItem} key={collectionItem.value}>
                                        {collectionItem.label}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                              </Select.Root>
                            </Field.Root>
                          </Box>

                          <Box gridColumn={{ base: 'span 1', md: 'span 2' }}>
                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                Qty
                              </Field.Label>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                bg="white"
                                borderColor="gray.200"
                              />
                            </Field.Root>
                          </Box>

                          <Box gridColumn={{ base: 'span 1', md: 'span 2' }}>
                            <Button
                              size="sm"
                              w="100%"
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                            >
                              <HStack gap={1}>
                                <Trash2 size={14} />
                                <Text fontSize="xs">Remove</Text>
                              </HStack>
                            </Button>
                          </Box>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={2} mt={2}>
                          <Field.Root>
                            <Field.Label fontSize="xs" color="gray.600">
                              Unit Price (without GST)
                            </Field.Label>
                            <Input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', e.target.value)}
                              bg="white"
                              borderColor="gray.200"
                            />
                          </Field.Root>

                          <Field.Root>
                            <Field.Label fontSize="xs" color="gray.600">
                              {item.discountType === 'percentage'
                                ? 'Discount (%)'
                                : 'Discount (Rs)'}
                            </Field.Label>
                            <Input
                              type="number"
                              min={0}
                              value={item.discount || ''}
                              onChange={(e) => updateItem(index, 'discount', e.target.value)}
                              bg="white"
                              borderColor="gray.200"
                              placeholder="Leave blank for product default"
                            />
                          </Field.Root>

                          <Field.Root>
                            <Field.Label fontSize="xs" color="gray.600">
                              GST
                            </Field.Label>
                            <HStack
                              h="40px"
                              px={3}
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              bg="gray.50"
                              justify="space-between"
                            >
                              <Text fontSize="xs" color="gray.600">
                                Fixed from product
                              </Text>
                              <Text fontSize="xs" color="gray.700" fontWeight="600">
                                {Number(item.gstPercentage || 0)}%
                              </Text>
                            </HStack>
                          </Field.Root>
                        </SimpleGrid>

                        <SimpleGrid
                          columns={{ base: 1, md: 3 }}
                          gap={2}
                          mt={2}
                          p={2}
                          borderRadius="8px"
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <Text fontSize="xs" color="gray.700">
                            Price after discount: INR{' '}
                            {getItemPreview(item).priceAfterDiscount.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.700">
                            GST per unit: INR {getItemPreview(item).gstPerUnit.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.700">
                            CGST per unit: INR {getItemPreview(item).cgstPerUnit.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.700">
                            SGST per unit: INR {getItemPreview(item).sgstPerUnit.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.900" fontWeight="600">
                            Final unit price: INR {getItemPreview(item).finalUnitPrice.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.900" fontWeight="700">
                            Item line total: INR {getItemPreview(item).lineTotal.toFixed(2)}
                          </Text>
                        </SimpleGrid>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <SplitPaymentInput
                    label="Payment Breakdown"
                    splits={formData.paymentSplits}
                    onChange={(splits) =>
                      setFormData((prev) => ({ ...prev, paymentSplits: splits }))
                    }
                  />
                </Box>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Note
                  </Field.Label>
                  <Input
                    value={formData.note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="Optional note"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <HStack justify="space-between" p={3} borderRadius="12px" bg="gray.50">
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    Grand Total: INR {totals.totalAmount.toFixed(2)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Preview matches backend purchase calculation flow.
                  </Text>
                </HStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              gap={2}
              justifyContent="flex-end"
              flexDirection={{ base: 'column', sm: 'row' }}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  minW="120px"
                  w={{ base: '100%', sm: 'auto' }}
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>

              <Button
                w={{ base: '100%', sm: 'auto' }}
                bg="black"
                color="white"
                loading={createPurchase.isPending}
                onClick={handleSubmit}
              >
                Create Purchase
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
