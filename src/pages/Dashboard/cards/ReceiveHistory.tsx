import { Card } from '../Card'
import { Table } from '@chakra-ui/react'

export function ReceiveHistory() {
  return (
    <Card>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row bg={'white'}>
            <Table.ColumnHeader color="gray.700">Date</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.700">Receive#</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.700">Vendor</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end" color="gray.700">
              Qty
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row bg="white">
            <Table.Cell color="gray.800">2025-01-07</Table.Cell>
            <Table.Cell color="blue.600">PR-10136</Table.Cell>
            <Table.Cell color="gray.800">John Smith</Table.Cell>
            <Table.Cell textAlign="end" fontWeight="600">
              2427
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Card>
  )
}
