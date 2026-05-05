import { Box, Card, Heading } from '@chakra-ui/react'
import { TinyLineChart, TinyAreaChart, TinyBarChart } from '../charts'
import { useCountUp } from '@/hooks/useCountUp'

interface DisplayCardProps {
  title?: string
  highlight?: string | number
  description?: string
  graph?: boolean
  graphType?: 'line' | 'area' | 'bar'
  bgColor?: string
  textColor?: string
  animate?: boolean
}

const DisplayCard = ({
  title = '',
  highlight,
  description,
  graph = false,
  graphType = 'line',
  bgColor = 'white',
  textColor = 'gray.800',
  animate = false,
}: DisplayCardProps) => {
  const isNumber = typeof highlight === 'number'
  const animatedValue = animate && isNumber ? useCountUp(Number(highlight), 1500) : highlight
  return (
    <Card.Root
      w="100%"
      minH="160px"
      shadow={'lightGray'}
      bg={bgColor}
      color={textColor}
      borderRadius="lg"
      border={0}
      position="relative"
      overflow="hidden"
      p={4}
      transition="all 0.2s ease-in-out"
    >
      <Card.Body p={0}>
        <Card.Title mb="2">{title}</Card.Title>
        <Heading size="2xl">{animatedValue}</Heading>
        <Card.Description>{description}</Card.Description>
      </Card.Body>

      {graph && (
        <Box
          position="absolute"
          bottom="10px"
          right="10px"
          w={{ base: '70px', sm: '90px', md: '110px' }}
          h={{ base: '50px', sm: '60px', md: '70px' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          {graphType === 'line' && <TinyLineChart />}
          {graphType === 'area' && <TinyAreaChart />}
          {graphType === 'bar' && <TinyBarChart />}
        </Box>
      )}
    </Card.Root>
  )
}

export default DisplayCard
