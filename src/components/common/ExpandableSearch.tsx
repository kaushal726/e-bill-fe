import { Box, Input } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { ChangeEvent } from 'react'

interface ExpandableSearchProps {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  expandedWidth?: string
  height?: string
}

export const ExpandableSearch = ({
  value,
  onChange,
  placeholder = 'Search…',
  expandedWidth = '280px',
  height = '38px',
}: ExpandableSearchProps) => {
  return (
    <Box
      role="group"
      display="flex"
      alignItems="center"
      w={{ base: '100%', md: expandedWidth }}
      h={height}
      maxW={expandedWidth}
      border="1px solid"
      borderColor="teal.700"
      borderRadius="12px"
      bg="rgba(255,255,255,0.98)"
      shadow="0 6px 18px rgba(13, 116, 123, 0.16)"
      overflow="hidden"
      transition="border-color 0.2s ease"
      _focusWithin={{
        borderColor: 'teal.600',
        boxShadow: '0 0 0 2px rgba(13, 116, 123, 0.18)',
      }}
    >
      <Box
        flexShrink={0}
        px="10px"
        color="teal.700"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Search size={16} />
      </Box>

      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="sm"
        h="36px"
        border="none"
        outline="none"
        px="0"
        color="gray.800"
        _placeholder={{ color: 'gray.500' }}
        _focus={{ boxShadow: 'none' }}
      />
    </Box>
  )
}
