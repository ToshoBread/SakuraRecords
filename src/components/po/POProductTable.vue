<script setup lang="ts">
import type { ProductWithRemaining } from '@/composables/usePurchaseOrder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'

defineProps<{
  products: ProductWithRemaining[]
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Products</CardTitle>
    </CardHeader>
    <CardContent>
      <Empty v-if="products.length === 0">
        <EmptyHeader>
          <EmptyTitle>No products on this purchase order</EmptyTitle>
          <EmptyDescription>Add products to this purchase order.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead class="hidden sm:table-cell">Code</TableHead>
            <TableHead class="hidden sm:table-cell text-right">Ordered</TableHead>
            <TableHead class="hidden sm:table-cell text-right">Shipped</TableHead>
            <TableHead class="text-right">Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="pp in products" :key="pp.productid">
            <TableCell class="font-medium">{{ pp.product.name }}</TableCell>
            <TableCell class="hidden sm:table-cell font-mono">{{ pp.product.code }}</TableCell>
            <TableCell class="hidden sm:table-cell text-right">{{ pp.ordered_quantity }}</TableCell>
            <TableCell class="hidden sm:table-cell text-right">{{ pp.shipped }}</TableCell>
            <TableCell class="text-right">
              <Badge :variant="pp.remaining === 0 ? 'secondary' : 'default'">
                {{ pp.remaining }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
