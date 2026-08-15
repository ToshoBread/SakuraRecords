<script setup lang="ts">
import type { PurchaseOrder } from '@/composables/usePurchaseOrders'
import { RouterLink } from 'vue-router'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

defineProps<{
  pos: PurchaseOrder[]
  loading: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">Recent Purchase Orders</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex flex-col gap-3">
        <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
      </div>

      <Empty v-else-if="pos.length === 0">
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

      <div v-else class="flex flex-col gap-2">
        <RouterLink
          v-for="po in pos"
          :key="po.id"
          :to="{ name: 'purchase-order-detail', params: { purchaseOrderNumber: po.id } }"
          class="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted"
        >
          <div>
            <p class="text-sm font-medium">{{ po.id }}</p>
            <p class="text-xs text-muted-foreground">{{ po.client?.name }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground">{{ formatDate(po.created_at) }}</p>
            <p class="text-xs text-muted-foreground">
              {{ po.deliveries?.[0]?.count ?? 0 }} deliveries
            </p>
          </div>
        </RouterLink>
      </div>
    </CardContent>
  </Card>
</template>
