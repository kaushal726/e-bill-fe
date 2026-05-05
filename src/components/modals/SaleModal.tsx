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
import { useQuery } from '@tanstack/react-query'

import { useCustomers } from '@/hooks/useCustomer'
import { useProducts } from '@/hooks/useProducts'
import { useSaleActions, useNextInvoiceNumber } from '@/hooks/useSaleActions'
import { useAllStaff } from '@/hooks/useStaff'
import { DateInputWithIcon } from '@/components/common/DateInputWithIcon'
import {
  SplitPaymentInput,
  DEFAULT_SPLITS,
  getSplitsPayload,
  getSplitTotal,
  type PaymentSplit,
} from '@/components/common/SplitPaymentInput'
import { API } from '@/api/api'
import { API_ENDPOINTS } from '@/api/apiEndpoints'

type SaleFormItem = {
  productId: string
  quantity: string
  price: string
  discountType: 'percentage' | 'absolute'
  discountValue: string
  gstPercentage: string
  gstInclusive: 'exclusive' | 'inclusive'
}

type ExtraChargeFormItem = {
  label: string
  amount: string
}

const createEmptyItem = (): SaleFormItem => ({
  productId: '',
  quantity: '1',
  price: '0',
  discountType: 'percentage',
  discountValue: '0',
  gstPercentage: '0',
  gstInclusive: 'exclusive',
})

export interface SaleFormValues {
  customerId?: string
  customerName?: string
  invoiceNumber?: string
  saleDate?: string
  paymentSplits: PaymentSplit[]
  note?: string
  items: SaleFormItem[]
  extraCharges: ExtraChargeFormItem[]
  staffId?: string
  staffIncentive?: string
}

interface SaleModalProps {
  open: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  saleId?: string
}

const getTodayDate = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

const EMPTY_FORM: SaleFormValues = {
  customerId: '',
  customerName: '',
  invoiceNumber: '',
  saleDate: '',
  paymentSplits: DEFAULT_SPLITS,
  note: '',
  items: [createEmptyItem()],
  extraCharges: [],
  staffId: '',
  staffIncentive: '',
}

