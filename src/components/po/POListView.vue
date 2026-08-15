<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePurchaseOrders } from '@/composables/usePurchaseOrders'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-vue-next'

const route = useRoute()
const { purchaseOrderList, loading, fetchRecent } = usePurchaseOrders()

const searchQuery = ref((route.query.q as string) || '')

const filteredPOs = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return purchaseOrderList.value
  return purchaseOrderList.value.filter(po =>
    po.id.toLowerCase().includes(q) || po.client?.name?.toLowerCase().includes(q)
  )
})

onMounted(() => fetchRecent(50))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Purchase Orders</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'purchase-order-create' }">
          <Plus data-icon="inline-start" />
          New Purchase Order
        </RouterLink>
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full mb-2" />
        </div>

        <Empty v-else-if="filteredPOs.length === 0 && searchQuery">
          <EmptyHeader>
            <EmptyTitle>No matching purchase orders</EmptyTitle>
            <EmptyDescription>No purchase orders match "{{ searchQuery }}".</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty v-else-if="filteredPOs.length === 0">
          <EmptyHeader>
            <EmptyTitle>No purchase orders yet</EmptyTitle>
            <EmptyDescription>Create your first purchase order to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RouterLink :to="{ name: 'purchase-order-create' }">
              <Button>Create Purchase Order</Button>
            </RouterLink>
          </EmptyContent>
        </Empty>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase Order Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead class="text-right">Deliveries</TableHead>
              <TableHead class="text-right">Products</TableHead>
              <TableHead class="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="po in filteredPOs" :key="po.id">
              <TableCell>
                <RouterLink
                  :to="{ name: 'purchase-order-detail', params: { poNumber: po.id } }"
                  class="font-medium hover:underline"
                >
                  {{ po.id }}
                </RouterLink>
              </TableCell>
              <TableCell>{{ po.client?.name }}</TableCell>
              <TableCell class="text-right">{{ po.deliveries?.[0]?.count ?? 0 }}</TableCell>
              <TableCell class="text-right">{{ po.po_products?.[0]?.count ?? 0 }}</TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatDate(po.created_at) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
