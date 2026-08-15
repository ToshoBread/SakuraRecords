<script setup lang="ts">
import type { Delivery } from '@/composables/usePO'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{
  deliveries: Delivery[]
  formatCurrency: (amount: number) => string
}>()

const emit = defineEmits<{
  edit: [delivery: Delivery]
  delete: [id: number]
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Deliveries</CardTitle>
    </CardHeader>
    <CardContent>
      <Empty v-if="deliveries.length === 0">
        <EmptyHeader>
          <EmptyTitle>No deliveries yet</EmptyTitle>
          <EmptyDescription>Add a delivery to record shipment details.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead class="text-right">Qty</TableHead>
              <TableHead class="text-right">Unit Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead class="text-right">Terms (days)</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead class="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="d in deliveries" :key="d.id">
              <TableCell class="font-medium">{{ d.product.name }}</TableCell>
              <TableCell class="text-right">{{ d.shipped_quantity }}</TableCell>
              <TableCell class="text-right">{{ formatCurrency(d.unit_price) }}</TableCell>
              <TableCell>{{ formatDate(d.delivery_date) }}</TableCell>
              <TableCell class="text-right">{{ d.payment_terms }}</TableCell>
              <TableCell>
                <Badge :variant="d.paid ? 'secondary' : 'destructive'">
                  {{ d.paid ? 'Paid' : 'Unpaid' }}
                </Badge>
              </TableCell>
              <TableCell>{{ d.address.name }}</TableCell>
              <TableCell>{{ d.transaction_document.document }}</TableCell>
              <TableCell>{{ d.delivery_requirement.requirement }}</TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button variant="ghost" size="sm" @click="emit('edit', d)">
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="emit('delete', d.id)">
                    <Trash2 class="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
