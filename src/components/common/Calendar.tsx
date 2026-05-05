import { Box, Button, Grid, Text, HStack } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return days
}

interface CalendarProps {
  value?: Date
  onChange?: (date: Date) => void
}

export function Calendar({ value, onChange }: CalendarProps) {
  const [current, setCurrent] = useState(value ?? new Date())

  const year = current.getFullYear()
  const month = current.getMonth()

  const days = getCalendarDays(year, month)

  return (
    <Box bg="white">
      <HStack justify="space-between" mb={3}>
        <Button
          size="sm"
          variant="solid"
          color="gray.700"
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
        >
          <ChevronLeft size={16} />
        </Button>

        <Text fontWeight="600">
          {current.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <Button
          size="sm"
          variant="solid"
          color="gray.700"
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
        >
          <ChevronRight size={16} />
        </Button>
      </HStack>

      <Grid templateColumns="repeat(7, 1fr)" mb={2}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} fontSize="sm" textAlign="center" color="gray.500">
            {d}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {days.map((day, i) => {
          if (!day) return <Box key={i} h="32px" />

          const date = new Date(year, month, day)
          const selected = value && date.toDateString() === value.toDateString()

          return (
            <Button
              key={i}
              size="sm"
              h="32px"
              w="32px"
              p={0}
              variant={selected ? 'solid' : 'ghost'}
              colorPalette={selected ? 'blue' : undefined}
              color={selected ? 'white' : 'gray.800'} // 🔑
            >
              {day}
            </Button>
          )
        })}
      </Grid>
    </Box>
  )
}
