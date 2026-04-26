import { useDashboardStats } from '@/hooks/useDashboardStats'
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  ProgressCircle,
  Skeleton,
  Stack,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Boxes,
  ChartNoAxesCombined,
  CreditCard,
  Package2,
  ReceiptText,
  Wallet,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const currency = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

const chartPalette = ['#ea580c', '#0f766e', '#2563eb', '#7c3aed', '#dc2626']
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatCurrency = (value: number) => `Rs. ${currency.format(Math.round(value || 0))}`

const formatPercent = (value: number) => {
  const safe = Number.isFinite(value) ? value : 0
  const sign = safe > 0 ? '+' : ''
  return `${sign}${safe.toFixed(1)}%`
}

const formatCompact = (value: number) => {
  const absoluteValue = Math.abs(value || 0)

  if (absoluteValue >= 10000000) {
    return `${(value / 10000000).toFixed(1)}Cr`
  }

  if (absoluteValue >= 100000) {
    return `${(value / 100000).toFixed(1)}L`
  }

  if (absoluteValue >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return `${Math.round(value || 0)}`
}

const formatDate = (value?: string) => {
  if (!value) {
    return '-'
  }

  return dateFormatter.format(new Date(value))
}

const statusTone = (status?: string) => {
  const normalizedStatus = status?.toLowerCase()

  if (normalizedStatus === 'paid' || normalizedStatus === 'advance') {
    return 'teal'
  }

  if (normalizedStatus === 'partial') {
    return 'orange'
  }

  return 'gray'
}

const DashboardCard = ({
  title,
  subtitle,
  children,
  minH,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  minH?: string | number
}) => {
  return (
    <Box
      bg="rgba(255,255,255,0.86)"
      backdropFilter="blur(14px)"
      border="1px solid rgba(255,255,255,0.75)"
      borderRadius="28px"
      p={{ base: 4, md: 5 }}
      minH={minH}
      boxShadow="0 18px 60px rgba(15,23,42,0.08)"
    >
      <Flex justify="space-between" align="start" mb={4} gap={3}>
        <Box>
          <Heading size="md" color="gray.900">
            {title}
          </Heading>
          {subtitle ? (
            <Text mt={1} fontSize="sm" color="gray.500">
              {subtitle}
            </Text>
          ) : null}
        </Box>
      </Flex>
      {children}
    </Box>
  )
}

const StatTile = ({
  label,
  value,
  helper,
  icon,
  tone = 'dark',
}: {
  label: string
  value: string
  helper: string
  icon: React.ReactNode
  tone?: 'dark' | 'warm' | 'cool'
}) => {
  const backgroundByTone = {
    dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    warm: 'linear-gradient(135deg, #9a3412 0%, #f97316 100%)',
    cool: 'linear-gradient(135deg, #115e59 0%, #14b8a6 100%)',
  }

  return (
    <Box
      p={5}
      borderRadius="26px"
      color="white"
      bg={backgroundByTone[tone]}
      boxShadow="0 18px 40px rgba(15,23,42,0.16)"
    >
      <Flex justify="space-between" align="start" gap={3}>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700">
            {label}
          </Text>
          <Text
            mt={2}
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="800"
            letterSpacing="-0.03em"
          >
            {value}
          </Text>
          <Text mt={2} fontSize="sm" color="whiteAlpha.800">
            {helper}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          w="44px"
          h="44px"
          borderRadius="18px"
          bg="whiteAlpha.200"
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <Flex minH="220px" align="center" justify="center">
    <Text color="gray.500">{message}</Text>
  </Flex>
)

const DashboardSkeleton = () => {
  return (
    <Stack gap={6}>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} h="136px" borderRadius="26px" />
        ))}
      </Grid>
      <Grid templateColumns={{ base: '1fr', xl: '1.4fr 0.8fr' }} gap={4}>
        <Skeleton h="380px" borderRadius="28px" />
        <Skeleton h="380px" borderRadius="28px" />
      </Grid>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
        <Skeleton h="360px" borderRadius="28px" />
        <Skeleton h="360px" borderRadius="28px" />
      </Grid>
    </Stack>
  )
}

