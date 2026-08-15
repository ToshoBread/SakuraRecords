<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { usePOs } from '@/composables/usePOs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-vue-next'

const { poList, loading, fetchRecent } = usePOs()

onMounted(() => fetchRecent(50))

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Purchase Orders</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'po-create' }">
          <Plus data-icon="inline-start" />
          New PO
        </RouterLink>
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full mb-2" />
        </div>

        <Empty v-else-if="poList.length === 0">
          <EmptyHeader>
            <EmptyTitle>No purchase orders yet</EmptyTitle>
            <EmptyDescription>Create your first PO to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RouterLink :to="{ name: 'po-create' }">
              <Button>Create PO</Button>
            </RouterLink>
          </EmptyContent>
        </Empty>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead class="text-right">Deliveries</TableHead>
              <TableHead class="text-right">Products</TableHead>
              <TableHead class="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="po in poList" :key="po.id">
              <TableCell>
                <RouterLink
                  :to="{ name: 'po-detail', params: { poNumber: po.id } }"
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
