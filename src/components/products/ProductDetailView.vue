<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useAuth } from '@/composables/useAuth'
import { formatDate } from '@/lib/format'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Pencil, Trash2 } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { products, loading, error, fetchAll, softDelete } = useProducts()
const { isAdmin } = useAuth()

const productId = Number(route.params.id)
const deleting = ref(false)

onMounted(() => fetchAll())

const product = computed(() => products.value.find(p => p.id === productId))

async function handleDelete() {
  if (!confirm('Delete this product?')) return
  deleting.value = true
  try {
    await softDelete(productId)
    toast.success('Product deleted')
    router.push({ name: 'product-list' })
  } catch (e: any) {
    toast.error(e.message)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="error" class="text-destructive">{{ error }}</div>

    <Empty v-else-if="!product">
      <EmptyHeader>
        <EmptyTitle>Product not found</EmptyTitle>
        <EmptyDescription>This product may have been deleted.</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <template v-else-if="product">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ product.name }}</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" as-child>
            <RouterLink :to="{ name: 'product-edit', params: { id: product.id } }">
              <Pencil />
              Edit
            </RouterLink>
          </Button>
          <Button v-if="isAdmin" variant="destructive" size="sm" :disabled="deleting" @click="handleDelete">
            <Trash2 />
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Code</span>
            <span class="font-mono">{{ product.code }}</span>
          </div>
          <div v-if="product.description" class="flex justify-between">
            <span class="text-muted-foreground">Description</span>
            <span class="max-w-[300px] text-right">{{ product.description }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Kilograms per unit</span>
            <span>{{ product.kg }} kg</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created</span>
            <span>{{ formatDate(product.created_at) }}</span>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
