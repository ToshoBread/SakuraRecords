<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { formatDate } from '@/lib/format'
import { useDebounceFn } from '@vueuse/core'
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
const { products, loading, fetchPage, currentPage, pageSize, totalItems, totalPages } = useProducts()

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

function goToDetail(id: number) {
  router.push({ name: 'product-detail', params: { id } })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Products</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'product-create' }">
          <Plus />
          New Product
        </RouterLink>
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Search by name or code..." class="pl-10" />
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="flex flex-col gap-2 p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>

        <Empty v-else-if="products.length === 0 && searchQuery">
          <EmptyHeader>
            <EmptyTitle>No matching products</EmptyTitle>
            <EmptyDescription>No products match "{{ searchQuery }}".</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty v-else-if="products.length === 0">
          <EmptyHeader>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>Add your first product to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <RouterLink :to="{ name: 'product-create' }">
              <Button>Add Product</Button>
            </RouterLink>
          </EmptyContent>
        </Empty>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead class="text-right">kg/unit</TableHead>
              <TableHead>Description</TableHead>
              <TableHead class="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="product in products" :key="product.id" class="cursor-pointer"
              role="link" tabindex="0"
              @click="goToDetail(product.id)"
              @keydown.enter="goToDetail(product.id)">
              <TableCell class="font-medium">{{ product.code }}</TableCell>
              <TableCell>{{ product.name }}</TableCell>
              <TableCell class="text-right">{{ product.kg }} kg</TableCell>
              <TableCell class="text-muted-foreground max-w-[200px] truncate">
                {{ product.description || '—' }}
              </TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatDate(product.created_at) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