export function DashboardGrid() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardStats()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return (
      <Alert.Root status="error" borderRadius="24px" bg="red.50" borderColor="red.100">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Dashboard data could not be loaded.</Alert.Title>
          <Alert.Description>
            Try again to fetch the latest sales, stock, and due summaries.
          </Alert.Description>
        </Alert.Content>
        <Button size="sm" ml="auto" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert.Root>
    )
  }

  const salesVsPurchases = data.charts.daily7.map((item) => ({
    label: item.label,
    sales: item.sales,
    purchases: item.purchases,
  }))

  const monthlyPerformance = data.charts.monthly6.map((item) => ({
    label: item.label,
    sales: item.sales,
    purchases: item.purchases,
    profit: item.profit || 0,
  }))

  const customerAdvanceCoverage =
    data.sales.thisMonth.total > 0
      ? Math.min((data.due.customerAdvance.total / data.sales.thisMonth.total) * 100, 100)
      : 0

  const exploreCards = [
    {
      title: 'Collections Focus',
      caption: 'Customer due and payment risk',
      value: formatCurrency(data.kpis.exposure.receivable),
      helper: `${data.due.customerDue.count} customers pending collection`,
      tone: 'orange.50',
      border: 'orange.100',
    },
    {
      title: 'Inventory Risk',
      caption: 'Low and out-of-stock pressure',
      value: `${data.stock.outOfStock.count + data.stock.lowStock.count}`,
      helper: `${data.stock.outOfStock.count} out, ${data.stock.lowStock.count} low stock`,
      tone: 'red.50',
      border: 'red.100',
    },
    {
      title: 'Cashflow Health',
      caption: 'Current month net cashflow',
      value: formatCurrency(data.kpis.cashflow.netCashflowThisMonth),
      helper: `Sales ${formatCurrency(data.kpis.cashflow.salesInflowThisMonth)} vs Purchases ${formatCurrency(data.kpis.cashflow.purchaseOutflowThisMonth)}`,
      tone: 'teal.50',
      border: 'teal.100',
    },
    {
      title: 'Growth Signal',
      caption: 'Month-over-month momentum',
      value: formatPercent(data.kpis.growth.salesMoMPercent),
      helper: `Profit trend ${formatPercent(data.kpis.growth.profitMoMPercent)}`,
      tone: 'blue.50',
      border: 'blue.100',
    },
  ]

  return (
    <Stack gap={6}>
      <Box
        p={{ base: 5, md: 7 }}
        borderRadius="34px"
        color="white"
        bg="linear-gradient(125deg, #0f172a 0%, #111827 38%, #0f766e 100%)"
        boxShadow="0 30px 90px rgba(15,23,42,0.18)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset="0"
          bg="radial-gradient(circle at top right, rgba(249,115,22,0.30), transparent 28%), radial-gradient(circle at bottom left, rgba(56,189,248,0.18), transparent 24%)"
        />
        <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6} position="relative">
          <Stack gap={4}>
            <Badge
              alignSelf="start"
              px={3}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.200"
              color="orange.200"
              fontWeight="700"
              letterSpacing="0.06em"
            >
              Business pulse
            </Badge>
            <Box>
              <Heading
                fontSize={{ base: '3xl', md: '5xl' }}
                lineHeight="0.96"
                letterSpacing="-0.05em"
              >
                See profit, cashflow, dues, and stock decisions in one place.
              </Heading>
              <Text maxW="680px" mt={3} color="whiteAlpha.800" fontSize={{ base: 'md', md: 'lg' }}>
                Faster business decisions with clear signals: what is selling, where money is stuck,
                and what needs action today.
              </Text>
            </Box>

            <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap={3}>
              <Box bg="whiteAlpha.100" p={4} borderRadius="24px">
                <Text fontSize="sm" color="whiteAlpha.700">
                  This month sales
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="800">
                  {formatCurrency(data.sales.thisMonth.total)}
                </Text>
                <HStack mt={2} color="emerald.200" fontSize="sm">
                  <ArrowUpRight size={16} />
                  <Text>{data.sales.thisMonth.count} invoices closed</Text>
                </HStack>
              </Box>

              <Box bg="whiteAlpha.100" p={4} borderRadius="24px">
                <Text fontSize="sm" color="whiteAlpha.700">
                  Net cashflow
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="800">
                  {formatCurrency(data.kpis.cashflow.netCashflowThisMonth)}
                </Text>
                <HStack mt={2} color="orange.200" fontSize="sm">
                  <ArrowDownRight size={16} />
                  <Text>
                    In {formatCurrency(data.kpis.cashflow.salesInflowThisMonth)} out{' '}
                    {formatCurrency(data.kpis.cashflow.purchaseOutflowThisMonth)}
                  </Text>
                </HStack>
              </Box>

              <Box bg="whiteAlpha.100" p={4} borderRadius="24px">
                <Text fontSize="sm" color="whiteAlpha.700">
                  MoM sales growth
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="800">
                  {formatPercent(data.kpis.growth.salesMoMPercent)}
                </Text>
                <Text mt={2} fontSize="sm" color="whiteAlpha.800">
                  Profit trend {formatPercent(data.kpis.growth.profitMoMPercent)}
                </Text>
              </Box>
            </Grid>
          </Stack>

          <DashboardCard
            title="Control tower"
            subtitle="At-a-glance operational counts"
            minH="100%"
          >
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              {[
                { label: 'Products', value: data.totals.products, icon: <Package2 size={16} /> },
                { label: 'Customers', value: data.totals.customers, icon: <Users size={16} /> },
                { label: 'Categories', value: data.totals.categories, icon: <Boxes size={16} /> },
                {
                  label: 'Suppliers',
                  value: data.totals.suppliers,
                  icon: <CreditCard size={16} />,
                },
              ].map((item) => (
                <Box key={item.label} p={4} borderRadius="22px" bg="gray.50">
                  <HStack justify="space-between" mb={3} color="gray.500">
                    <Text fontSize="sm">{item.label}</Text>
                    {item.icon}
                  </HStack>
                  <Text fontSize="3xl" fontWeight="800" color="gray.900">
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Grid>

            <Box
              mt={5}
              p={4}
              borderRadius="24px"
              bg="orange.50"
              border="1px solid"
              borderColor="orange.100"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="700" color="gray.900">
                  Customer advance coverage
                </Text>
                <Text fontSize="sm" color="orange.700">
                  {Math.round(customerAdvanceCoverage)}%
                </Text>
              </HStack>
              <ProgressCircle.Root
                value={customerAdvanceCoverage}
                size="xl"
                thickness="8px"
                colorPalette="orange"
              >
                <ProgressCircle.Circle>
                  <ProgressCircle.Track />
                  <ProgressCircle.Range strokeLinecap="round" />
                </ProgressCircle.Circle>
                <ProgressCircle.ValueText fontWeight="800" color="gray.900" />
              </ProgressCircle.Root>
              <Text mt={3} fontSize="sm" color="gray.600">
                Based on current month sales against customer advance already recorded.
              </Text>
            </Box>
          </DashboardCard>
        </Grid>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4}>
        <StatTile
          label="Sales this month"
          value={formatCurrency(data.sales.thisMonth.total)}
          helper={`${data.sales.thisMonth.count} orders in the current month`}
          icon={<ReceiptText size={22} />}
          tone="warm"
        />
        <StatTile
          label="Receivable"
          value={formatCurrency(data.kpis.exposure.receivable)}
          helper={`${data.due.customerDue.count} customers pending`}
          icon={<Wallet size={22} />}
          tone="dark"
        />
        <StatTile
          label="Payable"
          value={formatCurrency(data.kpis.exposure.payable)}
          helper={`${data.due.supplierDue.count} suppliers pending`}
          icon={<Package2 size={22} />}
          tone="cool"
        />
        <StatTile
          label="Net exposure"
          value={formatCurrency(data.kpis.exposure.netExposure)}
          helper={`Advance buffer ${formatCurrency(data.kpis.exposure.customerAdvance)}`}
          icon={<BadgeIndianRupee size={22} />}
          tone="dark"
        />
      </Grid>

      <DashboardCard
        title="Explore Your Business"
        subtitle="Start with the section that needs immediate attention"
      >
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={3}>
          {exploreCards.map((card) => (
            <Box
              key={card.title}
              p={4}
              borderRadius="22px"
              bg={card.tone}
              border="1px solid"
              borderColor={card.border}
            >
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
                {card.caption}
              </Text>
              <Text mt={2} fontSize="xl" fontWeight="800" color="gray.900">
                {card.value}
              </Text>
              <Text mt={1.5} fontSize="sm" color="gray.600">
                {card.helper}
              </Text>
            </Box>
          ))}
        </Grid>
      </DashboardCard>

      <Grid templateColumns={{ base: '1fr', xl: '1.45fr 0.95fr' }} gap={4}>
        <DashboardCard
          title="Sales vs purchases"
          subtitle="Last 7 days movement with daily values"
          minH="380px"
        >
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesVsPurchases}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={48}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f97316"
                  fill="url(#salesGradient)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#0f766e"
                  fill="url(#purchaseGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </DashboardCard>

        <DashboardCard
          title="Sales payment mix"
          subtitle="Revenue split by payment status"
          minH="380px"
        >
          {data.charts.salesByStatus.some((item) => item.value > 0) ? (
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.salesByStatus}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={4}
                  >
                    {data.charts.salesByStatus.map((entry, index) => (
                      <Cell key={entry.label} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState message="No paid, partial, or advance sales recorded yet." />
          )}
        </DashboardCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1.1fr 0.9fr' }} gap={4}>
        <DashboardCard
          title="Monthly performance"
          subtitle="6-month trend for sales, purchases, and profit"
          minH="370px"
        >
          <Box h="290px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyPerformance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={44}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="sales" fill="#f97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="purchases" fill="#0f766e" radius={[8, 8, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DashboardCard>

        <DashboardCard
          title="Stock by category"
          subtitle="Units currently in inventory"
          minH="370px"
        >
          {data.charts.stockByCategory.length ? (
            <Box h="290px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.charts.stockByCategory}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={formatCompact}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#334155', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip formatter={(value: number) => `${formatCompact(value)} units`} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState message="No category stock data is available yet." />
          )}
        </DashboardCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '0.9fr 1.1fr' }} gap={4}>
        <DashboardCard
          title="Collections and risk"
          subtitle="Outstanding dues, advances, and inventory alerts"
          minH="100%"
        >
          <Stack gap={4}>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3}>
              <Box p={4} borderRadius="22px" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                  Customer due
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="800" color="gray.900">
                  {formatCurrency(data.due.customerDue.total)}
                </Text>
                <Text mt={1} fontSize="sm" color="gray.500">
                  {data.due.customerDue.count} customers pending collection
                </Text>
              </Box>
              <Box p={4} borderRadius="22px" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                  Supplier due
                </Text>
                <Text mt={2} fontSize="2xl" fontWeight="800" color="gray.900">
                  {formatCurrency(data.due.supplierDue.total)}
                </Text>
                <Text mt={1} fontSize="sm" color="gray.500">
                  {data.due.supplierDue.count} supplier accounts open
                </Text>
              </Box>
            </Grid>

            <Box
              p={4}
              borderRadius="24px"
              bg="orange.50"
              border="1px solid"
              borderColor="orange.100"
            >
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontWeight="700" color="gray.900">
                    Inventory alerts
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Watch low stock and out of stock before billing is blocked.
                  </Text>
                </Box>
                <AlertTriangle size={18} color="#ea580c" />
              </HStack>

              <Grid templateColumns="repeat(2, 1fr)" gap={3} mt={4}>
                <Box p={3} borderRadius="18px" bg="white">
                  <Text fontSize="sm" color="gray.500">
                    Out of stock
                  </Text>
                  <Text fontSize="2xl" fontWeight="800" color="gray.900">
                    {data.stock.outOfStock.count}
                  </Text>
                </Box>
                <Box p={3} borderRadius="18px" bg="white">
                  <Text fontSize="sm" color="gray.500">
                    Low stock
                  </Text>
                  <Text fontSize="2xl" fontWeight="800" color="gray.900">
                    {data.stock.lowStock.count}
                  </Text>
                </Box>
              </Grid>
            </Box>

            <Box p={4} borderRadius="24px" bg="teal.50" border="1px solid" borderColor="teal.100">
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="700" color="gray.900">
                  Attendance snapshot
                </Text>
                <ChartNoAxesCombined size={18} color="#0f766e" />
              </HStack>
              <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                {[
                  { label: 'Present', value: data.attendance.today.present },
                  { label: 'Absent', value: data.attendance.today.absent },
                  { label: 'Leave', value: data.attendance.today.leave },
                  { label: 'Staff', value: data.attendance.today.totalStaff },
                ].map((item) => (
                  <Box key={item.label} p={3} borderRadius="18px" bg="white">
                    <Text fontSize="xs" color="gray.500">
                      {item.label}
                    </Text>
                    <Text fontSize="xl" fontWeight="800" color="gray.900">
                      {item.value}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DashboardCard>

        <DashboardCard
          title="Recent sales and purchases"
          subtitle="Latest transactions flowing through the business"
          minH="100%"
        >
          <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="700" color="gray.900" mb={3}>
                Recent sales
              </Text>
              <Box overflowX="auto">
                <Table.Root size="sm" variant="subtle">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Invoice</Table.ColumnHeader>
                      <Table.ColumnHeader>Customer</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.recent.sales.map((sale) => (
                      <Table.Row key={sale._id}>
                        <Table.Cell>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="600">{sale.invoiceNumber}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(sale.saleDate)}
                            </Text>
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          <VStack align="start" gap={1}>
                            <Text>{sale.customerName}</Text>
                            <Badge colorPalette={statusTone(sale.paymentStatus)}>
                              {sale.paymentStatus}
                            </Badge>
                          </VStack>
                        </Table.Cell>
                        <Table.Cell textAlign="end">{formatCurrency(sale.totalAmount)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="700" color="gray.900" mb={3}>
                Recent purchases
              </Text>
              <Box overflowX="auto">
                <Table.Root size="sm" variant="subtle">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Invoice</Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.recent.purchases.map((purchase) => (
                      <Table.Row key={purchase._id}>
                        <Table.Cell>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="600">{purchase.invoiceNumber}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(purchase.purchaseDate)}
                            </Text>
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={statusTone(purchase.paymentStatus)}>
                            {purchase.paymentStatus}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                          {formatCurrency(purchase.totalAmount)}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Box>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '0.95fr 1.05fr' }} gap={4}>
        <DashboardCard
          title="Top customers"
          subtitle="Highest purchase activity and balance profile"
          minH="320px"
        >
          <Stack gap={3}>
            {data.top.customers.length ? (
              data.top.customers.map((customer, index) => (
                <Flex
                  key={customer._id}
                  justify="space-between"
                  align="center"
                  p={4}
                  borderRadius="22px"
                  bg={index === 0 ? 'orange.50' : 'gray.50'}
                >
                  <VStack align="start" gap={0}>
                    <Text fontWeight="700" color="gray.900">
                      {customer.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {customer.mobileNumber}
                    </Text>
                  </VStack>
                  <VStack align="end" gap={0}>
                    <Text fontWeight="700" color="gray.900">
                      {formatCurrency(customer.totalPurchases)}
                    </Text>
                    <Text fontSize="sm" color={customer.balance < 0 ? 'teal.600' : 'orange.600'}>
                      Balance {formatCurrency(customer.balance)}
                    </Text>
                  </VStack>
                </Flex>
              ))
            ) : (
              <EmptyState message="No top customer data is available yet." />
            )}
          </Stack>
        </DashboardCard>

        <DashboardCard
          title="Top selling products"
          subtitle="Best movers by quantity sold and revenue"
          minH="320px"
        >
          {data.charts.topSellingProducts.length ? (
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.charts.topSellingProducts}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={formatCompact}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={42}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatCompact}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    width={42}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'revenue' ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="qtySold" fill="#0f766e" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState message="No selling-product trend has been recorded yet." />
          )}
        </DashboardCard>
      </Grid>

      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
      >
        <Text fontSize="sm" color="gray.500">
          {isFetching ? 'Refreshing dashboard...' : 'Dashboard synced with live merchant stats.'}
        </Text>
        <Button
          size="sm"
          bg="gray.900"
          color="white"
          border="1px solid"
          borderColor="gray.900"
          _hover={{ bg: 'gray.800', color: 'white', borderColor: 'gray.800' }}
          onClick={() => refetch()}
        >
          Refresh dashboard
        </Button>
      </Flex>
    </Stack>
  )
}
