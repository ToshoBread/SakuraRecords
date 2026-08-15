<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-vue-next'

const route = useRoute()
const { products, loading, fetchAll } = useProducts()

const searchQuery = ref((route.query.q as string) || '')

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
  )
})

onMounted(() => fetchAll())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Products</h1>
      <Button as-child size="sm">
        <RouterLink :to="{ name: 'product-create' }">
          <Plus data-icon="inline-start" />
          New Product
        </RouterLink>
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-4">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full mb-2" />
        </div>

        <Empty v-else-if="filteredProducts.length === 0 && searchQuery">
          <EmptyHeader>
            <EmptyTitle>No matching products</EmptyTitle>
            <EmptyDescription>No products match "{{ searchQuery }}".</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty v-else-if="filteredProducts.length === 0">
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
              <TableHead>Description</TableHead>
              <TableHead class="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell>
                <RouterLink
                  :to="{ name: 'product-detail', params: { id: product.id } }"
                  class="font-medium hover:underline"
                >
                  {{ product.code }}
                </RouterLink>
              </TableCell>
              <TableCell>{{ product.name }}</TableCell>
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
    </Card>
  </div>
</template>
