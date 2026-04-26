import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  Portal,
  Button,
  Input,
  Field,
  useMediaQuery,
  Select,
  Text,
  HStack,
  Box,
  Badge,
} from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useSupplier } from '@/hooks/useSupplier'
import { useCustomers } from '@/hooks/useCustomer'
import { usePaymentActions } from '@/hooks/usePaymentActions'
import { usePaymentDues } from '@/hooks/usePayment'
import { useSales } from '@/hooks/useSale'
import { ToasterUtil } from '@/components/common/ToasterUtil'

type PaymentType = 'supplier' | 'customer'
type PaymentMode = 'cash' | 'upi' | 'bank' | 'other'
type PartyMode = 'registered' | 'anonymous'
const WALKIN_SUPPLIER_NAME = 'Walk-in / Unknown'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  defaultType?: PaymentType
  defaultEntityId?: string
}

const paymentModes: PaymentMode[] = ['cash', 'upi', 'bank', 'other']

export default function PaymentModal({
  open,
  onClose,
  defaultType,
  defaultEntityId,
}: PaymentModalProps) {
  const toast = ToasterUtil()
  const [paidToType, setPaidToType] = useState<PaymentType>(defaultType ?? 'supplier')
  const [partyMode, setPartyMode] = useState<PartyMode>('registered')
  const [entityId, setEntityId] = useState<string>(defaultEntityId ?? '')
  const [partyName, setPartyName] = useState('')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [note, setNote] = useState('')

  const { data: suppliers = [] } = useSupplier()
  const { data: customerData } = useCustomers({ limit: 200 })
  const { data: sales = [] } = useSales()
  const { data: duesData } = usePaymentDues()
  const customers = customerData?.customers ?? customerData ?? []

  const { createPayment } = usePaymentActions()

  const [isLarge] = useMediaQuery(['(min-width: 540px)'])

  useEffect(() => {
    if (open) {
      setPaidToType(defaultType ?? 'supplier')
      setPartyMode('registered')
      setEntityId(defaultEntityId ?? '')
      setPartyName('')
      setInvoiceRef('')
      setAmount('')
      setPaymentMode('cash')
      setNote('')
    }
  }, [open, defaultType, defaultEntityId])

  useEffect(() => {
    if (partyMode === 'anonymous' && paidToType === 'supplier') {
      setPartyName(WALKIN_SUPPLIER_NAME)
      return
    }

    if (partyMode === 'registered') {
      setPartyName('')
    }
  }, [partyMode, paidToType])

  const typeCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Pay to Supplier', value: 'supplier' },
          { label: 'Receive from Customer', value: 'customer' },
        ],
      }),
    [],
  )

  const supplierCollection = useMemo(
    () =>
      createListCollection({
        items: suppliers.map((s) => ({
          label: `${s.name}  â‚¹${(s.pendingAmount ?? 0).toLocaleString('en-IN')} due`,
          value: s._id,
        })),
      }),
    [suppliers],
  )

  const customerCollection = useMemo(
    () =>
      createListCollection({
        items: (Array.isArray(customers) ? customers : []).map((c: any) => ({
          label: `${c.name} (${c.mobileNumber})`,
          value: c._id,
        })),
      }),
    [customers],
  )

  const modeCollection = useMemo(
    () =>
      createListCollection({
        items: paymentModes.map((m) => ({ label: m.toUpperCase(), value: m })),
      }),
    [],
  )

  const selectedSupplier = suppliers.find((s) => s._id === entityId)
  const selectedCustomer = Array.isArray(customers)
    ? (customers as any[]).find((c: any) => c._id === entityId)
    : null

  const customerFromInvoice = useMemo(() => {
    const normalizedInvoice = invoiceRef.trim().toLowerCase()
    if (!normalizedInvoice || paidToType !== 'customer') return null

    const matchedSale = sales.find(
      (sale) => sale.invoiceNumber?.trim().toLowerCase() === normalizedInvoice,
    )

    if (!matchedSale?.customerId?._id) return null

    return {
      customerId: matchedSale.customerId._id,
      customerName: matchedSale.customerId.name,
      saleInvoice: matchedSale.invoiceNumber,
    }
  }, [invoiceRef, paidToType, sales])

  useEffect(() => {
    if (paidToType !== 'customer') return
    if (!invoiceRef.trim()) return

    if (customerFromInvoice?.customerId) {
      setPartyMode('registered')
      setEntityId(customerFromInvoice.customerId)
      setPartyName('')
    }
  }, [paidToType, invoiceRef, customerFromInvoice])

  const anonymousDue = useMemo(() => {
    const normalizedName = partyName.trim().toLowerCase()
    if (!normalizedName) return null

    if (paidToType === 'supplier') {
      const supplierDues = duesData?.suppliers || []
      return (
        supplierDues.find(
          (d) => d.partyType === 'anonymous' && d.partyName.trim().toLowerCase() === normalizedName,
        ) || null
      )
    }

    const customerDues = duesData?.customers || []
    return (
      customerDues.find(
        (d) => d.partyType === 'anonymous' && d.partyName.trim().toLowerCase() === normalizedName,
      ) || null
    )
  }, [paidToType, partyName, duesData])

  function handleSubmit() {
    const parsedAmount = Number(amount)
    const normalizedPartyName = partyName.trim()
    const normalizedInvoiceRef = invoiceRef.trim()
    if (!parsedAmount) return

    if (partyMode === 'registered' && !entityId) return
    if (partyMode === 'anonymous' && !normalizedPartyName) return

    if (paidToType === 'customer' && normalizedInvoiceRef && !customerFromInvoice?.customerId) {
      toast('Customer not found from invoice. Please use a valid sale invoice.', 'error')
      return
    }

    const payload: any = {
      paidToType,
      amount: parsedAmount,
      paymentMode,
      invoiceNumber: normalizedInvoiceRef || undefined,
      note: normalizedInvoiceRef
        ? `${note.trim() ? `${note.trim()} | ` : ''}INV:${normalizedInvoiceRef}`
        : note.trim(),
    }

    if (paidToType === 'supplier') {
      if (partyMode === 'registered') payload.supplierId = entityId
      else payload.supplierName = WALKIN_SUPPLIER_NAME
    } else {
      if (customerFromInvoice?.customerId) {
        payload.customerId = customerFromInvoice.customerId
      } else if (partyMode === 'registered') {
        payload.customerId = entityId
      } else {
        payload.customerName = normalizedPartyName
      }
    }

    createPayment.mutate(payload, { onSuccess: onClose })
  }

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
            maxW="520px"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                Record Payment
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button size="xs" variant="ghost" color="gray.400" p={1} minW="auto">
                  <X size={14} />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              {/* Payment Type */}
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Payment Type
                </Field.Label>
                <Select.Root
                  collection={typeCollection}
                  value={[paidToType]}
                  onValueChange={(e) => {
                    setPaidToType(e.value[0] as PaymentType)
                    setPartyMode('registered')
                    setEntityId('')
                  }}
                  positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger bg="white" borderColor="gray.200">
                      <Select.ValueText placeholder="Select type" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content bg="white">
                      {typeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Field.Root>

              {/* Entity selector */}
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  {paidToType === 'supplier' ? 'Supplier' : 'Customer'}
                </Field.Label>
                <HStack mb={2} bg="gray.100" p={1} borderRadius="8px" w="fit-content">
                  <Button
                    size="xs"
                    variant={partyMode === 'registered' ? 'solid' : 'ghost'}
                    onClick={() => {
                      setPartyMode('registered')
                      setPartyName('')
                    }}
                  >
                    Registered
                  </Button>
                  <Button
                    size="xs"
                    variant={partyMode === 'anonymous' ? 'solid' : 'ghost'}
                    onClick={() => {
                      setPartyMode('anonymous')
                      setEntityId('')
                    }}
                  >
                    Random / Walk-in
                  </Button>
                </HStack>

                {partyMode === 'registered' && paidToType === 'supplier' ? (
                  <Select.Root
                    collection={supplierCollection}
                    value={entityId ? [entityId] : []}
                    onValueChange={(e) => setEntityId(e.value[0] ?? '')}
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger bg="white" borderColor="gray.200">
                        <Select.ValueText placeholder="Select supplier" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {supplierCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                ) : partyMode === 'registered' ? (
                  <Select.Root
                    collection={customerCollection}
                    value={entityId ? [entityId] : []}
                    onValueChange={(e) => setEntityId(e.value[0] ?? '')}
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger bg="white" borderColor="gray.200">
                        <Select.ValueText placeholder="Select customer" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {customerCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                ) : (
                  <Input
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder={
                      paidToType === 'supplier'
                        ? WALKIN_SUPPLIER_NAME
                        : 'Enter walk-in customer name'
                    }
                    bg="white"
                    borderColor="gray.200"
                    readOnly={paidToType === 'supplier'}
                  />
                )}
              </Field.Root>

              {/* Balance info */}
              {paidToType === 'supplier' && selectedSupplier && (
                <Box
                  mb={3}
                  px={3}
                  py={2}
                  bg="orange.50"
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="orange.100"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Pending due to supplier
                    </Text>
                    <Badge colorPalette="orange" fontSize="sm">
                      â‚¹{(selectedSupplier.pendingAmount ?? 0).toLocaleString('en-IN')}
                    </Badge>
                  </HStack>
                </Box>
              )}

              {paidToType === 'customer' && selectedCustomer && (
                <Box
                  mb={3}
                  px={3}
                  py={2}
                  bg="blue.50"
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Customer balance
                    </Text>
                    <Badge colorPalette="blue" fontSize="sm">
                      â‚¹{(selectedCustomer.balance ?? 0).toLocaleString('en-IN')}
                    </Badge>
                  </HStack>
                </Box>
              )}

              {partyMode === 'anonymous' && partyName.trim() && (
                <Box
                  mb={3}
                  px={3}
                  py={2}
                  bg={paidToType === 'supplier' ? 'orange.50' : 'blue.50'}
                  borderRadius="10px"
                  border="1px solid"
                  borderColor={paidToType === 'supplier' ? 'orange.100' : 'blue.100'}
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Open due for this name
                    </Text>
                    <Badge
                      colorPalette={paidToType === 'supplier' ? 'orange' : 'blue'}
                      fontSize="sm"
                    >
                      â‚¹{Number(anonymousDue?.totalDue || 0).toLocaleString('en-IN')}
                    </Badge>
                  </HStack>
                </Box>
              )}

              {/* Amount */}
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Amount (â‚¹)
                </Field.Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  bg="white"
                  borderColor="gray.200"
                  min={1}
                />
              </Field.Root>

              {/* Invoice / Reference */}
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Invoice / Reference Number
                </Field.Label>
                <Input
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  bg="white"
                  borderColor="gray.200"
                />
              </Field.Root>

              {paidToType === 'customer' && invoiceRef.trim() && (
                <Box
                  mb={3}
                  px={3}
                  py={2}
                  bg={customerFromInvoice ? 'green.50' : 'red.50'}
                  borderRadius="10px"
                  border="1px solid"
                  borderColor={customerFromInvoice ? 'green.100' : 'red.100'}
                >
                  <Text fontSize="sm" color={customerFromInvoice ? 'green.700' : 'red.700'}>
                    {customerFromInvoice
                      ? `Customer auto-selected from invoice: ${customerFromInvoice.customerName}`
                      : 'No registered customer found for this invoice.'}
                  </Text>
                </Box>
              )}

              {/* Payment Mode */}
              <Field.Root mb={3}>
                <Field.Label color="gray.700" fontWeight="600">
                  Payment Mode
                </Field.Label>
                <Select.Root
                  collection={modeCollection}
                  value={[paymentMode]}
                  onValueChange={(e) => setPaymentMode(e.value[0] as PaymentMode)}
                  positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger bg="white" borderColor="gray.200">
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content bg="white">
                      {modeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Field.Root>

              {/* Note */}
              <Field.Root>
                <Field.Label color="gray.700" fontWeight="600">
                  Note (optional)
                </Field.Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
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
                width="50%"
                bg={paidToType === 'supplier' ? 'orange.500' : 'blue.600'}
                color="white"
                loading={createPayment.isPending}
                onClick={handleSubmit}
                disabled={
                  Number(amount) <= 0 ||
                  (partyMode === 'registered' ? !entityId : !partyName.trim())
                }
              >
                {paidToType === 'supplier' ? 'Pay Supplier' : 'Record Receipt'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
