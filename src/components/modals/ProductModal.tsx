import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  Portal,
  Button,
  Input,
  Field,
  useMediaQuery,
  Select,
  SimpleGrid,
  Checkbox,
  Box,
  HStack,
  Text,
} from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useProductActions } from '@/hooks/useProductActions'
import { useCategory } from '@/hooks/useCategory'
import { useSupplier } from '@/hooks/useSupplier'

const unitCollection = createListCollection({
  items: [
    { label: 'Pieces', value: 'pcs' },
    { label: 'Box', value: 'box' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Litre', value: 'litre' },
    { label: 'Packet', value: 'packet' },
    { label: 'Dozen', value: 'dozen' },
    { label: 'Meter', value: 'meter' },
    { label: 'Other', value: 'other' },
  ],
})

const discountTypeCollection = createListCollection({
  items: [
    { label: 'Percentage (%)', value: 'percentage' },
    { label: 'Absolute (₹)', value: 'absolute' },
  ],
})

export interface ProductFormValues {
  name: string
  brand?: string
  categoryId?: string
  newCategoryName?: string
  supplierId?: string
  purchasePrice: string
  sellingPrice: string
  unit?: string
  stock?: string
  gstPercentage?: string
  gstInclusive?: boolean
  discountType?: string
  discountValue?: string
  minimumStock?: string
}

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  pubId?: string
  defaultValues?: ProductFormValues
}

export default function ProductDialog({
  open,
  onClose,
  mode,
  pubId,
  defaultValues,
}: ProductDialogProps) {
  const [formData, setFormData] = useState<ProductFormValues>({
    name: '',
    brand: '',
    categoryId: '',
    newCategoryName: '',
    supplierId: '',
    purchasePrice: '0',
    sellingPrice: '',
    unit: 'pcs',
    stock: '0',
    gstPercentage: '0',
    gstInclusive: false,
    discountType: 'percentage',
    discountValue: '0',
    minimumStock: '0',
  })

  const { createProduct, updateProduct } = useProductActions()
  const { data: categoryData } = useCategory({ page: 1, limit: 50 })
  const { data: suppliers = [] } = useSupplier()

  const categoryCollection = useMemo(
    () =>
      createListCollection({
        items: (categoryData?.categories || []).map((c: any) => ({
          label: c.name,
          value: c._id,
        })),
      }),
    [categoryData?.categories],
  )

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
      setFormData(defaultValues)
    } else {
      setFormData({
        name: '',
        brand: '',
        categoryId: '',
        newCategoryName: '',
        supplierId: '',
        purchasePrice: '0',
        sellingPrice: '',
        unit: 'pcs',
        stock: '0',
        gstPercentage: '0',
        gstInclusive: false,
        discountType: 'percentage',
        discountValue: '0',
        minimumStock: '0',
      })
    }
  }, [defaultValues, mode])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    if (name === 'newCategoryName' && value.trim()) {
      setFormData((prev) => ({ ...prev, newCategoryName: value, categoryId: '' }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit() {
    const payload = {
      name: formData.name.trim(),
      brand: formData.brand?.trim() || '',
      categoryId: formData.categoryId?.trim() || '',
      newCategoryName: formData.newCategoryName?.trim() || '',
      supplierId: formData.supplierId?.trim() || '',
      purchasePrice: Number(formData.purchasePrice || 0),
      sellingPrice: Number(formData.sellingPrice || 0),
      unit: formData.unit?.trim() || 'pcs',
      stock: Number(formData.stock || 0),
      gstPercentage: Number(formData.gstPercentage || 0),
      gstInclusive: formData.gstInclusive || false,
      discountType: formData.discountType?.trim() || 'percentage',
      discountValue: Number(formData.discountValue || 0),
      minimumStock: Number(formData.minimumStock || 0),
    }

    if (mode === 'add') {
      createProduct.mutate(payload, { onSuccess: onClose })
      return
    }

    if (!pubId) return

    updateProduct.mutate(
      { productId: pubId, payload },
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
            maxW="640px"
            w="100%"
            maxH="90vh"
            border="1px solid"
            borderColor="gray.100"
          >
            <Dialog.Header px={1}>
              <Dialog.Title fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
                {mode === 'add' ? 'Add New Product' : 'Edit Product'}
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
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Product Name
                  </Field.Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Brand
                  </Field.Label>
                  <Input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Optional"
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Category
                  </Field.Label>
                  <Select.Root
                    collection={categoryCollection}
                    value={formData.categoryId ? [formData.categoryId] : []}
                    onValueChange={(details) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: details.value[0] || '',
                        newCategoryName: '',
                      }))
                    }
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect name="categoryId" />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select category" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {categoryCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
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
                    New Category Name
                  </Field.Label>
                  <Input
                    name="newCategoryName"
                    value={formData.newCategoryName}
                    onChange={handleChange}
                    placeholder="Optional (creates category)"
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

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Purchase Price
                  </Field.Label>
                  <Input
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Selling Price
                  </Field.Label>
                  <Input
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Stock
                  </Field.Label>
                  <Input
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Minimum Stock
                  </Field.Label>
                  <Input
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    GST Percentage (%)
                  </Field.Label>
                  <Input
                    name="gstPercentage"
                    value={formData.gstPercentage}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Box display="flex" alignItems="center">
                  <Checkbox.Root
                    checked={formData.gstInclusive}
                    onCheckedChange={(details) =>
                      setFormData((prev) => ({ ...prev, gstInclusive: !!details.checked }))
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>
                      <Text fontSize="sm" color="gray.700" fontWeight="600">
                        Price includes GST
                      </Text>
                    </Checkbox.Label>
                  </Checkbox.Root>
                </Box>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Discount Type
                  </Field.Label>
                  <Select.Root
                    collection={discountTypeCollection}
                    value={formData.discountType ? [formData.discountType] : ['percentage']}
                    onValueChange={(details) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountType: details.value[0] || 'percentage',
                      }))
                    }
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect name="discountType" />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select type" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content bg="white">
                        {discountTypeCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
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
                    Discount Value
                  </Field.Label>
                  <Input
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    step={0.01}
                    bg="white"
                    borderColor="gray.200"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="600">
                    Unit
                  </Field.Label>

                  <Select.Root
                    collection={unitCollection}
                    value={formData.unit ? [formData.unit] : ['pcs']}
                    onValueChange={(details) =>
                      setFormData((prev) => ({ ...prev, unit: details.value[0] || 'pcs' }))
                    }
                    positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                  >
                    <Select.HiddenSelect name="unit" />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select unit" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>

                    <Select.Positioner>
                      <Select.Content bg="white">
                        {unitCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Field.Root>
              </SimpleGrid>
            </Dialog.Body>

            <Dialog.Footer
              gap={3}
              justifyContent="flex-end"
              flexDirection={{ base: 'column-reverse', md: 'row' }}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  minW="120px"
                  width={{ base: '100%', md: '50%' }}
                  color="black"
                  borderColor="black"
                  bg="white"
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                width={{ base: '100%', md: '50%' }}
                bg="black"
                color="white"
                loading={createProduct.isPending || updateProduct.isPending}
                onClick={handleSubmit}
              >
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
