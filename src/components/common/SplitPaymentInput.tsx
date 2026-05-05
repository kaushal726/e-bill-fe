import { Box, Grid, Input, Text, HStack } from '@chakra-ui/react'
import { Banknote, CreditCard, FileText, Smartphone } from 'lucide-react'

export type SplitMode = 'cash' | 'card' | 'cheque' | 'upi'
export type PaymentSplit = { mode: SplitMode; amount: string }

const MODES: { mode: SplitMode; label: string; icon: React.ReactNode; color: string }[] = [
  { mode: 'cash', label: 'Cash', icon: <Banknote size={14} />, color: 'green.600' },
  { mode: 'card', label: 'Card', icon: <CreditCard size={14} />, color: 'blue.600' },
  { mode: 'cheque', label: 'Cheque', icon: <FileText size={14} />, color: 'orange.600' },
  { mode: 'upi', label: 'UPI', icon: <Smartphone size={14} />, color: 'purple.600' },
]

export const DEFAULT_SPLITS: PaymentSplit[] = [
  { mode: 'cash', amount: '' },
  { mode: 'card', amount: '' },
  { mode: 'cheque', amount: '' },
  { mode: 'upi', amount: '' },
]

export function getSplitTotal(splits: PaymentSplit[]): number {
  return splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
}

export function getSplitsPayload(splits: PaymentSplit[]) {
  return splits
    .filter((s) => Number(s.amount) > 0)
    .map((s) => ({ mode: s.mode, amount: Number(s.amount) }))
}

interface SplitPaymentInputProps {
  splits: PaymentSplit[]
  onChange: (splits: PaymentSplit[]) => void
  label?: string
}

export function SplitPaymentInput({ splits, onChange, label }: SplitPaymentInputProps) {
  const total = getSplitTotal(splits)

  function handleChange(mode: SplitMode, value: string) {
    onChange(splits.map((s) => (s.mode === mode ? { ...s, amount: value } : s)))
  }

  return (
    <Box>
      {label && (
        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
          {label}
        </Text>
      )}
      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
        {MODES.map(({ mode, label: modeLabel, icon, color }) => {
          const split = splits.find((s) => s.mode === mode) ?? { mode, amount: '' }
          return (
            <Box
              key={mode}
              p={2.5}
              borderRadius="10px"
              border="1px solid"
              borderColor="gray.200"
              bg="white"
            >
              <HStack gap={1.5} mb={1.5}>
                <Box color={color}>{icon}</Box>
                <Text fontSize="xs" fontWeight="600" color="gray.600">
                  {modeLabel}
                </Text>
              </HStack>
              <Input
                type="number"
                min={0}
                size="sm"
                value={split.amount}
                onChange={(e) => handleChange(mode, e.target.value)}
                placeholder="0"
                bg="gray.50"
                borderColor="gray.200"
                _placeholder={{ color: 'gray.400' }}
              />
            </Box>
          )
        })}
      </Grid>
      {total > 0 && (
        <HStack justify="flex-end" mt={2}>
          <Text fontSize="sm" color="gray.500">
            Total Paid:
          </Text>
          <Text fontSize="sm" fontWeight="700" color="teal.700">
            {total.toLocaleString('en-IN')}
          </Text>
        </HStack>
      )}
    </Box>
  )
}
