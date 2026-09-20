<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useDebounceFn } from '@vueuse/core'
import { usePurchaseOrders } from '@/composables/usePurchaseOrders'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from '@lucide/vue'
import Pagination from '@/components/shared/Pagination.vue'

const route = useRoute()
const router = useRouter()
const { purchaseOrderList, loading, fetchPage, currentPage, pageSize, totalItems, totalPages } = usePurchaseOrders()
const isMobile = useMediaQuery('(max-width: 639px)')

const searchQuery = ref((route.query.q as string) || '')

const loadPage = (page: number = 1, search: string = searchQuery.value) => {
  fetchPage(page, search)
}

onMounted(() => loadPage(1))

watch(currentPage, (newPage) => {
  loadPage(newPage, searchQuery.value)
})

watch(pageSize, () => {
  currentPage.value = 1
  loadPage(1)
})

const debouncedSearch = useDebounceFn((query: string) => {
  currentPage.value = 1
  loadPage(1, query)
}, 300)

watch(searchQuery, (q) => {
  debouncedSearch(q)
})

function goToDetail(poId: string) {
  router.push({ name: 'purchase-order-detail', params: { purchaseOrderNumber: poId } })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Purchase Orders</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'purchase-order-create' }">
          <Plus />
          New Purchase Order
        </RouterLink>
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Search by PO number..." class="pl-10" />
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="flex flex-col gap-2 p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>

        <Empty v-else-if="purchaseOrderList.length === 0 && searchQuery">
          <EmptyHeader>
            <EmptyTitle>No matching purchase orders</EmptyTitle>
            <EmptyDescription>No purchase orders match "{{ searchQuery }}".</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty v-else-if="purchaseOrderList.length === 0">
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

        <!-- Desktop table -->
        <Table v-else-if="!isMobile">
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
            <TableRow
              v-for="po in purchaseOrderList"
              :key="po.id"
              class="cursor-pointer"
              role="link"
              tabindex="0"
              @click="goToDetail(po.id)"
              @keydown.enter="goToDetail(po.id)"
            >
              <TableCell class="font-medium">{{ po.id }}</TableCell>
              <TableCell>{{ po.client?.name }}</TableCell>
              <TableCell class="text-right">{{ po.deliveries?.[0]?.count ?? 0 }}</TableCell>
              <TableCell class="text-right">{{ po.po_products?.[0]?.count ?? 0 }}</TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatDate(po.created_at) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Mobile list -->
        <div v-else class="divide-y">
          <RouterLink
            v-for="po in purchaseOrderList"
            :key="po.id"
            :to="{ name: 'purchase-order-detail', params: { purchaseOrderNumber: po.id } }"
            class="flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ po.id }}</p>
              <p class="mt-0.5 truncate text-sm text-muted-foreground">
                {{ po.client?.name }}
              </p>
            </div>
            <span class="ml-4 shrink-0 text-sm text-muted-foreground">
              {{ formatDate(po.created_at) }}
            </span>
          </RouterLink>
        </div>
      </CardContent>
      <CardFooter v-if="!loading">
        <Pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total-items="totalItems"
          :total-pages="totalPages"
        />
      </CardFooter>
    </Card>
  </div>
</template>