export default function SaleModal({ open, onClose, mode = 'add', saleId }: SaleModalProps) {
  const isEdit = mode === 'edit'

  const [customerMode, setCustomerMode] = useState<'registered' | 'walkin'>('registered')
  const [formData, setFormData] = useState<SaleFormValues>(EMPTY_FORM)

  const { data: customerData } = useCustomers({ page: 1, limit: 200 })
  const { data: productData } = useProducts({ page: 1, limit: 200 })
  const { createSale, updateSale } = useSaleActions()
  const { data: nextInvoiceData, refetch: refetchInvoiceNumber } = useNextInvoiceNumber(
    open && !isEdit,
  )
  const { data: staffList = [] } = useAllStaff()

  const { data: editSaleData, isLoading: editLoading } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () =>
      API.get(`${API_ENDPOINTS.SALE.GET_BY_ID}/${saleId}`).then(
        (res) => res.data?.data ?? res.data,
      ),
    enabled: isEdit && !!saleId && open,
    staleTime: 0,
    gcTime: 0,
  })

  const customers = customerData?.customers ?? []
  const products = productData?.products ?? []

  const customerCollection = useMemo(
    () =>
      createListCollection({
        items: customers.map((c: any) => ({
          label: `${c.name} (${c.mobileNumber})`,
          value: c._id,
        })),
      }),
    [customers],
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

  const discountTypeCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Percentage (%)', value: 'percentage' },
          { label: 'Absolute', value: 'absolute' },
        ],
      }),
    [],
  )

  const gstModeCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Exclusive', value: 'exclusive' },
          { label: 'Inclusive', value: 'inclusive' },
        ],
      }),
    [],
  )

  const staffCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'No staff assigned', value: '' },
          ...staffList
            .filter((s: any) => s.isActive)
            .map((s: any) => ({
              label: `${s.name} (${s.role})`,
              value: s._id,
            })),
        ],
      }),
    [staffList],
  )

  const productById = useMemo(
    () =>
      products.reduce<Record<string, any>>((acc, product) => {
        if (product?._id) acc[product._id] = product
        return acc
      }, {}),
    [products],
  )

  // Reset form when opening in add mode
  useEffect(() => {
    if (!open || isEdit) return
    setCustomerMode('registered')
    setFormData({
      ...EMPTY_FORM,
      invoiceNumber: nextInvoiceData?.nextNumber ?? '',
      saleDate: getTodayDate(),
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fill invoice number once it loads (add mode only)
  useEffect(() => {
    if (!open || isEdit || !nextInvoiceData?.nextNumber) return
    setFormData((prev) =>
      prev.invoiceNumber ? prev : { ...prev, invoiceNumber: nextInvoiceData.nextNumber },
    )
  }, [nextInvoiceData, open, isEdit])

  // Pre-fill form when edit data arrives
  useEffect(() => {
    if (!isEdit || !editSaleData || !open) return

    const sale = editSaleData
    const hasCustId = !!sale.customerId

    setCustomerMode(hasCustId ? 'registered' : 'walkin')

    // Merge backend splits (only non-zero modes stored) back into all-4-mode structure
    const splitMap: Record<string, string> = { cash: '', card: '', cheque: '', upi: '' }
    if (Array.isArray(sale.paymentSplits)) {
      for (const s of sale.paymentSplits) {
        if (s.mode && splitMap[s.mode] !== undefined) {
          splitMap[s.mode] = String(s.amount || '')
        }
      }
    }
    const rawPaymentSplits: PaymentSplit[] = DEFAULT_SPLITS.map((d) => ({
      mode: d.mode,
      amount: splitMap[d.mode] ?? '',
    }))

    setFormData({
      customerId: hasCustId
        ? typeof sale.customerId === 'object'
          ? sale.customerId._id
          : sale.customerId
        : '',
      customerName: sale.customerName || '',
      invoiceNumber: sale.invoiceNumber || '',
      saleDate: sale.saleDate ? sale.saleDate.split('T')[0] : getTodayDate(),
      paymentSplits: rawPaymentSplits,
      note: sale.note || '',
      staffId: sale.staffId
        ? typeof sale.staffId === 'object'
          ? sale.staffId._id
          : sale.staffId
        : '',
      staffIncentive: sale.staffIncentive ? String(sale.staffIncentive) : '',
      items: (sale.items || []).map((item: any) => ({
        productId: item.productId
          ? typeof item.productId === 'object'
            ? item.productId._id
            : item.productId
          : '',
        quantity: String(item.quantity || 1),
        price: String(item.price || 0),
        discountType: item.discountType || 'percentage',
        discountValue: String(item.discountValue || 0),
        gstPercentage: String(item.gstPercentage || 0),
        gstInclusive: item.gstInclusive ? 'inclusive' : 'exclusive',
      })),
      extraCharges: (sale.extraCharges || []).map((c: any) => ({
        label: c.label || '',
        amount: String(c.amount || 0),
      })),
    })
  }, [editSaleData, isEdit, open])

  const totals = useMemo(() => {
    const summary = formData.items.reduce(
      (acc, item) => {
        const qty = Number(item.quantity || 0)
        const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0

        const price = Number(item.price || 0)
        const safePrice = Number.isFinite(price) && price > 0 ? price : 0
        const discountType = item.discountType === 'absolute' ? 'absolute' : 'percentage'
        const discountValue = Number(item.discountValue || 0)
        const discountPerUnitRaw =
          discountType === 'percentage' ? (safePrice * discountValue) / 100 : discountValue
        const discountPerUnit = Math.min(safePrice, Math.max(0, discountPerUnitRaw))

        const baseAmount = safePrice * safeQty
        const discountAmount = discountPerUnit * safeQty
        const taxableAmount = baseAmount - discountAmount

        const gstPercentage = Math.max(0, Math.min(100, Number(item.gstPercentage || 0)))
        const isGstInclusive = item.gstInclusive === 'inclusive'
        const gstAmount =
          !isGstInclusive && gstPercentage > 0 ? (taxableAmount * gstPercentage) / 100 : 0

        const lineTotal = taxableAmount + gstAmount

        acc.subtotal += baseAmount
        acc.totalDiscount += discountAmount
        acc.taxable += taxableAmount
        acc.totalGst += gstAmount
        acc.totalAmount += lineTotal
        return acc
      },
      { subtotal: 0, totalDiscount: 0, taxable: 0, totalGst: 0, totalAmount: 0 },
    )

    const extraChargesTotal = formData.extraCharges.reduce((acc, charge) => {
      const amount = Number(charge.amount || 0)
      const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0
      return acc + safeAmount
    }, 0)

    const grandTotal = summary.totalAmount + extraChargesTotal
    const paidAmount = getSplitTotal(formData.paymentSplits)
    const dueAmount = grandTotal - paidAmount

    return {
      subtotal: summary.subtotal,
      totalDiscount: summary.totalDiscount,
      taxable: summary.taxable,
      totalGst: summary.totalGst,
      lineItemsTotal: summary.totalAmount,
      extraChargesTotal,
      totalAmount: grandTotal,
      dueAmount,
    }
  }, [formData.items, formData.paymentSplits, formData.extraCharges, productById])

  function updateItem(index: number, key: keyof SaleFormItem, value: string) {
    setFormData((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }
      return { ...prev, items }
    })
  }

  function addItem() {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }))
  }

  function removeItem(index: number) {
    setFormData((prev) => {
      if (prev.items.length === 1) return prev
      return { ...prev, items: prev.items.filter((_, i) => i !== index) }
    })
  }

  function addExtraCharge() {
    setFormData((prev) => ({
      ...prev,
      extraCharges: [...prev.extraCharges, { label: '', amount: '0' }],
    }))
  }

  function updateExtraCharge(index: number, key: keyof ExtraChargeFormItem, value: string) {
    setFormData((prev) => {
      const extraCharges = [...prev.extraCharges]
      extraCharges[index] = { ...extraCharges[index], [key]: value }
      return { ...prev, extraCharges }
    })
  }

  function removeExtraCharge(index: number) {
    setFormData((prev) => ({
      ...prev,
      extraCharges: prev.extraCharges.filter((_, i) => i !== index),
    }))
  }

  function buildPayload() {
    return {
      ...(customerMode === 'registered' && formData.customerId
        ? { customerId: formData.customerId }
        : { customerName: formData.customerName?.trim() || 'Walk-in Customer' }),
      invoiceNumber: formData.invoiceNumber?.trim() || undefined,
      saleDate: formData.saleDate || undefined,
      paymentSplits: getSplitsPayload(formData.paymentSplits),
      note: formData.note?.trim() || '',
      staffId: formData.staffId || undefined,
      staffIncentive:
        formData.staffId && formData.staffIncentive
          ? Number(formData.staffIncentive) || 0
          : undefined,
      items: formData.items
        .filter((item) => item.productId && Number(item.quantity) > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price || 0),
          discountType: item.discountType,
          discountValue: Number(item.discountValue || 0),
          gstPercentage: Number(item.gstPercentage || 0),
          gstInclusive: item.gstInclusive === 'inclusive',
        })),
      extraCharges: formData.extraCharges
        .map((charge) => ({
          label: charge.label?.trim() || 'Additional Charge',
          amount: Number(charge.amount || 0),
        }))
        .filter((charge) => Number.isFinite(charge.amount) && charge.amount > 0),
    }
  }

  function handleSubmit() {
    const payload = buildPayload()
    if (isEdit && saleId) {
      updateSale.mutate({ saleId, payload }, { onSuccess: onClose })
    } else {
      createSale.mutate(payload, { onSuccess: onClose })
    }
  }

  const isBusy = isEdit ? updateSale.isPending : createSale.isPending
  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      scrollBehavior="inside"
      size={isLarge ? 'xl' : 'full'}
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
            maxW="860px"
            w="100%"
            maxH="90vh"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                {isEdit ? 'Edit Sale' : 'New Sale'}
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
              {isEdit && editLoading ? (
                <Box py={10} textAlign="center">
                  <Text color="gray.400" fontSize="sm">
                    Loading sale…
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={4}>
                  {/* Customer */}
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="14px"
                    p={3}
                    bg="white"
                  >
                    <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                      Customer
                    </Text>
                    <Tabs.Root
                      value={customerMode}
                      onValueChange={(d) => setCustomerMode(d.value as 'registered' | 'walkin')}
                      variant="enclosed"
                      size="sm"
                      mb={3}
                    >
                      <Tabs.List>
                        <Tabs.Trigger value="registered">Registered</Tabs.Trigger>
                        <Tabs.Trigger value="walkin">Walk-in</Tabs.Trigger>
                      </Tabs.List>
                    </Tabs.Root>

                    {customerMode === 'registered' ? (
                      <Select.Root
                        collection={customerCollection}
                        value={formData.customerId ? [formData.customerId] : []}
                        onValueChange={(details) =>
                          setFormData((prev) => ({ ...prev, customerId: details.value[0] || '' }))
                        }
                        positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select customer" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content bg="white">
                            {customerCollection.items.map((item) => (
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
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, customerName: e.target.value }))
                        }
                        placeholder="Customer name (or leave blank for Walk-in)"
                        bg="white"
                        borderColor="gray.200"
                      />
                    )}
                  </Box>

                  {/* Invoice info */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    <Field.Root>
                      <HStack justify="space-between" mb={1}>
                        <Field.Label color="gray.700" fontWeight="600" mb={0}>
                          Invoice Number
                        </Field.Label>
                        {!isEdit && (
                          <Button
                            size="xs"
                            bg="gray.50"
                            color="gray.500"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="6px"
                            onClick={() => {
                              refetchInvoiceNumber().then((r) => {
                                if (r.data?.nextNumber) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    invoiceNumber: r.data!.nextNumber,
                                  }))
                                }
                              })
                            }}
                          >
                            Reset auto
                          </Button>
                        )}
                      </HStack>
                      <Input
                        value={formData.invoiceNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                        }
                        placeholder="Auto-generated"
                        bg="white"
                        borderColor="gray.200"
                        fontFamily={formData.invoiceNumber ? 'mono' : undefined}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label color="gray.700" fontWeight="600">
                        Sale Date
                      </Field.Label>
                      <DateInputWithIcon
                        name="saleDate"
                        value={formData.saleDate || getTodayDate()}
                        onChange={(value) => setFormData((prev) => ({ ...prev, saleDate: value }))}
                      />
                    </Field.Root>
                  </SimpleGrid>

                  {/* Staff attribution */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    <Field.Root>
                      <Field.Label color="gray.700" fontWeight="600">
                        Staff (optional)
                      </Field.Label>
                      <Select.Root
                        collection={staffCollection}
                        value={formData.staffId ? [formData.staffId] : ['']}
                        onValueChange={(details) =>
                          setFormData((prev) => ({
                            ...prev,
                            staffId: details.value[0] === '' ? '' : details.value[0],
                            staffIncentive: details.value[0] === '' ? '' : prev.staffIncentive,
                          }))
                        }
                        positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="No staff assigned" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content bg="white">
                            {staffCollection.items.map((item) => (
                              <Select.Item item={item} key={item.value || '_none'}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label color="gray.700" fontWeight="600">
                        Staff Incentive
                      </Field.Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.staffIncentive}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, staffIncentive: e.target.value }))
                        }
                        placeholder="0"
                        bg="white"
                        borderColor="gray.200"
                        disabled={!formData.staffId}
                      />
                    </Field.Root>
                  </SimpleGrid>

                  {/* Items */}
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="14px"
                    p={3}
                    bg="white"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">
                        Sale Items
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

                    <VStack align="stretch" gap={3}>
                      {formData.items.map((item, index) => (
                        <Box
                          key={index}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="10px"
                          p={3}
                        >
                          <Box
                            display="grid"
                            gap={2}
                            gridTemplateColumns={{
                              base: '1fr',
                              md: 'repeat(2, minmax(0, 1fr))',
                              lg: 'repeat(4, minmax(0, 1fr))',
                            }}
                          >
                            <Field.Root gridColumn={{ base: 'auto', lg: 'span 2' }}>
                              <Field.Label fontSize="xs" color="gray.600">
                                Product
                              </Field.Label>
                              <Select.Root
                                collection={productCollection}
                                value={item.productId ? [item.productId] : []}
                                onValueChange={(details) => {
                                  const selectedProductId = details.value[0] || ''
                                  const selectedProduct = productById[selectedProductId]

                                  setFormData((prev) => {
                                    const items = [...prev.items]
                                    items[index] = {
                                      ...items[index],
                                      productId: selectedProductId,
                                      price: String(selectedProduct?.sellingPrice ?? 0),
                                      discountType:
                                        selectedProduct?.discountType === 'absolute'
                                          ? 'absolute'
                                          : 'percentage',
                                      discountValue: String(selectedProduct?.discountValue ?? 0),
                                      gstPercentage: String(selectedProduct?.gstPercentage ?? 0),
                                      gstInclusive: selectedProduct?.gstInclusive
                                        ? 'inclusive'
                                        : 'exclusive',
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

                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                Price (per unit)
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
                                Discount Type
                              </Field.Label>
                              <Select.Root
                                collection={discountTypeCollection}
                                value={[item.discountType]}
                                onValueChange={(details) =>
                                  updateItem(
                                    index,
                                    'discountType',
                                    (details.value[0] as 'percentage' | 'absolute') || 'percentage',
                                  )
                                }
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
                                    {discountTypeCollection.items.map((collectionItem) => (
                                      <Select.Item item={collectionItem} key={collectionItem.value}>
                                        {collectionItem.label}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                              </Select.Root>
                            </Field.Root>

                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                Discount Value
                              </Field.Label>
                              <Input
                                type="number"
                                min={0}
                                value={item.discountValue}
                                onChange={(e) => updateItem(index, 'discountValue', e.target.value)}
                                bg="white"
                                borderColor="gray.200"
                              />
                            </Field.Root>

                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                GST (%)
                              </Field.Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={item.gstPercentage}
                                onChange={(e) => updateItem(index, 'gstPercentage', e.target.value)}
                                bg="white"
                                borderColor="gray.200"
                              />
                            </Field.Root>

                            <Field.Root>
                              <Field.Label fontSize="xs" color="gray.600">
                                GST Mode
                              </Field.Label>
                              <Select.Root
                                collection={gstModeCollection}
                                value={[item.gstInclusive]}
                                onValueChange={(details) =>
                                  updateItem(
                                    index,
                                    'gstInclusive',
                                    (details.value[0] as 'exclusive' | 'inclusive') || 'exclusive',
                                  )
                                }
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
                                    {gstModeCollection.items.map((collectionItem) => (
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

                          <HStack justify="space-between" mt={2}>
                            <Text fontSize="xs" color="gray.600">
                              Amount = (Qty x Price) - Discount + GST
                            </Text>
                            <Button
                              size="xs"
                              colorPalette="red"
                              variant="ghost"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Extra Charges */}
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="14px"
                    p={3}
                    bg="white"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="700" color="gray.800">
                        Extra Charges
                      </Text>
                      <Button
                        size="sm"
                        bg="white"
                        color="gray.800"
                        border="1px solid"
                        borderColor="gray.200"
                        onClick={addExtraCharge}
                      >
                        <HStack gap={1}>
                          <Plus size={14} />
                          <Text fontSize="xs">Add Charge</Text>
                        </HStack>
                      </Button>
                    </HStack>

                    <VStack align="stretch" gap={2}>
                      {formData.extraCharges.length === 0 ? (
                        <Text fontSize="xs" color="gray.500">
                          Add delivery or other charges if required.
                        </Text>
                      ) : null}

                      {formData.extraCharges.map((charge, index) => (
                        <Box
                          key={index}
                          display="grid"
                          gap={2}
                          alignItems="end"
                          gridTemplateColumns={{ base: '1fr', md: '2fr 1fr auto' }}
                        >
                          <Field.Root>
                            <Field.Label fontSize="xs" color="gray.600">
                              Charge Name
                            </Field.Label>
                            <Input
                              value={charge.label}
                              onChange={(e) => updateExtraCharge(index, 'label', e.target.value)}
                              placeholder="e.g. Delivery Charge"
                              bg="white"
                              borderColor="gray.200"
                            />
                          </Field.Root>

                          <Field.Root>
                            <Field.Label fontSize="xs" color="gray.600">
                              Amount
                            </Field.Label>
                            <Input
                              type="number"
                              min={0}
                              value={charge.amount}
                              onChange={(e) => updateExtraCharge(index, 'amount', e.target.value)}
                              bg="white"
                              borderColor="gray.200"
                            />
                          </Field.Root>

                          <Button
                            size="sm"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => removeExtraCharge(index)}
                            mb={1}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Summary */}
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="14px"
                    p={3}
                    bg="gray.50"
                  >
                    <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
                      Summary
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          Subtotal
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="gray.800">
                          {totals.subtotal.toFixed(2)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          Discount
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="red.600">
                          - {totals.totalDiscount.toFixed(2)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          Taxable
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="gray.800">
                          {totals.taxable.toFixed(2)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          GST
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="gray.800">
                          {totals.totalGst.toFixed(2)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          Items Total
                        </Text>
                        <Text fontSize="sm" fontWeight="700" color="gray.900">
                          {totals.lineItemsTotal.toFixed(2)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" bg="white" borderRadius="10px" px={3} py={2}>
                        <Text fontSize="xs" color="gray.600">
                          Extra Charges
                        </Text>
                        <Text fontSize="sm" fontWeight="700" color="gray.900">
                          {totals.extraChargesTotal.toFixed(2)}
                        </Text>
                      </HStack>
                    </SimpleGrid>

                    <Box h="1px" bg="gray.200" my={3} />

                    <HStack justify="space-between" bg="white" borderRadius="12px" px={3} py={3}>
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        Grand Total
                      </Text>
                      <Text fontSize="md" fontWeight="800" color="gray.900">
                        {totals.totalAmount.toFixed(2)}
                      </Text>
                    </HStack>

                    <HStack
                      justify="space-between"
                      mt={2}
                      bg="white"
                      borderRadius="12px"
                      px={3}
                      py={2}
                    >
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        {totals.dueAmount < 0 ? 'Advance' : 'Due'}
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="800"
                        color={
                          totals.dueAmount > 0
                            ? 'orange.600'
                            : totals.dueAmount < 0
                              ? 'blue.600'
                              : 'green.600'
                        }
                      >
                        {Math.abs(totals.dueAmount).toFixed(2)}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Payment + Note */}
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
                </VStack>
              )}
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
                loading={isBusy}
                onClick={handleSubmit}
                disabled={isEdit && editLoading}
              >
                {isEdit ? 'Update Sale' : 'Create Sale'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
