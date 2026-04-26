import { Box, Portal, Select, createListCollection } from '@chakra-ui/react'
import { useMemo } from 'react'

export interface FilterOption {
  label: string
  value: string
}

interface FilterSelectProps {
  options: FilterOption[]
  value?: string[]
  defaultValue?: string[]
  placeholder?: string
  width?: string
  onChange?: (value: string[]) => void
}

export const FilterSelect = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select option',
  width = '320px',
  onChange,
}: FilterSelectProps) => {
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
      }),
    [options],
  )

  return (
    <Box
      color="gray.800"
      whiteSpace="nowrap"
      bg="rgba(255,255,255,0.98)"
      rounded="12px"
      shadow="0 6px 18px rgba(13, 116, 123, 0.16)"
      border="1px solid"
      borderColor="teal.700"
      overflow="hidden"
    >
      <Select.Root
        collection={collection}
        width={width}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(e) => onChange?.(e.value)}
        variant="subtle"
        size="sm"
      >
        <Select.HiddenSelect />

        <Select.Control h="38px">
          <Select.Trigger px={3}>
            <Select.ValueText placeholder={placeholder} color="gray.700" fontSize="sm" />
          </Select.Trigger>

          <Select.IndicatorGroup>
            <Select.Indicator color="teal.700" />
          </Select.IndicatorGroup>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content
              bg="white"
              shadow="0 12px 28px rgba(15, 23, 42, 0.16)"
              color="gray.700"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="12px"
              p={1}
            >
              {collection.items.map((item) => (
                <Select.Item
                  key={item.value}
                  item={item}
                  borderRadius="8px"
                  _hover={{ bg: 'teal.50' }}
                  _highlighted={{ bg: 'teal.50' }}
                >
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Box>
  )
}
